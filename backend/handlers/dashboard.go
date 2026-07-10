package handlers

import (
	"net/http"
	"time"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
)

type DashboardSummary struct {
	TotalPesanan        int64 `json:"total_pesanan"`
	TotalMenu           int64 `json:"total_menu"`
	TotalPelanggan      int64 `json:"total_pelanggan"`
	TotalPenjualan      int64 `json:"total_penjualan"`
	PromoAktif          int64 `json:"promo_aktif"`
	MenungguDiproses    int64 `json:"menunggu_diproses"`
}

func RingkasanDashboard(c *gin.Context) {
	var summary DashboardSummary

	config.DB.Model(&models.Pesanan{}).Count(&summary.TotalPesanan)
	config.DB.Model(&models.Menu{}).Count(&summary.TotalMenu)
	config.DB.Model(&models.Pengguna{}).Where("peran = ?", "pelanggan").Count(&summary.TotalPelanggan)
	config.DB.Model(&models.Promo{}).Where("aktif = ?", true).Count(&summary.PromoAktif)
	config.DB.Model(&models.Pesanan{}).Where("status = ?", "menunggu_pembayaran").Count(&summary.MenungguDiproses)
	config.DB.Model(&models.Pesanan{}).Where("status = ?", "selesai").Select("COALESCE(SUM(total_harga), 0)").Scan(&summary.TotalPenjualan)

	c.JSON(http.StatusOK, summary)
}

type CustomerRingkasan struct {
	TotalPesanan      int64 `json:"total_pesanan"`
	PesananDiproses   int64 `json:"pesanan_diproses"`
	PesananSelesai    int64 `json:"pesanan_selesai"`
	PesananDibatalkan int64 `json:"pesanan_dibatalkan"`
	TotalBelanja      int64 `json:"total_belanja"`
}

type CustomerDashboardResponse struct {
	Ringkasan      CustomerRingkasan `json:"ringkasan"`
	PesananTerbaru []models.Pesanan  `json:"pesanan_terbaru"`
	PromoAktif     []models.Promo    `json:"promo_aktif"`
	MenuFavorit    []models.Menu     `json:"menu_favorit"`
	MenuTerbaru    []models.Menu     `json:"menu_terbaru"`
	Kategori       []models.Kategori `json:"kategori"`
}

func RingkasanDashboardPelanggan(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var ringkasan CustomerRingkasan
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ?", userID).Count(&ringkasan.TotalPesanan)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status IN ?", userID, []string{"diproses", "sedang_diantar", "menunggu_validasi"}).Count(&ringkasan.PesananDiproses)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status = ?", userID, "selesai").Count(&ringkasan.PesananSelesai)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status = ?", userID, "dibatalkan").Count(&ringkasan.PesananDibatalkan)
	config.DB.Model(&models.Pesanan{}).Where("pengguna_id = ? AND status = ?", userID, "selesai").Select("COALESCE(SUM(total_harga), 0)").Scan(&ringkasan.TotalBelanja)

	var pesananTerbaru []models.Pesanan
	config.DB.Preload("ItemPesanan.Menu").Where("pengguna_id = ?", userID).Order("id desc").Limit(20).Find(&pesananTerbaru)

	var allActivePromos []models.Promo
	config.DB.Where("aktif = ?", true).Find(&allActivePromos)

	wib := time.FixedZone("WIB", 7*60*60)
	now := time.Now().In(wib)
	hariIni := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, wib)
	var promoAktif []models.Promo = []models.Promo{}

	for _, p := range allActivePromos {
		pMulai := time.Date(p.TanggalMulai.Year(), p.TanggalMulai.Month(), p.TanggalMulai.Day(), 0, 0, 0, 0, wib)
		pAkhir := time.Date(p.TanggalAkhir.Year(), p.TanggalAkhir.Month(), p.TanggalAkhir.Day(), 23, 59, 59, 0, wib)
		if (hariIni.Equal(pMulai) || hariIni.After(pMulai)) && (now.Before(pAkhir) || now.Equal(pAkhir)) {
			promoAktif = append(promoAktif, p)
		}
	}

	var menuFavorit []models.Menu
	config.DB.Where("tersedia = ? AND is_favorit = ?", true, true).Order("id desc").Limit(8).Find(&menuFavorit)

	var menuBestSeller []models.Menu
	config.DB.Where("tersedia = ? AND is_best_seller = ?", true, true).Order("id desc").Limit(8).Find(&menuBestSeller)

	var kategori []models.Kategori
	config.DB.Where("aktif = ?", true).Find(&kategori)

	c.JSON(http.StatusOK, CustomerDashboardResponse{
		Ringkasan:      ringkasan,
		PesananTerbaru: pesananTerbaru,
		PromoAktif:     promoAktif,
		MenuFavorit:    menuFavorit,
		MenuTerbaru:    menuBestSeller,
		Kategori:       kategori,
	})
}
