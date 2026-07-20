package models

import "time"

// Ulasan merepresentasikan rating dan review yang diberikan pelanggan pada suatu menu
type Ulasan struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PesananID  *uint     `gorm:"index" json:"pesanan_id"`
	MenuID     uint      `gorm:"not null;index" json:"menu_id"`
	PenggunaID *uint     `gorm:"index" json:"pengguna_id"`
	NamaPublik string    `gorm:"type:varchar(100)" json:"nama_publik"`
	Rating     int       `gorm:"type:int;not null" json:"rating" binding:"required,min=1,max=5"`
	Komentar   string    `gorm:"type:text" json:"komentar"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relasi
	Pengguna Pengguna `gorm:"foreignKey:PenggunaID" json:"pengguna"`
	Menu     Menu     `gorm:"foreignKey:MenuID" json:"menu"`
}

// TableName menentukan nama tabel di MySQL
func (Ulasan) TableName() string {
	return "ulasan"
}
