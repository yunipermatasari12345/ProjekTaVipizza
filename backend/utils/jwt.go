package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("vipizza_rahasia_tugas_akhir_key_2026")

// KlaimKustom mendefinisikan payload dalam JWT token
type KlaimKustom struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Peran  string `json:"peran"` // 'admin' atau 'pelanggan'
	jwt.RegisteredClaims
}

// BuatTokenJWT menghasilkan token JWT baru yang berlaku selama 24 jam
func BuatTokenJWT(userID uint, email, peran string) (string, error) {
	waktuKadaluarsa := time.Now().Add(24 * time.Hour)
	klaim := &KlaimKustom{
		UserID: userID,
		Email:  email,
		Peran:  peran,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(waktuKadaluarsa),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, klaim)
	return token.SignedString(jwtKey)
}

// VerifikasiTokenJWT memvalidasi token JWT dan mengembalikan klaim di dalamnya
func VerifikasiTokenJWT(strToken string) (*KlaimKustom, error) {
	klaim := &KlaimKustom{}
	token, err := jwt.ParseWithClaims(strToken, klaim, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token JWT tidak valid")
	}

	return klaim, nil
}
