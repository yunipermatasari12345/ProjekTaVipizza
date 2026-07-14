package utils

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

// ============================================================
// NOTIFIKASI WHATSAPP - File: backend/utils/whatsapp.go
// ============================================================
// Mengirim notifikasi otomatis ke WhatsApp admin saat ada pesanan baru.
//
// CARA SETUP (pilih salah satu):
//
// OPSI 1 - Fonnte (Disarankan untuk UMKM Indonesia):
//   1. Daftar gratis di https://fonnte.com
//   2. Hubungkan nomor WhatsApp Anda
//   3. Salin API Token dari dashboard Fonnte
//   4. Set environment variable:
//      FONNTE_TOKEN=token_anda_disini
//      ADMIN_WA=6281234567890  (nomor admin, format 62 tanpa +)
//
// OPSI 2 - CallMeBot (Gratis, tanpa daftar panjang):
//   1. Kirim WA ke +34 644 44 71 67 isi: "I allow callmebot to send me messages"
//   2. Dapatkan API key dari balasan bot
//   3. Set environment variable:
//      CALLMEBOT_APIKEY=apikey_anda
//      ADMIN_WA=6281234567890
// ============================================================

// KirimNotifikasiWA mengirim pesan WhatsApp ke nomor admin
// Dipanggil otomatis saat ada pesanan baru atau bukti bayar diunggah
func KirimNotifikasiWA(pesan string) {
	nomorAdmin := ambilEnv("ADMIN_WA", "6281234567890") // Ganti dengan nomor WA pemilik UMKM

	// Coba Fonnte terlebih dahulu
	tokenFonnte := os.Getenv("FONNTE_TOKEN")
	if tokenFonnte != "" {
		if err := kirimViaFonnte(nomorAdmin, pesan, tokenFonnte); err == nil {
			fmt.Printf("[WA] Notifikasi terkirim via Fonnte ke %s\n", nomorAdmin)
			return
		} else {
			fmt.Printf("[WA] Gagal Fonnte: %v\n", err)
		}
	}

	// Fallback ke CallMeBot
	apiKeyCallMeBot := os.Getenv("CALLMEBOT_APIKEY")
	if apiKeyCallMeBot != "" {
		if err := kirimViaCallMeBot(nomorAdmin, pesan, apiKeyCallMeBot); err == nil {
			fmt.Printf("[WA] Notifikasi terkirim via CallMeBot ke %s\n", nomorAdmin)
			return
		} else {
			fmt.Printf("[WA] Gagal CallMeBot: %v\n", err)
		}
	}

	// Jika belum dikonfigurasi, cetak ke log saja (untuk demo sidang)
	fmt.Println("[WA] ⚠️  WhatsApp belum dikonfigurasi. Set FONNTE_TOKEN atau CALLMEBOT_APIKEY.")
	fmt.Printf("[WA] Pesan yang akan dikirim:\n%s\n", pesan)
}

// NotifikasiPesananBaru membuat pesan WA saat pelanggan checkout
func NotifikasiPesananBaru(idPesanan uint, namaPelanggan, telepon, alamat string, totalHarga int, daftarMenu string) {
	pesan := fmt.Sprintf(
		"🍕 *PESANAN BARU VIPIZZA!*\n\n"+
			"📋 No. Pesanan: *#%d*\n"+
			"👤 Pelanggan: %s\n"+
			"📱 Telepon: %s\n"+
			"📍 Alamat: %s\n\n"+
			"🛒 *Detail Menu:*\n%s\n"+
			"💰 *Total: Rp %s*\n\n"+
			"⏰ Waktu: %s\n\n"+
			"_Silakan cek dashboard admin untuk validasi pembayaran._",
		idPesanan,
		namaPelanggan,
		telepon,
		alamat,
		daftarMenu,
		formatRupiah(totalHarga),
		time.Now().Format("02/01/2006 15:04 WIB"),
	)
	KirimNotifikasiWA(pesan)
}

// NotifikasiBuktiBayar membuat pesan WA saat pelanggan unggah bukti transfer
func NotifikasiBuktiBayar(idPesanan uint, namaPelanggan, metodeBayar string, totalHarga int) {
	pesan := fmt.Sprintf(
		"💳 *BUKTI PEMBAYARAN MASUK!*\n\n"+
			"📋 No. Pesanan: *#%d*\n"+
			"👤 Pelanggan: %s\n"+
			"💵 Metode: %s\n"+
			"💰 Total: Rp %s\n\n"+
			"✅ Pelanggan sudah unggah bukti bayar.\n"+
			"Silakan validasi di Dashboard Admin!\n\n"+
			"⏰ Waktu: %s",
		idPesanan,
		namaPelanggan,
		strings.ReplaceAll(metodeBayar, "_", " "),
		formatRupiah(totalHarga),
		time.Now().Format("02/01/2006 15:04 WIB"),
	)
	KirimNotifikasiWA(pesan)
}

// --- Fungsi internal pengiriman ---

func kirimViaFonnte(nomor, pesan, token string) error {
	// API Fonnte: https://docs.fonnte.com
	body := url.Values{}
	body.Set("target", nomor)
	body.Set("message", pesan)
	body.Set("countryCode", "62")

	req, err := http.NewRequest("POST", "https://api.fonnte.com/send", strings.NewReader(body.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Fonnte HTTP %d: %s", resp.StatusCode, string(b))
	}
	return nil
}

func kirimViaCallMeBot(nomor, pesan, apiKey string) error {
	// API CallMeBot: https://www.callmebot.com/blog/free-api-whatsapp-messages/
	encodedMsg := url.QueryEscape(pesan)
	apiURL := fmt.Sprintf(
		"https://api.callmebot.com/whatsapp.php?phone=%s&text=%s&apikey=%s",
		nomor, encodedMsg, apiKey,
	)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(apiURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("CallMeBot HTTP %d: %s", resp.StatusCode, string(b))
	}
	return nil
}

func formatRupiah(angka int) string {
	s := fmt.Sprintf("%d", angka)
	n := len(s)
	if n <= 3 {
		return s
	}
	var result bytes.Buffer
	for i, c := range s {
		if i > 0 && (n-i)%3 == 0 {
			result.WriteByte('.')
		}
		result.WriteRune(c)
	}
	return result.String()
}

func ambilEnv(kunci, defaultVal string) string {
	if v := os.Getenv(kunci); v != "" {
		return v
	}
	return defaultVal
}

// BuatLinkWA membuat link wa.me untuk notifikasi manual (fallback frontend)
func BuatLinkWA(nomor, pesan string) string {
	nomor = strings.TrimPrefix(nomor, "+")
	nomor = strings.TrimPrefix(nomor, "0")
	if !strings.HasPrefix(nomor, "62") {
		nomor = "62" + nomor
	}
	return fmt.Sprintf("https://wa.me/%s?text=%s", nomor, url.QueryEscape(pesan))
}

// CekKonfigurasiWA mengecek apakah WA sudah dikonfigurasi (untuk endpoint info)
func CekKonfigurasiWA() map[string]interface{} {
	return map[string]interface{}{
		"fonnte_aktif":    os.Getenv("FONNTE_TOKEN") != "",
		"callmebot_aktif": os.Getenv("CALLMEBOT_APIKEY") != "",
		"nomor_admin":     ambilEnv("ADMIN_WA", "6281234567890"),
	}
}

// KirimNotifikasiPelanggan mengirim pesan WA ke nomor spesifik pelanggan
func KirimNotifikasiPelanggan(nomor string, pesan string) {
	// Format nomor ke format 62 jika belum
	nomor = strings.TrimPrefix(nomor, "+")
	nomor = strings.TrimPrefix(nomor, "0")
	if !strings.HasPrefix(nomor, "62") {
		nomor = "62" + nomor
	}

	// Coba Fonnte terlebih dahulu
	tokenFonnte := os.Getenv("FONNTE_TOKEN")
	if tokenFonnte != "" {
		if err := kirimViaFonnte(nomor, pesan, tokenFonnte); err == nil {
			fmt.Printf("[WA Pelanggan] Notifikasi terkirim ke %s\n", nomor)
			return
		}
	}

	// Fallback CallMeBot
	apiKeyCallMeBot := os.Getenv("CALLMEBOT_APIKEY")
	if apiKeyCallMeBot != "" {
		if err := kirimViaCallMeBot(nomor, pesan, apiKeyCallMeBot); err == nil {
			fmt.Printf("[WA Pelanggan] Notifikasi terkirim via CallMeBot ke %s\n", nomor)
			return
		}
	}

	// Jika API gagal atau belum diset, cetak simulasi ke konsol agar tidak error
	fmt.Printf("[WA Pelanggan (SIMULASI - API belum diset)] Mengirim pesan ke %s:\n%s\n", nomor, pesan)
}
