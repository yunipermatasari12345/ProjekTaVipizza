package handlers

import (
	"net/http"
	"time"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
)

// AmbilSemuaPesanPelanggan — Admin: ambil semua pesan pelanggan
func AmbilSemuaPesanPelanggan(c *gin.Context) {
	var pesan []models.PesanPelanggan
	config.DB.Order("created_at DESC").Find(&pesan)
	c.JSON(http.StatusOK, pesan)
}

// KirimPesanPelanggan — Publik: pelanggan kirim pertanyaan
func KirimPesanPelanggan(c *gin.Context) {
	var req struct {
		Nama        string `json:"nama" binding:"required"`
		Email       string `json:"email" binding:"required"`
		Pertanyaan  string `json:"pertanyaan" binding:"required"`
		PenggunaID  *uint  `json:"pengguna_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pesan := models.PesanPelanggan{
		PenggunaID: req.PenggunaID,
		Nama:       req.Nama,
		Email:      req.Email,
		Pertanyaan: req.Pertanyaan,
	}

	if err := config.DB.Create(&pesan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pesan"})
		return
	}

	c.JSON(http.StatusCreated, pesan)
}

// BalasPesanPelanggan — Admin: balas pertanyaan pelanggan
func BalasPesanPelanggan(c *gin.Context) {
	id := c.Param("id")
	var pesan models.PesanPelanggan
	if err := config.DB.First(&pesan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pesan tidak ditemukan"})
		return
	}

	var req struct {
		Balasan string `json:"balasan" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	pesan.Balasan = &req.Balasan
	pesan.WaktuBalas = &now
	config.DB.Save(&pesan)

	c.JSON(http.StatusOK, pesan)
}

// HapusPesanPelanggan — Admin: hapus pesan
func HapusPesanPelanggan(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.PesanPelanggan{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus pesan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pesan berhasil dihapus"})
}
