package models

import "time"

// Menu merepresentasikan data makanan/minuman yang dijual
type Menu struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	KategoriID   *uint     `gorm:"index" json:"kategori_id"`                                               // relasi ke tabel categories (opsional)
	KategoriData *Kategori `gorm:"foreignKey:KategoriID;constraint:OnDelete:SET NULL;" json:"kategori_data,omitempty"`
	Nama         string    `gorm:"type:varchar(100);not null" json:"nama" binding:"required"`
	Deskripsi    string    `gorm:"type:text" json:"deskripsi"`
	Harga        int       `gorm:"type:int;not null" json:"harga" binding:"required,gte=0"`
	HargaMedium  int       `gorm:"type:int;default:0" json:"harga_medium"`
	HargaLarge   int       `gorm:"type:int;default:0" json:"harga_large"`
	Stok         int       `gorm:"type:int;default:0" json:"stok" binding:"required,gte=0"`
	Kategori     string    `gorm:"type:varchar(50);not null" json:"kategori" binding:"required"` // nama kategori teks: 'pizza', 'minuman', 'dessert'
	GambarURL    string    `gorm:"type:varchar(255)" json:"gambar_url"`
	Tersedia     bool      `gorm:"type:boolean;default:true" json:"tersedia"`
	IsFavorit    bool      `gorm:"type:boolean;default:false" json:"is_favorit"`    // Ditampilkan di seksi Menu Favorit
	IsBestSeller bool      `gorm:"type:boolean;default:false" json:"is_best_seller"` // Ditampilkan di seksi Best Seller
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Menu) TableName() string {
	return "menus"
}
