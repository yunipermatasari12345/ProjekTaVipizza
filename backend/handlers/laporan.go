package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
)

// ItemLaporanRingkasan menyimpan data rangkuman per-menu yang terjual
type ItemLaporanRingkasan struct {
	MenuNama     string `json:"menu_nama"`
	JumlahTerjual int    `json:"jumlah_terjual"`
	TotalUang    int    `json:"total_uang"`
}

// LaporanPenjualanJSON menghasilkan rangkuman laporan penjualan (Khusus Admin)
func LaporanPenjualanJSON(c *gin.Context) {
	tipe := c.Query("tipe") // 'harian' atau 'bulanan'
	tanggal := c.Query("tanggal") // YYYY-MM-DD untuk harian
	bulan := c.Query("bulan") // YYYY-MM untuk bulanan

	if tipe != "harian" && tipe != "bulanan" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe laporan harus 'harian' atau 'bulanan'"})
		return
	}

	var pesananList []models.Pesanan
	query := config.DB.Preload("Pengguna").Preload("ItemPesanan.Menu").Where("status = ?", "selesai")

	var labelPeriode string

	if tipe == "harian" {
		if tanggal == "" {
			tanggal = time.Now().Format("2006-01-02")
		}
		query = query.Where("DATE(tanggal_pesanan) = ?", tanggal)
		labelPeriode = tanggal
	} else {
		if bulan == "" {
			bulan = time.Now().Format("2006-01")
		}
		query = query.Where("DATE_FORMAT(tanggal_pesanan, '%Y-%m') = ?", bulan)
		labelPeriode = bulan
	}

	if err := query.Find(&pesananList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data laporan penjualan"})
		return
	}

	// Hitung total transaksi, total pendapatan, dan detail penjualan per-menu
	totalPendapatan := 0
	totalPesananSelesai := len(pesananList)
	petaRingkasan := make(map[uint]*ItemLaporanRingkasan)

	for _, pes := range pesananList {
		totalPendapatan += pes.TotalHarga
		for _, item := range pes.ItemPesanan {
			if ringkasan, ada := petaRingkasan[item.MenuID]; ada {
				ringkasan.JumlahTerjual += item.Jumlah
				ringkasan.TotalUang += (item.Harga * item.Jumlah)
			} else {
				petaRingkasan[item.MenuID] = &ItemLaporanRingkasan{
					MenuNama:     item.Menu.Nama,
					JumlahTerjual: item.Jumlah,
					TotalUang:    (item.Harga * item.Jumlah),
				}
			}
		}
	}

	var ringkasanTerjual []ItemLaporanRingkasan
	for _, v := range petaRingkasan {
		ringkasanTerjual = append(ringkasanTerjual, *v)
	}

	c.JSON(http.StatusOK, gin.H{
		"tipe":                  tipe,
		"periode":               labelPeriode,
		"total_transaksi":       totalPesananSelesai,
		"total_pendapatan":      totalPendapatan,
		"ringkasan_produk":      ringkasanTerjual,
		"pesanan_detail":        pesananList,
	})
}

// LaporanPenjualanPDF membuat file PDF Laporan Penjualan (Khusus Admin)
func LaporanPenjualanPDF(c *gin.Context) {
	tipe := c.Query("tipe")
	tanggal := c.Query("tanggal")
	bulan := c.Query("bulan")

	if tipe != "harian" && tipe != "bulanan" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe laporan wajib 'harian' atau 'bulanan'"})
		return
	}

	var pesananList []models.Pesanan
	query := config.DB.Preload("Pengguna").Preload("ItemPesanan.Menu").Where("status = ?", "selesai")

	var labelPeriode string
	if tipe == "harian" {
		if tanggal == "" {
			tanggal = time.Now().Format("2006-01-02")
		}
		query = query.Where("DATE(tanggal_pesanan) = ?", tanggal)
		labelPeriode = tanggal
	} else {
		if bulan == "" {
			bulan = time.Now().Format("2006-01")
		}
		query = query.Where("DATE_FORMAT(tanggal_pesanan, '%Y-%m') = ?", bulan)
		labelPeriode = bulan
	}

	if err := query.Find(&pesananList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data untuk PDF"})
		return
	}

	totalPendapatan := 0
	for _, p := range pesananList {
		totalPendapatan += p.TotalHarga
	}

	// 1. Inisialisasi library gofpdf
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// 2. Desain Header Laporan Penjualan
	pdf.SetFont("Arial", "B", 18)
	pdf.SetTextColor(219, 39, 119) // Warna Pink Khas Vipizza (Pink 600: RGB 219, 39, 119)
	pdf.CellFormat(190, 10, "VIPIZZA HOMEMADE PADANG", "0", 1, "C", false, 0, "")
	
	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(100, 116, 139) // Slate Gray
	pdf.CellFormat(190, 5, "Sistem Informasi Penjualan & Pemesanan Online Kuliner Kota Padang", "0", 1, "C", false, 0, "")
	pdf.CellFormat(190, 5, "Jl. Perintis Kemerdekaan, Padang, Sumatera Barat", "0", 1, "C", false, 0, "")
	
	// Garis pembatas tebal
	pdf.SetDrawColor(219, 39, 119)
	pdf.SetLineWidth(0.8)
	pdf.Line(10, 32, 200, 32)
	pdf.Ln(8)

	// 3. Sub-Header Informasi Periode
	pdf.SetFont("Arial", "B", 13)
	pdf.SetTextColor(30, 41, 59) // Deep Slate
	pdf.CellFormat(190, 8, "LAPORAN PENJUALAN " + string([]rune(tipe)[0]-32) + string([]rune(tipe)[1:]), "0", 1, "L", false, 0, "")
	
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(50, 6, "Periode Laporan:", "0", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(140, 6, labelPeriode, "0", 1, "L", false, 0, "")
	
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(50, 6, "Tanggal Cetak:", "0", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(140, 6, time.Now().Format("02 January 2006 15:04:05"), "0", 1, "L", false, 0, "")
	pdf.Ln(6)

	// 4. Tabel Daftar Penjualan
	pdf.SetFont("Arial", "B", 10)
	// Header Tabel (Warna Latar Pink)
	pdf.SetFillColor(219, 39, 119)
	pdf.SetTextColor(255, 255, 255)
	
	pdf.CellFormat(12, 8, "No", "1", 0, "C", true, 0, "")
	pdf.CellFormat(25, 8, "ID Pesanan", "1", 0, "C", true, 0, "")
	pdf.CellFormat(45, 8, "Nama Pelanggan", "1", 0, "L", true, 0, "")
	pdf.CellFormat(38, 8, "Metode Bayar", "1", 0, "C", true, 0, "")
	pdf.CellFormat(35, 8, "Tanggal", "1", 0, "C", true, 0, "")
	pdf.CellFormat(35, 8, "Total Penjualan", "1", 1, "R", true, 0, "")

	// Isi Tabel
	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(51, 65, 85) // Darker text
	
	for idx, pes := range pesananList {
		// Mengganti baris berselang-seling (Zebra striping)
		isFill := idx%2 == 1
		if isFill {
			pdf.SetFillColor(253, 242, 248) // Light Pink tint
		} else {
			pdf.SetFillColor(255, 255, 255)
		}

		pdf.CellFormat(12, 8, strconv.Itoa(idx+1), "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("#%d", pes.ID), "1", 0, "C", true, 0, "")
		pdf.CellFormat(45, 8, pes.Pengguna.Nama, "1", 0, "L", true, 0, "")
		
		metodeStr := "Transfer Bank"
		if pes.MetodePembayaran == "qris" {
			metodeStr = "QRIS"
		}
		pdf.CellFormat(38, 8, metodeStr, "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 8, pes.TanggalPesanan.Format("02/01/2006"), "1", 0, "C", true, 0, "")
		pdf.CellFormat(35, 8, fmt.Sprintf("Rp %s", formatRupiah(pes.TotalHarga)), "1", 1, "R", true, 0, "")
	}

	// 5. Total Pendapatan Ringkasan di Bawah Tabel
	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(241, 245, 249) // Gray background
	pdf.CellFormat(155, 8, "TOTAL PENDAPATAN", "1", 0, "C", true, 0, "")
	pdf.SetTextColor(219, 39, 119)
	pdf.CellFormat(35, 8, fmt.Sprintf("Rp %s", formatRupiah(totalPendapatan)), "1", 1, "R", true, 0, "")
	
	pdf.Ln(10)

	// Tanda tangan pemilik UMKM
	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(51, 65, 85)
	pdf.CellFormat(190, 6, "Padang, " + time.Now().Format("02 January 2006"), "0", 1, "R", false, 0, "")
	pdf.CellFormat(190, 6, "Pemilik UMKM Vipizza Homemade", "0", 1, "R", false, 0, "")
	pdf.Ln(15)
	pdf.SetFont("Arial", "BU", 10)
	pdf.CellFormat(190, 6, "Vipizza Management", "0", 1, "R", false, 0, "")

	// 6. Tulis file PDF ke output HTTP Response Stream
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=Laporan_Vipizza_%s_%s.pdf", tipe, labelPeriode))
	
	err := pdf.Output(c.Writer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan file PDF"})
	}
}

// Helper untuk memformat angka int ke string rupiah dengan titik ribuan
func formatRupiah(angka int) string {
	str := strconv.Itoa(angka)
	panjang := len(str)
	if panjang <= 3 {
		return str
	}

	var hasil string
	hitung := 0
	for i := panjang - 1; i >= 0; i-- {
		hasil = string(str[i]) + hasil
		hitung++
		if hitung == 3 && i != 0 {
			hasil = "." + hasil
			hitung = 0
		}
	}
	return hasil
}
