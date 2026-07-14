package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"
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

// LupaPasswordRequest struktur input untuk lupa password
type LupaPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
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

// LupaPassword memproses reset password dan mengirim via WhatsApp
func LupaPassword(c *gin.Context) {
	var req LupaPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email wajib diisi dan valid"})
		return
	}

	var pengguna models.Pengguna
	if err := config.DB.Where("email = ?", req.Email).First(&pengguna).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email tidak terdaftar di sistem kami!"})
		return
	}

	// Generate password baru acak (6 digit)
	rand.Seed(time.Now().UnixNano())
	passwordBaru := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	// Hash password
	passwordHashed, err := utils.HashPassword(passwordBaru)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat password baru"})
		return
	}

	// Update password di DB
	config.DB.Model(&pengguna).Update("password", passwordHashed)

	// Kirim pesan WhatsApp
	pesan := fmt.Sprintf("Halo *%s*,\n\nSistem kami menerima permintaan reset password untuk akun ViPizza Anda.\n\nPassword Baru Anda: *%s*\n\nSilakan gunakan password ini untuk login, dan pastikan Anda segera mengubahnya di halaman Profil demi keamanan.\n\nTerima kasih,\nTim ViPizza", pengguna.Nama, passwordBaru)
	
	if pengguna.Telepon != "" {
		go utils.KirimNotifikasiPelanggan(pengguna.Telepon, pesan)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil. Password baru telah dikirimkan ke WhatsApp Anda yang terdaftar."})
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

type UpdateProfilInput struct {
	Nama    string `json:"nama"`
	Telepon string `json:"telepon"`
	Alamat  string `json:"alamat"`
}

func UpdateProfil(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req UpdateProfilInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	updates := map[string]interface{}{}
	if req.Nama != "" {
		updates["nama"] = req.Nama
	}
	if req.Telepon != "" {
		updates["telepon"] = req.Telepon
	}
	if req.Alamat != "" {
		updates["alamat"] = req.Alamat
	}

	if err := config.DB.Model(&models.Pengguna{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate profil"})
		return
	}

	var pengguna models.Pengguna
	config.DB.First(&pengguna, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Profil berhasil diupdate", "user": pengguna})
}

type ChangePasswordInput struct {
	PasswordLama string `json:"password_lama" binding:"required"`
	PasswordBaru string `json:"password_baru" binding:"required,min=6"`
}

func ChangePassword(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req ChangePasswordInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password baru minimal 6 karakter"})
		return
	}

	var pengguna models.Pengguna
	if err := config.DB.First(&pengguna, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	if !utils.VerifikasiPassword(req.PasswordLama, pengguna.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password lama salah"})
		return
	}

	passwordHashed, err := utils.HashPassword(req.PasswordBaru)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	config.DB.Model(&pengguna).Update("password", passwordHashed)
	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diubah"})
}

func AmbilSemuaPengguna(c *gin.Context) {
	var pengguna []models.Pengguna
	if err := config.DB.Order("id desc").Find(&pengguna).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}
	c.JSON(http.StatusOK, pengguna)
}

func TambahPengguna(c *gin.Context) {
	var req RegistrasiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	var penggunaAda models.Pengguna
	if err := config.DB.Where("email = ?", req.Email).First(&penggunaAda).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar!"})
		return
	}

	passwordHashed, _ := utils.HashPassword(req.Password)
	peran := c.Query("peran")
	if peran != "admin" {
		peran = "pelanggan"
	}

	penggunaBaru := models.Pengguna{
		Nama:     req.Nama,
		Email:    req.Email,
		Password: passwordHashed,
		Peran:    peran,
		Telepon:  req.Telepon,
		Alamat:   req.Alamat,
	}

	if err := config.DB.Create(&penggunaBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambah pengguna"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Berhasil menambah pengguna"})
}

func EditPengguna(c *gin.Context) {
	id := c.Param("id")
	var req UpdateProfilInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	var pengguna models.Pengguna
	if err := config.DB.First(&pengguna, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	updates := map[string]interface{}{}
	if req.Nama != "" {
		updates["nama"] = req.Nama
	}
	if req.Telepon != "" {
		updates["telepon"] = req.Telepon
	}
	if req.Alamat != "" {
		updates["alamat"] = req.Alamat
	}

	config.DB.Model(&pengguna).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"message": "Pengguna berhasil diperbarui"})
}

func HapusPengguna(c *gin.Context) {
	id := c.Param("id")
	var pengguna models.Pengguna
	if err := config.DB.First(&pengguna, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}
	config.DB.Delete(&pengguna)
	c.JSON(http.StatusOK, gin.H{"message": "Pengguna berhasil dihapus"})
}

func AmbilDetailPelanggan(c *gin.Context) {
	id := c.Param("id")
	var pengguna models.Pengguna
	if err := config.DB.First(&pengguna, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pelanggan tidak ditemukan"})
		return
	}
	if pengguna.Peran != "pelanggan" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID bukan pelanggan"})
		return
	}

	var pesanan []models.Pesanan
	config.DB.Where("pengguna_id = ?", id).Preload("ItemPesanan").Order("id desc").Limit(20).Find(&pesanan)

	c.JSON(http.StatusOK, gin.H{
		"pelanggan": pengguna,
		"riwayat":   pesanan,
	})
}
