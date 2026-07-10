package models

import "time"

// Pembayaran merepresentasikan detail transaksi pembayaran untuk setiap pesanan
type Pembayaran struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	PesananID        uint      `gorm:"not null;uniqueIndex" json:"pesanan_id"` // satu pesanan satu catatan pembayaran
	Pesanan          Pesanan   `gorm:"foreignKey:PesananID;constraint:OnDelete:CASCADE;" json:"pesanan,omitempty"`
	MetodePembayaran string    `gorm:"type:varchar(50);not null" json:"metode_pembayaran"` // 'midtrans', 'transfer_bank', 'qris'
	Status           string    `gorm:"type:varchar(50);default:'belum_dibayar'" json:"status"` // 'belum_dibayar', 'lunas', 'gagal', 'expired'
	JumlahDibayar    int       `gorm:"type:int;default:0" json:"jumlah_dibayar"`
	SnapToken        string    `gorm:"type:varchar(255)" json:"snap_token"`        // token Midtrans Snap
	MidtransOrderID  string    `gorm:"type:varchar(255)" json:"midtrans_order_id"` // order ID custom di Midtrans
	BuktiPembayaran  string    `gorm:"type:varchar(255)" json:"bukti_pembayaran"`  // path foto bukti transfer
	NamaBank         string    `gorm:"type:varchar(100)" json:"nama_bank"`         // nama bank / e-wallet pengirim
	NamaPengirim     string    `gorm:"type:varchar(100)" json:"nama_pengirim"`     // nama rekening pengirim
	TanggalBayar     *time.Time `json:"tanggal_bayar"`                             // waktu pembayaran dikonfirmasi
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// TableName menentukan nama tabel di MySQL
func (Pembayaran) TableName() string {
	return "payments"
}
