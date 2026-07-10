package models

import "time"

// Keranjang merepresentasikan item yang disimpan di keranjang belanja pelanggan sebelum checkout
type Keranjang struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PenggunaID uint      `gorm:"not null;index" json:"pengguna_id"`
	Pengguna   Pengguna  `gorm:"foreignKey:PenggunaID;constraint:OnDelete:CASCADE;" json:"pengguna,omitempty"`
	MenuID     uint      `gorm:"not null" json:"menu_id"`
	Menu       Menu      `gorm:"foreignKey:MenuID;constraint:OnDelete:CASCADE;" json:"menu,omitempty"`
	Jumlah     int       `gorm:"type:int;not null;default:1" json:"jumlah" binding:"required,gt=0"`
	Catatan    string    `gorm:"type:varchar(255)" json:"catatan"` // catatan khusus pelanggan, misal: "pedas level 2"
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Keranjang) TableName() string {
	return "carts"
}
