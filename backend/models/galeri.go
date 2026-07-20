package models

import (
	"time"
)

type Galeri struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	GambarURL string    `gorm:"type:varchar(255);not null" json:"gambar_url"`
	Judul     string    `gorm:"type:varchar(255)" json:"judul"`
	Deskripsi string    `gorm:"type:text" json:"deskripsi"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
