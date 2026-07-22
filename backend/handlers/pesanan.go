package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
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
	AlamatPengiriman string                `json:"alamat_pengiriman" binding:"required"`
	Telepon          string                `json:"telepon" binding:"required"`
	MetodePembayaran string                `json:"metode_pembayaran" binding:"required"` // 'transfer_bank', 'qris'
	KodePromo        string                `json:"kode_promo"`                           // Opsional
	Items            []ItemCheckoutRequest `json:"items" binding:"required,gt=0"`
}

// StatusUpdateRequest mewakili input perubahan status pesanan oleh admin
type StatusUpdateRequest struct {
	Status string `json:"status" binding:"required"`
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
		// Ambil menu dan kunci baris untuk update stok aman
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&menu, itemReq.MenuID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Menu dengan ID %d tidak ditemukan", itemReq.MenuID)})
			return
		}

		// Cek ketersediaan stok
		if menu.Stok < itemReq.Jumlah {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Stok tidak mencukupi untuk menu '%s'. Stok tersedia: %d", menu.Nama, menu.Stok)})
			return
		}

		// Kurangi stok menu
		menu.Stok -= itemReq.Jumlah
		menu.Tersedia = menu.Stok > 0
		if err := tx.Save(&menu).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui stok menu"})
			return
		}

		// Hitung subtotal dan buat item pesanan
		subtotal := menu.Harga * itemReq.Jumlah
		totalHarga += subtotal

		itemPesanan := models.ItemPesanan{
			MenuID: itemReq.MenuID,
			Jumlah: itemReq.Jumlah,
			Harga:  menu.Harga, // Catat harga historis
		}
		itemsPesanan = append(itemsPesanan, itemPesanan)
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

	ongkosKirim := 10000
	if totalHarga <= 0 {
		ongkosKirim = 0
	}
	totalDiskon := (totalHarga * diskonPersen) / 100
	totalSetelahDiskon := totalHarga - totalDiskon + ongkosKirim

	// Buat pesanan baru
	pesananBaru := models.Pesanan{
		PenggunaID:       userID,
		TanggalPesanan:   time.Now(),
		TotalHarga:       totalSetelahDiskon,
		Status:           "menunggu_pembayaran",
		AlamatPengiriman: req.AlamatPengiriman,
		Telepon:          req.Telepon,
		MetodePembayaran: req.MetodePembayaran,
		KodePromo:        req.KodePromo,
		Diskon:           diskonPersen,
		ItemPesanan:      itemsPesanan,
	}

	if err := tx.Create(&pesananBaru).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat transaksi pesanan"})
		return
	}

	// Buat transaksi Midtrans Snap jika metode_pembayaran adalah "midtrans"
	if pesananBaru.MetodePembayaran == "midtrans" {
		orderIDStr := fmt.Sprintf("VIPZ-%d-%d", pesananBaru.ID, time.Now().Unix())

		// Siapkan rincian item untuk Midtrans
		var snapItems []midtrans.ItemDetails
		for _, item := range pesananBaru.ItemPesanan {
			var m models.Menu
			tx.First(&m, item.MenuID)
			namaItem := m.Nama
			if len(namaItem) > 45 {
				namaItem = namaItem[:45] + "..."
			}
			if namaItem == "" {
				namaItem = "Menu Pizza"
			}
			snapItems = append(snapItems, midtrans.ItemDetails{
				ID:    fmt.Sprintf("MENU-%d", item.MenuID),
				Price: int64(item.Harga),
				Qty:   int32(item.Jumlah),
				Name:  namaItem,
			})
		}

		// Tambah ongkos kirim sebagai item
		snapItems = append(snapItems, midtrans.ItemDetails{
			ID:    "SHIPPING",
			Price: int64(ongkosKirim),
			Qty:   1,
			Name:  "Ongkos Kirim (Padang)",
		})

		// Ambil data pelanggan
		var peng models.Pengguna
		tx.First(&peng, userID)

		// Jika ada diskon, kita tidak mengirimkan rincian item ke Midtrans
		// karena Midtrans tidak mendukung harga item negatif dan total rincian harus sama dengan GrossAmt.
		var ptrSnapItems *[]midtrans.ItemDetails
		if totalDiskon == 0 {
			ptrSnapItems = &snapItems
		}

		snapReq := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{
				OrderID:  orderIDStr,
				GrossAmt: int64(pesananBaru.TotalHarga),
			},
			Items: ptrSnapItems,
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

		// Simpan Token
		pesananBaru.SnapToken = snapResp.Token
		pesananBaru.MidtransID = orderIDStr // Simpan custom order ID
		if err := tx.Save(&pesananBaru).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan token pembayaran"})
			return
		}
	}

	// Selesaikan transaksi
	tx.Commit()

	// Muat ulang pesanan lengkap dengan relasi untuk notifikasi WA
	config.DB.Preload("ItemPesanan.Menu").Preload("Pengguna").First(&pesananBaru, pesananBaru.ID)

	// Kirim notifikasi WhatsApp ke admin (async, tidak menghambat response API)
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
		"message":    "Pesanan berhasil dibuat!",
		"pesanan_id": pesananBaru.ID,
		"total":      pesananBaru.TotalHarga,
		"snap_token": pesananBaru.SnapToken,
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

// UnggahBuktiBayar mengunggah bukti transfer bank atau QRIS (Customer-Only)
func UnggahBuktiBayar(c *gin.Context) {
	id := c.Param("id")
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var pesanan models.Pesanan
	if err := config.DB.First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	// Pastikan hanya pemilik pesanan yang bisa mengunggah bukti
	if pesanan.PenggunaID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses dilarang! Ini bukan pesanan Anda"})
		return
	}

	// Pastikan pesanan sedang menunggu pembayaran
	if pesanan.Status != "menunggu_pembayaran" && pesanan.Status != "menunggu_validasi" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesanan tidak berada pada status pembayaran aktif"})
		return
	}

	file, err := c.FormFile("bukti")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File bukti transfer wajib diunggah"})
		return
	}

	// Ambil data tambahan dari form (nama bank & pengirim)
	namaBank := c.PostForm("nama_bank")
	namaPengirim := c.PostForm("nama_pengirim")

	dirUpload := "uploads/payments"
	_ = os.MkdirAll(dirUpload, os.ModePerm)

	// Buat nama file unik
	namaFile := fmt.Sprintf("pay_%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	pathFile := filepath.Join(dirUpload, namaFile)

	if err := c.SaveUploadedFile(file, pathFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file bukti pembayaran"})
		return
	}

	// Hapus file bukti pembayaran lama jika ada
	if pesanan.BuktiPembayaran != "" {
		_ = os.Remove(filepath.Join(".", pesanan.BuktiPembayaran))
	}

	// Perbarui status pesanan menjadi menunggu validasi admin
	pesanan.BuktiPembayaran = "/uploads/payments/" + namaFile
	pesanan.Status = "menunggu_validasi"
	if namaBank != "" {
		pesanan.NamaBank = namaBank
	}
	if namaPengirim != "" {
		pesanan.NamaPengirim = namaPengirim
	}

	if err := config.DB.Save(&pesanan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status transaksi"})
		return
	}

	// Kirim notifikasi WhatsApp ke admin bahwa bukti bayar sudah masuk
	go func(p models.Pesanan) {
		var pengguna models.Pengguna
		config.DB.First(&pengguna, p.PenggunaID)
		namaPelanggan := pengguna.Nama
		if namaPelanggan == "" {
			namaPelanggan = p.Telepon
		}
		utils.NotifikasiBuktiBayar(p.ID, namaPelanggan, p.MetodePembayaran, p.TotalHarga)
	}(pesanan)

	c.JSON(http.StatusOK, gin.H{
		"message":              "Bukti pembayaran berhasil diunggah! Mohon tunggu konfirmasi admin.",
		"bukti_pembayaran_url": pesanan.BuktiPembayaran,
	})
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

	// List status valid
	statusValid := map[string]bool{
		"menunggu_pembayaran": true,
		"menunggu_validasi":   true,
		"diproses":            true,
		"dikirim":             true,
		"selesai":             true,
		"dibatalkan":          true,
	}

	if !statusValid[statusBaru] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status pesanan tidak valid"})
		return
	}

	tx := config.DB.Begin()

	// Jika status diubah ke 'dibatalkan' dan status sebelumnya belum dibatalkan/menunggu_pembayaran (tanpa pengurangan stok?)
	// Sebenarnya karena kita mengurangi stok pas checkout (status: menunggu_pembayaran),
	// maka jika dibatalkan, kita HARUS mengembalikan stok menu.
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

	// Jika status diubah KELUAR dari dibatalkan (misal admin tidak sengaja klik batalkan lalu kembalikan),
	// maka kita harus kurangi stok lagi. Namun skenario ini jarang dan bisa diabaikan agar tidak over-complicate.

	pesanan.Status = statusBaru
	
	// Sinkronisasi status pembayaran secara otomatis
	if statusBaru == "diproses" || statusBaru == "dikirim" || statusBaru == "selesai" {
		pesanan.StatusPembayaran = "lunas"
	} else if statusBaru == "dibatalkan" {
		pesanan.StatusPembayaran = "gagal"
	}

	// Tambah jumlah terjual ke menu jika status menjadi 'selesai'
	if statusBaru == "selesai" && statusLama != "selesai" {
		for _, item := range pesanan.ItemPesanan {
			var menu models.Menu
			if err := tx.First(&menu, item.MenuID).Error; err == nil {
				menu.Terjual += item.Jumlah
				tx.Save(&menu)
			}
		}
	}

	if err := tx.Save(&pesanan).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status pesanan"})
		return
	}

	tx.Commit()

	// NOTIFIKASI WA PELANGGAN AMAN (Berjalan di background, tidak bikin error)
	go func(p models.Pesanan, statBaru string) {
		var pesanWA string
		namaPelanggan := "Pelanggan Setia"
		
		// Ambil data pelanggan asli
		var peng models.Pengguna
		config.DB.First(&peng, p.PenggunaID)
		if peng.Nama != "" {
			namaPelanggan = peng.Nama
		}

		if statBaru == "diproses" {
			pesanWA = fmt.Sprintf("Halo %s! 👋\n\nPesanan #%d kamu di Vipizza Padang sudah divalidasi dan sekarang sedang *diproses / dipanggang*. Ditunggu ya, pizza enak segera siap! 🍕🔥", namaPelanggan, p.ID)
		} else if statBaru == "dikirim" {
			pesanWA = fmt.Sprintf("Halo %s! 🛵\n\nPesanan pizza #%d kamu sudah di jalan menuju alamatmu. Siap-siap menikmati ya! 🍕", namaPelanggan, p.ID)
		} else if statBaru == "selesai" {
			pesanWA = fmt.Sprintf("Halo %s! ✅\n\nPesanan #%d telah diselesaikan. Terima kasih sudah memesan di Vipizza Padang! Ditunggu pesanan selanjutnya 🍕🥰", namaPelanggan, p.ID)
		}

		if pesanWA != "" && p.Telepon != "" {
			utils.KirimNotifikasiPelanggan(p.Telepon, pesanWA)
		}
	}(pesanan, statusBaru)

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Status pesanan #%d berhasil diperbarui menjadi '%s'!", pesanan.ID, statusBaru),
		"pesanan": pesanan,
	})
}

// RefreshSnapToken membuat ulang snap token Midtrans untuk pesanan yang tokennya sudah kadaluarsa
func RefreshSnapToken(c *gin.Context) {
	id := c.Param("id")
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var pesanan models.Pesanan
	if err := config.DB.Preload("ItemPesanan.Menu").First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	// Hanya pemilik pesanan yang bisa refresh token
	if pesanan.PenggunaID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses dilarang! Ini bukan pesanan Anda"})
		return
	}

	// Hanya bisa refresh jika pesanan masih menunggu pembayaran
	if pesanan.Status != "menunggu_pembayaran" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesanan ini sudah tidak dalam status menunggu pembayaran"})
		return
	}

	// Hanya untuk pesanan Midtrans
	if pesanan.MetodePembayaran != "midtrans" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesanan ini tidak menggunakan metode Midtrans"})
		return
	}

	// Buat order ID baru yang unik (pakai timestamp baru)
	orderIDStr := fmt.Sprintf("VIPZ-%d-%d", pesanan.ID, time.Now().Unix())

	// Siapkan item detail untuk Midtrans
	var snapItems []midtrans.ItemDetails
	for _, item := range pesanan.ItemPesanan {
		namaMenu := "Menu Pizza"
		if item.Menu.Nama != "" {
			namaMenu = item.Menu.Nama
		}
		if len(namaMenu) > 45 {
			namaMenu = namaMenu[:45] + "..."
		}
		snapItems = append(snapItems, midtrans.ItemDetails{
			ID:    fmt.Sprintf("MENU-%d", item.MenuID),
			Price: int64(item.Harga),
			Qty:   int32(item.Jumlah),
			Name:  namaMenu,
		})
	}

	// Ambil data pelanggan
	var peng models.Pengguna
	config.DB.First(&peng, userID)

	// Tambah ongkos kirim sebagai item
	ongkosKirim := 10000
	if pesanan.TotalHarga <= 0 {
		ongkosKirim = 0
	}
	snapItems = append(snapItems, midtrans.ItemDetails{
		ID:    "SHIPPING",
		Price: int64(ongkosKirim),
		Qty:   1,
		Name:  "Ongkos Kirim (Padang)",
	})

	// Jika ada diskon, kita tidak mengirimkan rincian item ke Midtrans
	var ptrSnapItems *[]midtrans.ItemDetails
	if pesanan.Diskon == 0 {
		ptrSnapItems = &snapItems
	}

	snapReq := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderIDStr,
			GrossAmt: int64(pesanan.TotalHarga),
		},
		Items: ptrSnapItems,
		CustomerDetail: &midtrans.CustomerDetails{
			FName: peng.Nama,
			Email: peng.Email,
			Phone: pesanan.Telepon,
		},
	}

	snapResp, errSnap := config.SnapClient.CreateTransaction(snapReq)
	if errSnap != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat ulang token Midtrans: " + errSnap.GetMessage()})
		return
	}

	// Perbarui snap_token dan midtrans_id di database
	pesanan.SnapToken = snapResp.Token
	pesanan.MidtransID = orderIDStr
	if err := config.DB.Save(&pesanan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan token baru ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Token pembayaran berhasil diperbarui!",
		"snap_token": snapResp.Token,
	})
}

// prosesStatusDariMidtrans memperbarui status pesanan berdasarkan response Midtrans
func prosesStatusDariMidtrans(pesanan *models.Pesanan) {
	transactionStatusResp, err := config.CoreAPIClient.CheckTransaction(pesanan.MidtransID)
	if err != nil {
		return
	}

	if pesanan.Status == "dikirim" || pesanan.Status == "selesai" || pesanan.Status == "dibatalkan" {
		return
	}

	statusTrans := transactionStatusResp.TransactionStatus
	fraudStatus := transactionStatusResp.FraudStatus

	var newStatus string
	if statusTrans == "capture" {
		if fraudStatus == "challenge" {
			newStatus = "menunggu_validasi"
		} else if fraudStatus == "accept" {
			newStatus = "diproses"
		}
	} else if statusTrans == "settlement" {
		newStatus = "diproses"
	} else if statusTrans == "cancel" || statusTrans == "deny" || statusTrans == "expire" {
		newStatus = "dibatalkan"
	} else if statusTrans == "pending" {
		newStatus = "menunggu_pembayaran"
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
		if newStatus == "diproses" {
			pesanan.StatusPembayaran = "lunas"
		} else if newStatus == "dibatalkan" {
			pesanan.StatusPembayaran = "gagal"
		}
		
		if transactionStatusResp.PaymentType != "" {
			pesanan.MetodePembayaran = transactionStatusResp.PaymentType
		}

		config.DB.Save(pesanan)

		if newStatus == "diproses" {
			go utils.NotifikasiBuktiBayar(pesanan.ID, "Midtrans Auto-Confirm", "Midtrans Payment", pesanan.TotalHarga)
		}
	} else if statusTrans == "settlement" && pesanan.Status == "diproses" {
		pesanan.StatusPembayaran = "lunas"
		if transactionStatusResp.PaymentType != "" {
			pesanan.MetodePembayaran = transactionStatusResp.PaymentType
		}
		config.DB.Save(pesanan)
	}
}

// VerifikasiPembayaran mengecek status pembayaran Midtrans langsung dari frontend
// (solusi untuk webhook yang tidak sampai ke localhost)
func VerifikasiPembayaran(c *gin.Context) {
	id := c.Param("id")
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	peranVal, _ := c.Get("peran")
	peran := peranVal.(string)

	var pesanan models.Pesanan
	if err := config.DB.First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	if peran != "admin" && pesanan.PenggunaID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses dilarang"})
		return
	}

	if pesanan.MetodePembayaran != "midtrans" || pesanan.MidtransID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesanan ini tidak menggunakan Midtrans"})
		return
	}

	prosesStatusDariMidtrans(&pesanan)

	c.JSON(http.StatusOK, gin.H{
		"status_pesanan":    pesanan.Status,
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

	var pesanan models.Pesanan
	if err := config.DB.Where("midtrans_id = ?", orderId).First(&pesanan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	prosesStatusDariMidtrans(&pesanan)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// HapusPesanan menghapus data pesanan dari database (Khusus Admin)
func HapusPesanan(c *gin.Context) {
	id := c.Param("id")
	var pesanan models.Pesanan

	if err := config.DB.First(&pesanan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesanan tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&pesanan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus pesanan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil dihapus"})
}
