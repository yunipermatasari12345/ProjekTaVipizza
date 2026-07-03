package config

import (
	"log"
	"os"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
	"github.com/midtrans/midtrans-go/snap"
)

var SnapClient snap.Client
var CoreAPIClient coreapi.Client

// InisialisasiMidtrans mengatur kredensial untuk koneksi Midtrans
func InisialisasiMidtrans() {
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	env := os.Getenv("MIDTRANS_ENVIRONMENT")

	if serverKey == "" {
		log.Println("[WARNING] MIDTRANS_SERVER_KEY tidak ditemukan di .env. Midtrans tidak akan berfungsi.")
		return
	}

	environment := midtrans.Sandbox
	if env == "production" {
		environment = midtrans.Production
	}

	// Inisialisasi klien Snap (untuk frontend popup)
	SnapClient.New(serverKey, environment)
	
	// Inisialisasi klien CoreAPI (untuk ngecek status transaksi dll)
	CoreAPIClient.New(serverKey, environment)

	log.Println("[INFO] Midtrans terhubung pada environment:", env)
}
