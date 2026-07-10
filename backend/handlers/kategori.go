package handlers

import (
	"net/http"
	"strings"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
)

type KategoriInput struct {
	Nama      string `json:"nama" binding:"required"`
	Deskripsi string `json:"deskripsi"`
	Aktif     *bool  `json:"aktif"`
}

func AmbilSemuaKategori(c *gin.Context) {
	var kategori []models.Kategori
	if err := config.DB.Order("id asc").Find(&kategori).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kategori"})
		return
	}
	c.JSON(http.StatusOK, kategori)
}

func AmbilDetailKategori(c *gin.Context) {
	id := c.Param("id")
	var kategori models.Kategori
	if err := config.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, kategori)
}

func TambahKategori(c *gin.Context) {
	var req KategoriInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori wajib diisi"})
		return
	}

	kategori := models.Kategori{
		Nama:      req.Nama,
		Slug:      strings.ToLower(strings.ReplaceAll(req.Nama, " ", "-")),
		Deskripsi: req.Deskripsi,
		Aktif:     true,
	}
	if req.Aktif != nil {
		kategori.Aktif = *req.Aktif
	}

	if err := config.DB.Create(&kategori).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kategori"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Kategori berhasil ditambahkan", "kategori": kategori})
}

func EditKategori(c *gin.Context) {
	id := c.Param("id")
	var kategori models.Kategori
	if err := config.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var req KategoriInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	updates := map[string]interface{}{}
	if req.Nama != "" {
		updates["nama"] = req.Nama
		updates["slug"] = strings.ToLower(strings.ReplaceAll(req.Nama, " ", "-"))
	}
	if req.Deskripsi != "" {
		updates["deskripsi"] = req.Deskripsi
	}
	if req.Aktif != nil {
		updates["aktif"] = *req.Aktif
	}

	if err := config.DB.Model(&kategori).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate kategori"})
		return
	}

	config.DB.First(&kategori, id)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil diupdate", "kategori": kategori})
}

func HapusKategori(c *gin.Context) {
	id := c.Param("id")
	var kategori models.Kategori
	if err := config.DB.First(&kategori, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var count int64
	config.DB.Model(&models.Menu{}).Where("kategori_id = ?", id).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Kategori tidak bisa dihapus karena masih digunakan oleh menu"})
		return
	}

	if err := config.DB.Delete(&kategori).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}
