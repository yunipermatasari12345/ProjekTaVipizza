package models

import "time"

// Pengguna merepresentasikan data user (admin atau pelanggan)
type Pengguna struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nama      string    `gorm:"type:varchar(100);not null" json:"nama" binding:"required"`
	Email     string    `gorm:"type:varchar(100);unique;not null" json:"email" binding:"required,email"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"` // Disembunyikan saat dikonversi ke JSON
	Peran     string    `gorm:"type:varchar(20);default:'pelanggan'" json:"peran"` // 'admin' atau 'pelanggan'
	Telepon   string    `gorm:"type:varchar(20)" json:"telepon"`
	Alamat    string    `gorm:"type:text" json:"alamat"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Pengguna) TableName() string {
	return "pengguna"
}
