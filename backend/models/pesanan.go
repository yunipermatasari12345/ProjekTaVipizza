package models

import "time"

// Pesanan merepresentasikan data transaksi pemesanan pizza oleh pelanggan
type Pesanan struct {
	ID                uint          `gorm:"primaryKey" json:"id"`
	PenggunaID        uint          `gorm:"not null" json:"pengguna_id"`
	Pengguna          Pengguna      `gorm:"foreignKey:PenggunaID" json:"pengguna"`
	NamaPenerima      string        `gorm:"type:varchar(100)" json:"nama_penerima"`
	TanggalPesanan    time.Time     `json:"tanggal_pesanan"`
	TotalHarga        int           `gorm:"type:int;not null" json:"total_harga"`
	Status            string        `gorm:"type:varchar(50);default:'menunggu_pembayaran'" json:"status"`
	StatusPembayaran  string        `gorm:"type:varchar(50);default:'belum_dibayar'" json:"status_pembayaran"`
	AlamatPengiriman  string        `gorm:"type:text;not null" json:"alamat_pengiriman" binding:"required"`
	Telepon           string        `gorm:"type:varchar(20);not null" json:"telepon" binding:"required"`
	Catatan           string        `gorm:"type:varchar(255)" json:"catatan"`
	MetodePembayaran  string        `gorm:"type:varchar(50);not null" json:"metode_pembayaran" binding:"required"`
	BuktiPembayaran   string        `gorm:"type:varchar(255)" json:"bukti_pembayaran"`
	NamaBank          string        `gorm:"type:varchar(100)" json:"nama_bank"`
	NamaPengirim      string        `gorm:"type:varchar(100)" json:"nama_pengirim"`
	CatatanPenolakan  string        `gorm:"type:text" json:"catatan_penolakan"`
	KodePromo         string        `gorm:"type:varchar(50)" json:"kode_promo"`
	Diskon            int           `gorm:"type:int;default:0" json:"diskon"`
	SnapToken         string        `gorm:"type:varchar(255)" json:"snap_token"`
	MidtransID        string        `gorm:"type:varchar(255)" json:"midtrans_id"`
	ItemPesanan       []ItemPesanan `gorm:"foreignKey:PesananID;constraint:OnDelete:CASCADE;" json:"item_pesanan"`
	CreatedAt         time.Time     `json:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Pesanan) TableName() string {
	return "pesanan"
}
