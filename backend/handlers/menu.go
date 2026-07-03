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

	stok, err := strconv.Atoi(stokStr)
	if err != nil || stok < 0 {
		stok = 0
	}

	// Proses unggah gambar jika ada
	var gambarURL string
	file, err := c.FormFile("gambar")
	if err == nil {
		// Pastikan direktori uploads/menus/ tersedia
		dirUpload := "uploads/menus"
		_ = os.MkdirAll(dirUpload, os.ModePerm)

		// Buat nama file unik menggunakan unix timestamp
		namaFile := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		pathFile := filepath.Join(dirUpload, namaFile)

		if err := c.SaveUploadedFile(file, pathFile); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file gambar"})
			return
		}
		gambarURL = "/uploads/menus/" + namaFile
	}

	menuBaru := models.Menu{
		Nama:      nama,
		Deskripsi: deskripsi,
		Harga:     harga,
		Stok:      stok,
		Kategori:  kategori,
		GambarURL: gambarURL,
		Tersedia:  stok > 0,
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

	if stokStr != "" {
		stok, err := strconv.Atoi(stokStr)
		if err == nil && stok >= 0 {
			menu.Stok = stok
			// Atur otomatis ketersediaan berdasarkan stok
			menu.Tersedia = stok > 0
		}
	}

	if tersediaStr != "" {
		menu.Tersedia = tersediaStr == "true"
	}

	// Proses jika ada upload gambar baru
	file, err := c.FormFile("gambar")
	if err == nil {
		dirUpload := "uploads/menus"
		_ = os.MkdirAll(dirUpload, os.ModePerm)

		// Hapus gambar lama jika ada
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
