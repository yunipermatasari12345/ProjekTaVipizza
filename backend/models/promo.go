package models

import "time"

// Promo merepresentasikan data promosi / diskon yang ditampilkan di halaman utama
type Promo struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Judul       string    `gorm:"type:varchar(150);not null" json:"judul"`
	Deskripsi   string    `gorm:"type:text" json:"deskripsi"`
	Diskon      int       `gorm:"type:int;default:0" json:"diskon"`       // persen, misal: 20 = 20%
	KodePromo   string    `gorm:"type:varchar(50)" json:"kode_promo"`      // kode unik untuk redeem
	BannerURL   string    `gorm:"type:varchar(255)" json:"banner_url"`     // gambar banner promo
	TanggalMulai time.Time `json:"tanggal_mulai"`
	TanggalAkhir time.Time `json:"tanggal_akhir"`
	Aktif       bool      `gorm:"type:boolean;default:true" json:"aktif"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Promo) TableName() string {
	return "promos"
}

