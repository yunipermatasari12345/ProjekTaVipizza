package models

import "time"

// Notifikasi merepresentasikan log notifikasi yang dikirim ke admin atau pelanggan
type Notifikasi struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PenggunaID uint      `gorm:"index" json:"pengguna_id"`                         // penerima notifikasi (bisa null = broadcast)
	Pengguna   Pengguna  `gorm:"foreignKey:PenggunaID;constraint:OnDelete:SET NULL;" json:"pengguna,omitempty"`
	PesananID  *uint     `gorm:"index" json:"pesanan_id"`                          // terkait pesanan (opsional)
	Judul      string    `gorm:"type:varchar(150);not null" json:"judul"`
	Pesan      string    `gorm:"type:text;not null" json:"pesan"`
	Tipe       string    `gorm:"type:varchar(50);not null" json:"tipe"`            // 'pesanan_baru', 'pembayaran_masuk', 'pesanan_diproses', 'pesanan_dikirim', 'pesanan_selesai', 'promo'
	Kanal      string    `gorm:"type:varchar(50);default:'sistem'" json:"kanal"`   // 'whatsapp', 'sistem', 'email'
	SudahDibaca bool     `gorm:"type:boolean;default:false" json:"sudah_dibaca"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Notifikasi) TableName() string {
	return "notifications"
}
