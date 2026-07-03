package models

import "time"

// ItemPesanan merepresentasikan item makanan/minuman spesifik di dalam suatu pesanan
type ItemPesanan struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PesananID uint      `gorm:"not null" json:"pesanan_id"`
	MenuID    uint      `gorm:"not null" json:"menu_id"`
	Menu      Menu      `gorm:"foreignKey:MenuID" json:"menu"` // Relasi ke tabel Menu
	Jumlah    int       `gorm:"type:int;not null" json:"jumlah" binding:"required,gt=0"`
	Harga     int       `gorm:"type:int;not null" json:"harga"` // Menyimpan harga historis saat dipesan
	Catatan   string    `gorm:"type:varchar(255)" json:"catatan"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (ItemPesanan) TableName() string {
	return "item_pesanan"
}
