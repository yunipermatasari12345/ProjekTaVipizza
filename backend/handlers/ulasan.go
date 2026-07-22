package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"vipizza/config"
	"vipizza/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AmbilUlasanMenu mengambil daftar ulasan untuk suatu menu
func AmbilUlasanMenu(c *gin.Context) {
	menuID := c.Param("id")
	var ulasan []models.Ulasan

	if err := config.DB.Preload("Pengguna").Where("menu_id = ?", menuID).Order("created_at DESC").Find(&ulasan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil ulasan"})
		return
	}

	c.JSON(http.StatusOK, ulasan)
}

// AmbilSemuaUlasanTerbaru mengambil daftar ulasan terbaru dari semua menu (untuk Beranda)
func AmbilSemuaUlasanTerbaru(c *gin.Context) {
	var ulasan []models.Ulasan

	if err := config.DB.Preload("Pengguna").Preload("Menu").Order("created_at DESC").Limit(6).Find(&ulasan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil ulasan"})
		return
	}

	c.JSON(http.StatusOK, ulasan)
}

// TambahUlasan menambah ulasan baru dari pelanggan (membutuhkan autentikasi)
func TambahUlasan(c *gin.Context) {
	pesananIDStr := c.Param("id")
	pesananID, err := strconv.Atoi(pesananIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Pesanan tidak valid"})
		return
	}

	// Ambil ID pengguna dari context (dari middleware autentikasi)
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tidak terotorisasi"})
		return
	}
	userID := userIDVal.(uint)

	// Parsing body
	var input struct {
		MenuID   uint   `json:"menu_id" binding:"required"`
		Rating   int    `json:"rating" binding:"required,min=1,max=5"`
		Komentar string `json:"komentar"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// === FILTER KATA KASAR / NEGATIF (Implementasi Filter Ulasan) ===
	kataKasar := []string{"jelek", "bodoh", "basi", "sampah", "penipu", "parah"}
	komentarLower := strings.ToLower(input.Komentar)
	for _, kata := range kataKasar {
		if strings.Contains(komentarLower, kata) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ulasan mengandung kata-kata yang tidak pantas. Mohon gunakan bahasa yang baik."})
			return
		}
	}

	// === FILTER RATING 1 BINTANG SPAM (Opsional: Jika rating 1 dan komentar kosong, tolak) ===
	if input.Rating == 1 && len(strings.TrimSpace(input.Komentar)) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Untuk rating 1 bintang, mohon berikan alasan/komentar yang jelas agar kami bisa memperbaikinya."})
		return
	}
	// ================================================================

	// Validasi apakah pesanan ini milik user tersebut dan statusnya 'selesai'
	var pesanan models.Pesanan
	if err := config.DB.Where("id = ? AND pengguna_id = ? AND status = ?", pesananID, userID, "selesai").First(&pesanan).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Pesanan tidak ditemukan atau belum selesai"})
		return
	}

	// Validasi apakah menu ini benar-benar ada di pesanan tersebut
	var itemPesanan models.ItemPesanan
	if err := config.DB.Where("pesanan_id = ? AND menu_id = ?", pesananID, input.MenuID).First(&itemPesanan).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Menu tidak ada dalam pesanan ini"})
		return
	}

	// Validasi apakah user sudah pernah memberikan ulasan untuk pesanan dan menu ini
	var existingUlasan models.Ulasan
	if err := config.DB.Where("pesanan_id = ? AND menu_id = ?", pesananID, input.MenuID).First(&existingUlasan).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Anda sudah memberikan ulasan untuk menu ini pada pesanan ini"})
		return
	}

	// Gunakan transaction untuk menyimpan ulasan dan update rating menu
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		pID := uint(pesananID)
		uID := userID
		ulasan := models.Ulasan{
			PesananID:  &pID,
			MenuID:     input.MenuID,
			PenggunaID: &uID,
			Rating:     input.Rating,
			Komentar:   input.Komentar,
		}

		if err := tx.Create(&ulasan).Error; err != nil {
			return err
		}

		// Update rata-rata rating dan jumlah ulasan pada menu
		var menu models.Menu
		if err := tx.First(&menu, input.MenuID).Error; err != nil {
			return err
		}

		totalRatingLama := menu.Rating * float64(menu.JumlahUlasan)
		menu.JumlahUlasan += 1
		menu.Rating = (totalRatingLama + float64(input.Rating)) / float64(menu.JumlahUlasan)

		if err := tx.Save(&menu).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ulasan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ulasan berhasil disimpan"})
}

// TambahUlasanPublik menambah ulasan publik dari pengunjung (tanpa login dan tanpa pesanan)
func TambahUlasanPublik(c *gin.Context) {
	var input struct {
		NamaPublik string `json:"nama_publik" binding:"required"`
		MenuID     uint   `json:"menu_id" binding:"required"`
		Rating     int    `json:"rating" binding:"required,min=1,max=5"`
		Komentar   string `json:"komentar"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// === FILTER KATA KASAR / NEGATIF ===
	kataKasar := []string{"jelek", "bodoh", "basi", "sampah", "penipu", "parah"}
	komentarLower := strings.ToLower(input.Komentar)
	for _, kata := range kataKasar {
		if strings.Contains(komentarLower, kata) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ulasan mengandung kata-kata yang tidak pantas. Mohon gunakan bahasa yang baik."})
			return
		}
	}

	// === FILTER RATING 1 BINTANG SPAM ===
	if input.Rating == 1 && len(strings.TrimSpace(input.Komentar)) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Untuk rating 1 bintang, mohon berikan alasan/komentar yang jelas agar kami bisa memperbaikinya."})
		return
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		ulasan := models.Ulasan{
			NamaPublik: input.NamaPublik,
			MenuID:     input.MenuID,
			Rating:     input.Rating,
			Komentar:   input.Komentar,
		}

		if err := tx.Create(&ulasan).Error; err != nil {
			return err
		}

		// Update rata-rata rating dan jumlah ulasan pada menu
		var menu models.Menu
		if err := tx.First(&menu, input.MenuID).Error; err != nil {
			return err
		}

		totalRatingLama := menu.Rating * float64(menu.JumlahUlasan)
		menu.JumlahUlasan += 1
		menu.Rating = (totalRatingLama + float64(input.Rating)) / float64(menu.JumlahUlasan)

		if err := tx.Save(&menu).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ulasan publik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ulasan berhasil dikirim"})
}

// AmbilSemuaUlasanAdmin mengambil seluruh data ulasan (Khusus Admin)
func AmbilSemuaUlasanAdmin(c *gin.Context) {
	var ulasan []models.Ulasan
	if err := config.DB.Preload("Pengguna").Preload("Menu").Order("created_at DESC").Find(&ulasan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil semua ulasan"})
		return
	}
	c.JSON(http.StatusOK, ulasan)
}

// HapusUlasan menghapus ulasan berdasarkan ID (Khusus Admin) & memperbarui ulang rating menu di katalog
func HapusUlasan(c *gin.Context) {
	id := c.Param("id")
	var ulasan models.Ulasan

	if err := config.DB.First(&ulasan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ulasan tidak ditemukan"})
		return
	}

	menuID := ulasan.MenuID

	// Gunakan transaksi untuk menghapus ulasan & menghitung ulang rating menu
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&ulasan).Error; err != nil {
			return err
		}

		if menuID > 0 {
			var totalCount int64
			var avgRating float64

			tx.Model(&models.Ulasan{}).Where("menu_id = ?", menuID).Count(&totalCount)

			if totalCount > 0 {
				type Result struct {
					Average float64
				}
				var res Result
				tx.Model(&models.Ulasan{}).Where("menu_id = ?", menuID).Select("COALESCE(AVG(rating), 5.0) as average").Scan(&res)
				avgRating = res.Average
			} else {
				avgRating = 5.0
				totalCount = 0
			}

			if err := tx.Model(&models.Menu{}).Where("id = ?", menuID).Updates(map[string]interface{}{
				"rating":        avgRating,
				"jumlah_ulasan": totalCount,
			}).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus ulasan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ulasan berhasil dihapus dan rating menu katalog telah diperbarui"})
}
