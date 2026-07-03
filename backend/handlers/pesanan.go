package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"
	"vipizza/config"
	"vipizza/models"
	"vipizza/utils"

	"github.com/gin-gonic/gin"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

// ItemCheckoutRequest mewakili satu item makanan/minuman yang dicheckout
type ItemCheckoutRequest struct {
	MenuID uint `json:"menu_id" binding:"required"`
	Jumlah int  `json:"jumlah" binding:"required,gt=0"`
}

// CheckoutRequest mewakili data checkout pesanan pelanggan
type CheckoutRequest struct {
	NamaPenerima     string                `json:"nama_penerima"`
	AlamatPengiriman string                `json:"alamat_pengiriman" binding:"required"`
	Telepon          string                `json:"telepon" binding:"required"`
	Catatan          string                `json:"catatan"`
	MetodePembayaran string                `json:"metode_pembayaran" binding:"required"`
	KodePromo        string                `json:"kode_promo"`
	Items            []ItemCheckoutRequest `json:"items" binding:"required,gt=0"`
}

// StatusUpdateRequest mewakili input perubahan status pesanan oleh admin
type StatusUpdateRequest struct {
	Status string `json:"status" binding:"required"`
}

// PaymentStatusUpdateRequest mewakili input perubahan status pembayaran oleh admin
type PaymentStatusUpdateRequest struct {
	StatusPembayaran string `json:"status_pembayaran" binding:"required"`
}

// BuatPesanan menangani proses checkout pesanan pelanggan (Customer-Only)
func BuatPesanan(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data checkout tidak valid"})
		return
	}

	// Mulai transaksi database untuk menjaga integritas stok
	tx := config.DB.Begin()

	var totalHarga int
	var itemsPesanan []models.ItemPesanan

	for _, itemReq := range req.Items {
		var menu models.Menu
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&menu, itemReq.MenuID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Menu dengan ID %d tidak ditemukan", itemReq.MenuID)})
			return
		}

		if menu.Stok < itemReq.Jumlah {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Stok tidak mencukupi untuk menu '%s'. Stok tersedia: %d", menu.Nama, menu.Stok)})
			return
		}

		menu.Stok -= itemReq.Jumlah
		menu.Tersedia = menu.Stok > 0
		if err := tx.Save(&menu).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui stok menu"})
			return
		}

		subtotal := menu.Harga * itemReq.Jumlah
		totalHarga += subtotal

		itemsPesanan = append(itemsPesanan, models.ItemPesanan{
			MenuID: itemReq.MenuID,
			Jumlah: itemReq.Jumlah,
			Harga:  menu.Harga,
		})
	}

	// Validasi dan hitung diskon Promo
	var diskonPersen int
	if req.KodePromo != "" {
		var promo models.Promo
		if err := tx.Where("kode_promo = ?", req.KodePromo).Where("aktif = ?", true).First(&promo).Error; err == nil {
			if time.Now().After(promo.TanggalMulai) && time.Now().Before(promo.TanggalAkhir) {
				diskonPersen = promo.Diskon
			}
		}
	}

	totalDiskon := (totalHarga * diskonPersen) / 100
	totalSetelahDiskon := totalHarga - totalDiskon

	// Tentukan status awal berdasarkan metode pembayaran
	statusAwal := "menunggu_pembayaran"
	statusPembayaranAwal := "belum_dibayar"

	if req.MetodePembayaran == "tunai" {
		statusAwal = "diproses"
	}

	// Buat pesanan baru
	pesananBaru := models.Pesanan{
		PenggunaID:        userID,
		NamaPenerima:      req.NamaPenerima,
		TanggalPesanan:    time.Now(),
		TotalHarga:        totalSetelahDiskon,
		Status:            statusAwal,
		StatusPembayaran:  statusPembayaranAwal,
		AlamatPengiriman:  req.AlamatPengiriman,
		Telepon:           req.Telepon,
		Catatan:           req.Catatan,
		MetodePembayaran:  req.MetodePembayaran,
		KodePromo:         req.KodePromo,
		Diskon:            diskonPersen,
		ItemPesanan:       itemsPesanan,
	}

	if err := tx.Create(&pesananBaru).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat transaksi pesanan"})
		return
	}

	// Buat transaksi Midtrans Snap jika metode_pembayaran adalah "midtrans"
	if pesananBaru.MetodePembayaran == "midtrans" {
		orderIDStr := fmt.Sprintf("VIPZ-%d-%d", pesananBaru.ID, time.Now().Unix())

		var snapItems []midtrans.ItemDetails
		for _, item := range pesananBaru.ItemPesanan {
			var m models.Menu
			tx.First(&m, item.MenuID)
			snapItems = append(snapItems, midtrans.ItemDetails{
				ID:    fmt.Sprintf("MENU-%d", item.MenuID),
				Price: int64(item.Harga),
				Qty:   int32(item.Jumlah),
				Name:  m.Nama,
			})
		}

		var peng models.Pengguna
		tx.First(&peng, userID)

		snapReq := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{
				OrderID:  orderIDStr,
				GrossAmt: int64(pesananBaru.TotalHarga),
			},
			Items: &snapItems,
			CustomerDetail: &midtrans.CustomerDetails{
				FName: peng.Nama,
				Email: peng.Email,
				Phone: req.Telepon,
			},
		}

		snapResp, errSnap := config.SnapClient.CreateTransaction(snapReq)
		if errSnap != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghubungi server Midtrans"})
			return
		}

		pesananBaru.SnapToken = snapResp.Token
		pesananBaru.MidtransID = orderIDStr
		if err := tx.Save(&pesananBaru).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan token pembayaran"})
			return
		}
	}

	tx.Commit()

	config.DB.Preload("ItemPesanan.Menu").Preload("Pengguna").First(&pesananBaru, pesananBaru.ID)

	// Kirim notifikasi WhatsApp ke admin (async)
	go func(p models.Pesanan) {
		var barisMenu []string
		for _, item := range p.ItemPesanan {
			namaMenu := "Menu"
			if item.Menu.Nama != "" {
				namaMenu = item.Menu.Nama
			}
			barisMenu = append(barisMenu, fmt.Sprintf("• %s x%d = Rp %s", namaMenu, item.Jumlah, formatRupiahHandler(item.Harga*item.Jumlah)))
		}
		namaPelanggan := req.Telepon
		if p.Pengguna.Nama != "" {
			namaPelanggan = p.Pengguna.Nama
		}
		utils.NotifikasiPesananBaru(p.ID, namaPelanggan, req.Telepon, req.AlamatPengiriman, p.TotalHarga, strings.Join(barisMenu, "\n"))
	}(pesananBaru)

	c.JSON(http.StatusCreated, gin.H{
		"message":           "Pesanan berhasil dibuat!",
		"pesanan_id":        pesananBaru.ID,
		"total":             pesananBaru.TotalHarga,
		"status":            pesananBaru.Status,
		"status_pembayaran": pesananBaru.StatusPembayaran,
		"snap_token":        pesananBaru.SnapToken,
	})
}

// DashboardPelanggan mengembalikan ringkasan data untuk dashboard pelanggan
func DashboardPelanggan(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var totalPesanan int64
	var pesananDiproses int64
	var pesananSelesai int64
	var pesananDibatalkan int64

	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ?", userID).Count(&totalPesanan)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status IN ?", userID, []string{"diproses", "sedang_diantar"}).Count(&pesananDiproses)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status = ?", userID, "selesai").Count(&pesananSelesai)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status = ?", userID, "dibatalkan").Count(&pesananDibatalkan)

	var pesananTerbaru []models.Pesanan
	config.DB.Preload("ItemPesanan.Menu").Where("pengguna_id = ?", userID).Order("id desc").Limit(5).Find(&pesananTerbaru)

	var user models.Pengguna
	config.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":      user.ID,
			"nama":    user.Nama,
			"email":   user.Email,
			"telepon": user.Telepon,
			"alamat":  user.Alamat,
		},
		"ringkasan": gin.H{
			"total_pesanan":   totalPesanan,
			"pesanan_diproses": pesananDiproses,
			"pesanan_selesai":  pesananSelesai,
			"pesanan_dibatalkan": pesananDibatalkan,
		},
		"pesanan_terbaru": pesananTerbaru,
	})
}

// formatRupiahHandler memformat angka ke format Rupiah Indonesia
func formatRupiahHandler(angka int) string {
	s := fmt.Sprintf("%d", angka)
	n := len(s)
	if n <= 3 {
		return s
	}
	var result strings.Builder
	for i, c := range s {
		if i > 0 && (n-i)%3 == 0 {
			result.WriteByte('.')
		}
		result.WriteRune(c)
	}
	return result.String()
}

// RiwayatPesananSaya menampilkan riwayat pesanan khusus customer yang login (Customer-Only)
func RiwayatPesananSaya(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var daftarPesanan []models.Pesanan
	if err := config.DB.Preload("ItemPesanan.Menu").Where("pengguna_id = ?", userID).Order("id desc").Find(&daftarPesanan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat pesanan"})
		return
	}

	c.JSON(http.StatusOK, daftarPesanan)
}

// DetailPesanan mengambil detail satu pesanan berdasarkan ID (Protected)
func DetailPesanan(c *gin.Context) {
	id := c.Param("id")
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	peranVal, _ := c.Get("peran")
	peran := peranVal.(string)

	var pesanan models.Pesanan
	if err := config.DB.Preload("Pengguna").Preload("ItemPesanan.Menu").First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	// Validasi keamanan: Pelanggan hanya bisa melihat pesanannya sendiri, sedangkan Admin bebas
	if peran != "admin" && pesanan.PenggunaID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses dilarang! Anda tidak berhak melihat pesanan ini"})
		return
	}

	c.JSON(http.StatusOK, pesanan)
}

// AmbilSemuaPesanan menampilkan semua pesanan masuk (Khusus Admin)
func AmbilSemuaPesanan(c *gin.Context) {
	var daftarPesanan []models.Pesanan
	status := c.Query("status")

	query := config.DB.Preload("Pengguna").Preload("ItemPesanan.Menu")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("id desc").Find(&daftarPesanan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pesanan"})
		return
	}

	c.JSON(http.StatusOK, daftarPesanan)
}

// PerbaruiStatusPesanan mengubah status pesanan (Khusus Admin)
func PerbaruiStatusPesanan(c *gin.Context) {
	id := c.Param("id")
	var pesanan models.Pesanan

	if err := config.DB.Preload("ItemPesanan").First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	var req StatusUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status baru wajib dikirim"})
		return
	}

	statusLama := pesanan.Status
	statusBaru := req.Status

	statusValid := map[string]bool{
		"menunggu_pembayaran": true,
		"diproses":            true,
		"sedang_diantar":      true,
		"selesai":             true,
		"dibatalkan":          true,
	}

	if !statusValid[statusBaru] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status pesanan tidak valid"})
		return
	}

	tx := config.DB.Begin()

	if statusBaru == "dibatalkan" && statusLama != "dibatalkan" {
		for _, item := range pesanan.ItemPesanan {
			var menu models.Menu
			if err := tx.First(&menu, item.MenuID).Error; err == nil {
				menu.Stok += item.Jumlah
				menu.Tersedia = menu.Stok > 0
				tx.Save(&menu)
			}
		}
	}

	// Jika status berubah ke "selesai" untuk metode tunai, ubah status pembayaran menjadi lunas
	if statusBaru == "selesai" && pesanan.MetodePembayaran == "tunai" {
		pesanan.StatusPembayaran = "lunas"
	}

	pesanan.Status = statusBaru
	if err := tx.Save(&pesanan).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status pesanan"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message":           fmt.Sprintf("Status pesanan #%d berhasil diperbarui menjadi '%s'!", pesanan.ID, statusBaru),
		"pesanan":           pesanan,
		"status_pembayaran": pesanan.StatusPembayaran,
	})
}

// PerbaruiStatusPembayaran mengubah status pembayaran (Khusus Admin)
func PerbaruiStatusPembayaran(c *gin.Context) {
	id := c.Param("id")
	var pesanan models.Pesanan

	if err := config.DB.First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	var req PaymentStatusUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status pembayaran wajib dikirim"})
		return
	}

	if req.StatusPembayaran != "belum_dibayar" && req.StatusPembayaran != "lunas" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status pembayaran harus 'belum_dibayar' atau 'lunas'"})
		return
	}

	pesanan.StatusPembayaran = req.StatusPembayaran
	if err := config.DB.Save(&pesanan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status pembayaran"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           fmt.Sprintf("Status pembayaran pesanan #%d berhasil diperbarui menjadi '%s'!", pesanan.ID, req.StatusPembayaran),
		"status_pembayaran": pesanan.StatusPembayaran,
	})
}

// MidtransNotification menangani webhook dari Midtrans saat status pembayaran berubah
func MidtransNotification(c *gin.Context) {
	var notificationPayload map[string]interface{}
	if err := c.ShouldBindJSON(&notificationPayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format payload tidak valid"})
		return
	}

	orderId, exists := notificationPayload["order_id"].(string)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order_id tidak ditemukan"})
		return
	}

	// Cek status ke Midtrans CoreAPI menggunakan orderId
	transactionStatusResp, err := config.CoreAPIClient.CheckTransaction(orderId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengecek status ke Midtrans"})
		return
	}

	var pesanan models.Pesanan
	// orderId bentuknya VIPZ-{ID}-{Timestamp}
	if err := config.DB.Where("midtrans_id = ?", orderId).First(&pesanan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	// Jika status sudah selesai atau dibatalkan sebelumnya, biarkan saja
	if pesanan.Status == "selesai" || pesanan.Status == "dibatalkan" {
		c.JSON(http.StatusOK, gin.H{"message": "Status sudah final, diabaikan"})
		return
	}

	statusTrans := transactionStatusResp.TransactionStatus
	fraudStatus := transactionStatusResp.FraudStatus

	var newStatus string
	var newPaymentStatus string

	if statusTrans == "capture" {
		if fraudStatus == "challenge" {
			newStatus = "menunggu_pembayaran"
			newPaymentStatus = "belum_dibayar"
		} else if fraudStatus == "accept" {
			newStatus = "diproses"
			newPaymentStatus = "lunas"
		}
	} else if statusTrans == "settlement" {
		newStatus = "diproses"
		newPaymentStatus = "lunas"
	} else if statusTrans == "cancel" || statusTrans == "deny" || statusTrans == "expire" {
		newStatus = "dibatalkan"
		newPaymentStatus = "belum_dibayar"
	} else if statusTrans == "pending" {
		newStatus = "menunggu_pembayaran"
		newPaymentStatus = "belum_dibayar"
	}

	if newStatus != "" && newStatus != pesanan.Status {
		if newStatus == "dibatalkan" && pesanan.Status != "dibatalkan" {
			tx := config.DB.Begin()
			var items []models.ItemPesanan
			tx.Where("pesanan_id = ?", pesanan.ID).Find(&items)
			for _, item := range items {
				var menu models.Menu
				if err := tx.First(&menu, item.MenuID).Error; err == nil {
					menu.Stok += item.Jumlah
					menu.Tersedia = menu.Stok > 0
					tx.Save(&menu)
				}
			}
			tx.Commit()
		}

		pesanan.Status = newStatus
		if newPaymentStatus != "" {
			pesanan.StatusPembayaran = newPaymentStatus
		}
		config.DB.Save(&pesanan)

		if newStatus == "diproses" {
			go utils.NotifikasiBuktiBayar(pesanan.ID, "Midtrans Auto-Confirm", "Midtrans Payment", pesanan.TotalHarga)
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
