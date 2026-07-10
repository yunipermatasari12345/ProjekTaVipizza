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
	tanggalAwal := c.Query("tanggal_awal")
	tanggalAkhir := c.Query("tanggal_akhir")

	var pesananList []models.Pesanan
	query := config.DB.Preload("Pengguna").Preload("ItemPesanan.Menu").Where("status = ?", "selesai")

	var labelPeriode string
	
	if tanggalAwal == "" {
		tanggalAwal = time.Now().Format("2006-01-02")
	}
	if tanggalAkhir == "" {
		tanggalAkhir = time.Now().Format("2006-01-02")
	}
	
	query = query.Where("DATE(tanggal_pesanan) >= ? AND DATE(tanggal_pesanan) <= ?", tanggalAwal, tanggalAkhir)
	labelPeriode = tanggalAwal + " s/d " + tanggalAkhir

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
		"tipe":                  "rentang",
		"periode":               labelPeriode,
		"total_transaksi":       totalPesananSelesai,
		"total_pendapatan":      totalPendapatan,
		"ringkasan_produk":      ringkasanTerjual,
		"pesanan_detail":        pesananList,
	})
}

// LaporanPenjualanPDF membuat file PDF Laporan Penjualan (Khusus Admin)
func LaporanPenjualanPDF(c *gin.Context) {
	tanggalAwal := c.Query("tanggal_awal")
	tanggalAkhir := c.Query("tanggal_akhir")

	var pesananList []models.Pesanan
	query := config.DB.Preload("Pengguna").Preload("ItemPesanan.Menu").Where("status = ?", "selesai")

	if tanggalAwal == "" {
		tanggalAwal = time.Now().Format("2006-01-02")
	}
	if tanggalAkhir == "" {
		tanggalAkhir = time.Now().Format("2006-01-02")
	}
	query = query.Where("DATE(tanggal_pesanan) >= ? AND DATE(tanggal_pesanan) <= ?", tanggalAwal, tanggalAkhir)

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
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 0, 0) // Hitam
	pdf.CellFormat(190, 8, "VIPIZZA HOMEMADE PADANG", "0", 1, "C", false, 0, "")
	
	pdf.SetFont("Arial", "", 9)
	pdf.CellFormat(190, 5, "Komplek Taruko I Blok L No. 29, Korong Gadang, Kecamatan Kuranji, Kota Padang", "0", 1, "C", false, 0, "")
	
	// Garis pembatas tebal
	pdf.SetDrawColor(0, 0, 0)
	pdf.SetLineWidth(0.5)
	pdf.Line(10, 25, 200, 25)
	pdf.Ln(10)

	// 3. Sub-Header Informasi Periode
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(190, 8, "Laporan Transaksi", "0", 1, "C", false, 0, "")
	
	pdf.SetFont("Arial", "", 9)
	tglLaporan := fmt.Sprintf("Periode: %s s/d %s | Urutan: Terbaru", tanggalAwal, tanggalAkhir)
	pdf.CellFormat(190, 5, tglLaporan, "0", 1, "C", false, 0, "")
	pdf.Ln(6)

	// 4. Tabel Daftar Penjualan
	pdf.SetFont("Arial", "B", 8)
	// Header Tabel (Warna Biru Gelap / Navy seperti gambar)
	pdf.SetFillColor(26, 29, 35)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetDrawColor(0, 0, 0)
	pdf.SetLineWidth(0.2)
	
	// Lebar Total = 190mm
	w := []float64{8, 22, 28, 26, 25, 28, 26, 27}
	pdf.CellFormat(w[0], 8, "No", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[1], 8, "Tanggal", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[2], 8, "Pelanggan", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[3], 8, "Invoice", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[4], 8, "Status Order", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[5], 8, "Metode Bayar", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[6], 8, "Status Bayar", "1", 0, "C", true, 0, "")
	pdf.CellFormat(w[7], 8, "Total Harga", "1", 1, "C", true, 0, "")

	// Isi Tabel
	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(0, 0, 0) 
	pdf.SetFillColor(255, 255, 255)
	
	for idx, pes := range pesananList {
		pdf.CellFormat(w[0], 8, strconv.Itoa(idx+1), "1", 0, "C", false, 0, "")
		pdf.CellFormat(w[1], 8, pes.TanggalPesanan.Format("02-01-2006"), "1", 0, "C", false, 0, "")
		
		// Potong nama jika terlalu panjang
		namaStr := pes.Pengguna.Nama
		if len(namaStr) > 15 {
			namaStr = namaStr[:15] + "..."
		}
		pdf.CellFormat(w[2], 8, namaStr, "1", 0, "L", false, 0, "")
		
		pdf.CellFormat(w[3], 8, fmt.Sprintf("INV-%d%04d", pes.TanggalPesanan.Year(), pes.ID), "1", 0, "C", false, 0, "")
		
		statusOrder := "Selesai"
		if pes.Status == "menunggu_konfirmasi" { statusOrder = "Pending" }
		if pes.Status == "diproses" { statusOrder = "Diproses" }
		pdf.CellFormat(w[4], 8, statusOrder, "1", 0, "C", false, 0, "")
		
		metodeStr := "Transfer Bank"
		if pes.MetodePembayaran == "qris" { metodeStr = "QRIS" }
		if pes.MetodePembayaran == "tunai" { metodeStr = "Cash" }
		pdf.CellFormat(w[5], 8, metodeStr, "1", 0, "C", false, 0, "")
		
		statusBayar := "Paid"
		if pes.Status == "menunggu_pembayaran" { statusBayar = "Unpaid" }
		pdf.CellFormat(w[6], 8, statusBayar, "1", 0, "C", false, 0, "")
		
		pdf.CellFormat(w[7], 8, fmt.Sprintf("Rp %s", formatRupiah(pes.TotalHarga)), "1", 1, "R", false, 0, "")
	}

	// 5. Total Pendapatan Ringkasan di Bawah Tabel
	pdf.SetFont("Arial", "B", 8)
	pdf.SetFillColor(220, 230, 241) // Light blue summary background like the example
	
	// Baris 1: Jumlah Order
	pdf.CellFormat(163, 7, "Jumlah Order:", "1", 0, "R", true, 0, "")
	pdf.CellFormat(27, 7, strconv.Itoa(len(pesananList)), "1", 1, "R", true, 0, "")
	
	// Baris 2: Total Transaksi
	pdf.CellFormat(163, 7, "Total Transaksi:", "1", 0, "R", true, 0, "")
	pdf.CellFormat(27, 7, fmt.Sprintf("Rp %s", formatRupiah(totalPendapatan)), "1", 1, "R", true, 0, "")
	
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
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=Laporan_Vipizza_%s_sd_%s.pdf", tanggalAwal, tanggalAkhir))
	
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
