package models

import "time"

// Kategori merepresentasikan kategori produk menu (pizza, minuman, dessert, dll)
type Kategori struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nama      string    `gorm:"type:varchar(100);not null;unique" json:"nama" binding:"required"` // contoh: 'Pizza', 'Minuman', 'Dessert'
	Slug      string    `gorm:"type:varchar(100);not null;unique" json:"slug"`                    // contoh: 'pizza', 'minuman', 'dessert'
	Deskripsi string    `gorm:"type:text" json:"deskripsi"`
	Aktif     bool      `gorm:"type:boolean;default:true" json:"aktif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Kategori) TableName() string {
	return "categories"
}
