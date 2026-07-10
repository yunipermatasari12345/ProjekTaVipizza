package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
)

// AmbilSemuaPromo mengambil semua promo aktif yang masih berlaku (publik)
func AmbilSemuaPromo(c *gin.Context) {
	promos := []models.Promo{}

	wib := time.FixedZone("WIB", 7*60*60)
	now := time.Now().In(wib)
	hariIni := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, wib)

	query := config.DB.Where("aktif = ?", true)
	var allActivePromos []models.Promo
	if err := query.Order("id desc").Find(&allActivePromos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data promo"})
		return
	}

	// Filter di Go untuk menghindari masalah zona waktu DB
	for _, p := range allActivePromos {
		// Asumsi tanggal di DB disimpan dengan jam 00:00.
		// Kita anggap valid jika hari ini >= tanggal_mulai (diabaikan jamnya) dan hari ini <= tanggal_akhir
		pMulai := time.Date(p.TanggalMulai.Year(), p.TanggalMulai.Month(), p.TanggalMulai.Day(), 0, 0, 0, 0, wib)
		pAkhir := time.Date(p.TanggalAkhir.Year(), p.TanggalAkhir.Month(), p.TanggalAkhir.Day(), 23, 59, 59, 0, wib)
		
		if (hariIni.Equal(pMulai) || hariIni.After(pMulai)) && (now.Before(pAkhir) || now.Equal(pAkhir)) {
			promos = append(promos, p)
		}
	}

	c.JSON(http.StatusOK, promos)
}

// AmbilSemuaPromoAdmin mengambil SEMUA promo termasuk tidak aktif (khusus Admin)
func AmbilSemuaPromoAdmin(c *gin.Context) {
	var promos []models.Promo
	if err := config.DB.Order("id desc").Find(&promos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data promo"})
		return
	}
	c.JSON(http.StatusOK, promos)
}

// TambahPromo menambahkan promo baru (Khusus Admin)
func TambahPromo(c *gin.Context) {
	judul := c.PostForm("judul")
	deskripsi := c.PostForm("deskripsi")
	diskonStr := c.PostForm("diskon")
	kodePromo := c.PostForm("kode_promo")
	tanggalMulaiStr := c.PostForm("tanggal_mulai")
	tanggalAkhirStr := c.PostForm("tanggal_akhir")
	aktifStr := c.PostForm("aktif")

	if judul == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Judul promo wajib diisi"})
		return
	}

	diskon, _ := strconv.Atoi(diskonStr)
	aktif := aktifStr != "false"

	tanggalMulai := time.Now().UTC()
	tanggalAkhir := time.Now().UTC().AddDate(0, 1, 0) // default 1 bulan
	if tanggalMulaiStr != "" {
		if t, err := time.Parse("2006-01-02", tanggalMulaiStr); err == nil {
			tanggalMulai = t
		}
	}
	if tanggalAkhirStr != "" {
		if t, err := time.Parse("2006-01-02", tanggalAkhirStr); err == nil {
			tanggalAkhir = t
		}
	}

	// Proses unggah banner jika ada
	var bannerURL string
	file, err := c.FormFile("banner")
	if err == nil {
		dirUpload := "uploads/promo"
		_ = os.MkdirAll(dirUpload, os.ModePerm)
		namaFile := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		pathFile := filepath.Join(dirUpload, namaFile)
		if err := c.SaveUploadedFile(file, pathFile); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan banner promo"})
			return
		}
		bannerURL = "/uploads/promo/" + namaFile
	}

	promoBaru := models.Promo{
		Judul:        judul,
		Deskripsi:    deskripsi,
		Diskon:       diskon,
		KodePromo:    kodePromo,
		BannerURL:    bannerURL,
		TanggalMulai: tanggalMulai,
		TanggalAkhir: tanggalAkhir,
		Aktif:        aktif,
	}

	if err := config.DB.Create(&promoBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan promo"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Promo berhasil ditambahkan!", "promo": promoBaru})
}

// EditPromo memperbarui promo (Khusus Admin)
func EditPromo(c *gin.Context) {
	id := c.Param("id")
	var promo models.Promo

	if err := config.DB.First(&promo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promo tidak ditemukan"})
		return
	}

	if judul := c.PostForm("judul"); judul != "" {
		promo.Judul = judul
	}
	if deskripsi := c.PostForm("deskripsi"); deskripsi != "" {
		promo.Deskripsi = deskripsi
	}
	if diskonStr := c.PostForm("diskon"); diskonStr != "" {
		if d, err := strconv.Atoi(diskonStr); err == nil {
			promo.Diskon = d
		}
	}
	if kodePromo := c.PostForm("kode_promo"); kodePromo != "" {
		promo.KodePromo = kodePromo
	}
	if aktifStr := c.PostForm("aktif"); aktifStr != "" {
		promo.Aktif = aktifStr == "true"
	}
	if t, err := time.Parse("2006-01-02", c.PostForm("tanggal_mulai")); err == nil {
		promo.TanggalMulai = t
	}
	if t, err := time.Parse("2006-01-02", c.PostForm("tanggal_akhir")); err == nil {
		promo.TanggalAkhir = t
	}

	// Update banner jika ada upload baru
	file, err := c.FormFile("banner")
	if err == nil {
		dirUpload := "uploads/promo"
		_ = os.MkdirAll(dirUpload, os.ModePerm)
		if promo.BannerURL != "" {
			_ = os.Remove(filepath.Join(".", promo.BannerURL))
		}
		namaFile := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		pathFile := filepath.Join(dirUpload, namaFile)
		if err := c.SaveUploadedFile(file, pathFile); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan banner baru"})
			return
		}
		promo.BannerURL = "/uploads/promo/" + namaFile
	}

	if err := config.DB.Save(&promo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui promo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Promo berhasil diperbarui!", "promo": promo})
}

// HapusPromo menghapus promo (Khusus Admin)
func HapusPromo(c *gin.Context) {
	id := c.Param("id")
	var promo models.Promo

	if err := config.DB.First(&promo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promo tidak ditemukan"})
		return
	}

	if promo.BannerURL != "" {
		_ = os.Remove(filepath.Join(".", promo.BannerURL))
	}

	if err := config.DB.Delete(&promo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus promo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Promo berhasil dihapus!"})
}

// CekKodePromo memvalidasi kode promo saat pelanggan checkout (Publik)
func CekKodePromo(c *gin.Context) {
	kode := c.Query("kode")
	if kode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode promo wajib diisi"})
		return
	}

	var promo models.Promo
	if err := config.DB.Where("kode_promo = ?", kode).First(&promo).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kode promo tidak ditemukan"})
		return
	}

	if !promo.Aktif {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode promo sudah tidak aktif"})
		return
	}

	wib := time.FixedZone("WIB", 7*60*60)
	now := time.Now().In(wib)
	hariIni := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, wib)
	
	pMulai := time.Date(promo.TanggalMulai.Year(), promo.TanggalMulai.Month(), promo.TanggalMulai.Day(), 0, 0, 0, 0, wib)
	pAkhir := time.Date(promo.TanggalAkhir.Year(), promo.TanggalAkhir.Month(), promo.TanggalAkhir.Day(), 23, 59, 59, 0, wib)

	if now.After(pAkhir) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Promo sudah kadaluarsa"})
		return
	}

	if hariIni.Before(pMulai) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Promo belum dimulai"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Kode promo valid!",
		"diskon":  promo.Diskon,
		"kode":    promo.KodePromo,
	})
}
