package models

import "time"

// PesanPelanggan merepresentasikan pertanyaan yang dikirim pelanggan melalui halaman Kontak
type PesanPelanggan struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	PenggunaID  *uint      `gorm:"index" json:"pengguna_id"`
	Nama        string     `gorm:"type:varchar(150);not null" json:"nama"`
	Email       string     `gorm:"type:varchar(200);not null" json:"email"`
	Pertanyaan  string     `gorm:"type:text;not null" json:"pertanyaan"`
	Balasan     *string    `gorm:"type:text" json:"balasan"`
	WaktuBalas  *time.Time `json:"waktu_balas"`
	CreatedAt   time.Time  `json:"waktu"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (PesanPelanggan) TableName() string {
	return "pesan_pelanggan"
}
