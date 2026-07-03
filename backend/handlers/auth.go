package handlers

import (
	"net/http"
	"vipizza/config"
	"vipizza/models"
	"vipizza/utils"

	"github.com/gin-gonic/gin"
)

// RegistrasiRequest struktur input untuk pendaftaran akun baru
type RegistrasiRequest struct {
	Nama    string `json:"nama" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Telepon string `json:"telepon" binding:"required"`
	Alamat  string `json:"alamat" binding:"required"`
}

// LoginRequest struktur input untuk proses masuk
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Registrasi mendaftarkan akun pelanggan baru
func Registrasi(c *gin.Context) {
	var req RegistrasiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid. Pastikan password minimal 6 karakter."})
		return
	}

	// Cek apakah email sudah terdaftar
	var penggunaAda models.Pengguna
	hasil := config.DB.Where("email = ?", req.Email).First(&penggunaAda)
	if hasil.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar!"})
		return
	}

	// Hash password
	passwordHashed, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	// Buat pengguna baru (selalu 'pelanggan' lewat registrasi umum)
	penggunaBaru := models.Pengguna{
		Nama:    req.Nama,
		Email:   req.Email,
		Password: passwordHashed,
		Peran:   "pelanggan",
		Telepon: req.Telepon,
		Alamat:  req.Alamat,
	}

	if err := config.DB.Create(&penggunaBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pengguna baru"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi berhasil! Silakan login.",
		"user":    penggunaBaru,
	})
}

// Login memproses autentikasi pengguna
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email dan password wajib diisi"})
		return
	}

	var pengguna models.Pengguna
	if err := config.DB.Where("email = ?", req.Email).First(&pengguna).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	// Verifikasi password
	if !utils.VerifikasiPassword(req.Password, pengguna.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	// Buat token JWT
	token, err := utils.BuatTokenJWT(pengguna.ID, pengguna.Email, pengguna.Peran)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token login"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil!",
		"token":   token,
		"user": gin.H{
			"id":      pengguna.ID,
			"nama":    pengguna.Nama,
			"email":   pengguna.Email,
			"peran":   pengguna.Peran,
			"telepon": pengguna.Telepon,
			"alamat":  pengguna.Alamat,
		},
	})
}

// GetProfil mengambil informasi profil pengguna yang sedang login
func GetProfil(c *gin.Context) {
	userID, _ := c.Get("userID")

	var pengguna models.Pengguna
	if err := config.DB.First(&pengguna, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": pengguna,
	})
}
