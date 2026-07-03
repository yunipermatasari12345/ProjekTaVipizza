package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword mengenkripsi password plain-text menggunakan bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// VerifikasiPassword membandingkan password plain-text dengan password yang di-hash
func VerifikasiPassword(passwordPlain, passwordHashed string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(passwordHashed), []byte(passwordPlain))
	return err == nil
}
