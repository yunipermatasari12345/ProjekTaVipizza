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

// AmbilSemuaMenu mengambil semua data menu dari database
func AmbilSemuaMenu(c *gin.Context) {
	var menus []models.Menu
	kategori := c.Query("kategori")

	query := config.DB
	if kategori != "" {
		query = query.Where("kategori = ?", kategori)
	}

	if err := query.Find(&menus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data menu"})
		return
	}

	c.JSON(http.StatusOK, menus)
}

// AmbilRekomendasiMenu mengambil daftar menu yang paling banyak terjual
func AmbilRekomendasiMenu(c *gin.Context) {
	var menus []models.Menu

	// Ambil top 8 menu berdasarkan jumlah terjual paling banyak
	if err := config.DB.Order("terjual DESC").Limit(8).Find(&menus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil rekomendasi menu"})
		return
	}

	c.JSON(http.StatusOK, menus)
}

// AmbilDetailMenu mengambil detail menu berdasarkan ID
func AmbilDetailMenu(c *gin.Context) {
	id := c.Param("id")
	var menu models.Menu

	if err := config.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

// TambahMenu menambahkan menu baru beserta unggah gambar (Khusus Admin)
func TambahMenu(c *gin.Context) {
	nama := c.PostForm("nama")
	deskripsi := c.PostForm("deskripsi")
	hargaStr := c.PostForm("harga")
	hargaMediumStr := c.PostForm("harga_medium")
	hargaLargeStr := c.PostForm("harga_large")
	stokStr := c.PostForm("stok")
	kategori := c.PostForm("kategori")

	if nama == "" || hargaStr == "" || kategori == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama, Harga, dan Kategori wajib diisi"})
		return
	}

	harga, err := strconv.Atoi(hargaStr)
	if err != nil || harga < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Harga harus berupa angka positif"})
		return
	}

	hargaMedium := harga
	if hargaMediumStr != "" {
		if hm, err := strconv.Atoi(hargaMediumStr); err == nil && hm >= 0 {
			hargaMedium = hm
		}
	}

	hargaLarge := hargaMedium + 15000
	if hargaLargeStr != "" {
		if hl, err := strconv.Atoi(hargaLargeStr); err == nil && hl >= 0 {
			hargaLarge = hl
		}
	}

	stok, err := strconv.Atoi(stokStr)
	if err != nil || stok < 0 {
		stok = 0
	}

	// Proses unggah gambar jika ada
	var gambarURL string
	file, err := c.FormFile("gambar")
	if err == nil {
		dirUpload := "uploads/menus"
		_ = os.MkdirAll(dirUpload, os.ModePerm)

		namaFile := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		pathFile := filepath.Join(dirUpload, namaFile)

		if err := c.SaveUploadedFile(file, pathFile); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file gambar"})
			return
		}
		gambarURL = "/uploads/menus/" + namaFile
	}

	isFavoritStr := c.PostForm("is_favorit")
	isBestSellerStr := c.PostForm("is_best_seller")

	menuBaru := models.Menu{
		Nama:         nama,
		Deskripsi:    deskripsi,
		Harga:        harga,
		HargaMedium:  hargaMedium,
		HargaLarge:   hargaLarge,
		Stok:         stok,
		Kategori:     kategori,
		GambarURL:    gambarURL,
		Tersedia:     stok > 0,
		IsFavorit:    isFavoritStr == "true",
		IsBestSeller: isBestSellerStr == "true",
	}

	if err := config.DB.Create(&menuBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan menu baru"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Menu berhasil ditambahkan!",
		"menu":    menuBaru,
	})
}

// EditMenu memperbarui data menu dan stok (Khusus Admin)
func EditMenu(c *gin.Context) {
	id := c.Param("id")
	var menu models.Menu

	if err := config.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu tidak ditemukan"})
		return
	}

	nama := c.PostForm("nama")
	deskripsi := c.PostForm("deskripsi")
	hargaStr := c.PostForm("harga")
	hargaMediumStr := c.PostForm("harga_medium")
	hargaLargeStr := c.PostForm("harga_large")
	stokStr := c.PostForm("stok")
	kategori := c.PostForm("kategori")
	tersediaStr := c.PostForm("tersedia")

	if nama != "" {
		menu.Nama = nama
	}
	if deskripsi != "" {
		menu.Deskripsi = deskripsi
	}
	if kategori != "" {
		menu.Kategori = kategori
	}

	if hargaStr != "" {
		harga, err := strconv.Atoi(hargaStr)
		if err == nil && harga >= 0 {
			menu.Harga = harga
		}
	}

	if hargaMediumStr != "" {
		if hm, err := strconv.Atoi(hargaMediumStr); err == nil && hm >= 0 {
			menu.HargaMedium = hm
		}
	}

	if hargaLargeStr != "" {
		if hl, err := strconv.Atoi(hargaLargeStr); err == nil && hl >= 0 {
			menu.HargaLarge = hl
		}
	}

	if stokStr != "" {
		stok, err := strconv.Atoi(stokStr)
		if err == nil && stok >= 0 {
			menu.Stok = stok
			menu.Tersedia = stok > 0
		}
	}

	if tersediaStr != "" {
		menu.Tersedia = tersediaStr == "true"
	}

	isFavoritStr := c.PostForm("is_favorit")
	isBestSellerStr := c.PostForm("is_best_seller")
	menu.IsFavorit = isFavoritStr == "true"
	menu.IsBestSeller = isBestSellerStr == "true"

	// Proses jika ada upload gambar baru
	file, err := c.FormFile("gambar")
	if err == nil {
		dirUpload := "uploads/menus"
		_ = os.MkdirAll(dirUpload, os.ModePerm)

		if menu.GambarURL != "" {
			_ = os.Remove(filepath.Join(".", menu.GambarURL))
		}

		namaFile := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		pathFile := filepath.Join(dirUpload, namaFile)

		if err := c.SaveUploadedFile(file, pathFile); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file gambar baru"})
			return
		}
		menu.GambarURL = "/uploads/menus/" + namaFile
	}

	if err := config.DB.Save(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui menu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Menu berhasil diperbarui!",
		"menu":    menu,
	})
}

// HapusMenu menghapus menu berdasarkan ID (Khusus Admin)
func HapusMenu(c *gin.Context) {
	id := c.Param("id")
	var menu models.Menu

	if err := config.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu tidak ditemukan"})
		return
	}

	// Hapus file gambar terkait di disk
	if menu.GambarURL != "" {
		_ = os.Remove(filepath.Join(".", menu.GambarURL))
	}

	if err := config.DB.Delete(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus menu dari database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Menu berhasil dihapus!"})
}
