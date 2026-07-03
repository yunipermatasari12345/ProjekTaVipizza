package models

import "time"

// Menu merepresentasikan data makanan/minuman yang dijual
type Menu struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nama      string    `gorm:"type:varchar(100);not null" json:"nama" binding:"required"`
	Deskripsi string    `gorm:"type:text" json:"deskripsi"`
	Harga     int       `gorm:"type:int;not null" json:"harga" binding:"required,gte=0"`
	Stok      int       `gorm:"type:int;default:0" json:"stok" binding:"required,gte=0"`
	Kategori  string    `gorm:"type:varchar(50);not null" json:"kategori" binding:"required"` // 'pizza', 'side', 'drink', 'dessert'
	GambarURL string    `gorm:"type:varchar(255)" json:"gambar_url"`
	Tersedia  bool      `gorm:"type:boolean;default:true" json:"tersedia"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Menu) TableName() string {
	return "menu"
}
