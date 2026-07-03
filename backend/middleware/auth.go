package middleware

import (
	"net/http"
	"strings"
	"vipizza/utils"

	"github.com/gin-gonic/gin"
)

// WajibAutentikasi memvalidasi token JWT di header Authorization
func WajibAutentikasi() gin.HandlerFunc {
	return func(c *gin.Context) {
		headerAuth := c.GetHeader("Authorization")
		if headerAuth == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Header otorisasi diperlukan"})
			c.Abort()
			return
		}

		bagianToken := strings.Split(headerAuth, " ")
		if len(bagianToken) != 2 || bagianToken[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Format token tidak valid (harus 'Bearer <token>')" })
			c.Abort()
			return
		}

		strToken := bagianToken[1]
		klaim, err := utils.VerifikasiTokenJWT(strToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token kedaluwarsa atau tidak valid"})
			c.Abort()
			return
		}

		// Simpan data klaim ke dalam context Gin agar bisa diakses di handler
		c.Set("userID", klaim.UserID)
		c.Set("email", klaim.Email)
		c.Set("peran", klaim.Peran)

		c.Next()
	}
}

// WajibAdmin memvalidasi apakah pengguna yang login memiliki peran 'admin'
func WajibAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		peran, ada := c.Get("peran")
		if !ada || peran != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Halaman ini khusus untuk Admin"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// WajibPelanggan memvalidasi apakah pengguna yang login memiliki peran 'pelanggan'
func WajibPelanggan() gin.HandlerFunc {
	return func(c *gin.Context) {
		peran, ada := c.Get("peran")
		if !ada || peran != "pelanggan" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Fitur ini khusus untuk Pelanggan"})
			c.Abort()
			return
		}
		c.Next()
	}
}
