package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql" // Driver MySQL wajib di-import untuk sql.Open
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// HubungkanDatabase membuka koneksi ke MySQL menggunakan GORM
func HubungkanDatabase() {
	// Ambil konfigurasi database dari environment variables atau gunakan default
	dbUser := ambilEnvDefault("DB_USER", "root")
	dbPass := ambilEnvDefault("DB_PASSWORD", "")
	dbHost := ambilEnvDefault("DB_HOST", "127.0.0.1")
	dbPort := ambilEnvDefault("DB_PORT", "3306")
	dbName := ambilEnvDefault("DB_NAME", "vipizza")

	// Langkah 1: Hubungkan ke MySQL server TANPA menentukan nama database terlebih dahulu
	// untuk memastikan databasenya sudah ada, jika belum maka buat otomatis!
	dsnTanpaDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort)
	
	dbServer, err := sql.Open("mysql", dsnTanpaDB)
	if err != nil {
		log.Fatalf("Gagal terhubung ke MySQL Server: %v", err)
	}
	defer dbServer.Close()

	// Buat database secara otomatis jika belum ada di XAMPP/phpMyAdmin Anda!
	kueriBuatDB := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", dbName)
	_, err = dbServer.Exec(kueriBuatDB)
	if err != nil {
		log.Fatalf("Gagal membuat database otomatis '%s': %v", dbName, err)
	}

	// Langkah 2: Hubungkan secara penuh ke database yang telah dibuat
	dsnLengkap := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPass, dbHost, dbPort, dbName)

	DB, err = gorm.Open(mysql.Open(dsnLengkap), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal terhubung ke database '%s': %v", dbName, err)
	}

	fmt.Printf("Berhasil terhubung ke database MySQL '%s'! (Tabel dimigrasikan otomatis)\n", dbName)
}

// Helper untuk membaca env variable dengan default value
func ambilEnvDefault(kunci, nilaiDefault string) string {
	nilai := os.Getenv(kunci)
	if nilai == "" {
		return nilaiDefault
	}
	return nilai
}
