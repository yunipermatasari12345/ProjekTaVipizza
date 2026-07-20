package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
)

// AmbilSemuaGaleri mengambil semua foto galeri (Publik & Admin)
func AmbilSemuaGaleri(c *gin.Context) {
	var galeri []models.Galeri
	if err := config.DB.Order("created_at DESC").Find(&galeri).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data galeri"})
		return
	}
	c.JSON(http.StatusOK, galeri)
}

// TambahGaleri mengunggah foto baru ke galeri (Khusus Admin)
func TambahGaleri(c *gin.Context) {
	judul := c.PostForm("judul")
	deskripsi := c.PostForm("deskripsi")

	var gambarURL string
	file, err := c.FormFile("gambar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gambar wajib diunggah"})
		return
	}

	dirUpload := "uploads/galeri"
	_ = os.MkdirAll(dirUpload, os.ModePerm)

	namaFile := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	pathFile := filepath.Join(dirUpload, namaFile)

	if err := c.SaveUploadedFile(file, pathFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan gambar"})
		return
	}
	gambarURL = "/uploads/galeri/" + namaFile

	galeriBaru := models.Galeri{
		Judul:     judul,
		Deskripsi: deskripsi,
		GambarURL: gambarURL,
	}

	if err := config.DB.Create(&galeriBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Foto berhasil ditambahkan ke galeri",
		"galeri":  galeriBaru,
	})
}

// HapusGaleri menghapus foto dari galeri (Khusus Admin)
func HapusGaleri(c *gin.Context) {
	id := c.Param("id")
	var galeri models.Galeri

	if err := config.DB.First(&galeri, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Foto tidak ditemukan"})
		return
	}

	// Hapus file fisik
	if galeri.GambarURL != "" {
		_ = os.Remove(filepath.Join(".", galeri.GambarURL))
	}

	if err := config.DB.Delete(&galeri).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data dari database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Foto berhasil dihapus"})
}
