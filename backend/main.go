// main.go - ENTRY POINT BACKEND VIPIZZA
// ============================================================
// File ini adalah titik awal (entry point) aplikasi backend.
// Fungsi utama:
//  1. Hubungkan ke database MySQL (XAMPP)
//  2. Migrasi otomatis struktur tabel
//  3. Isi data demo (seed) jika database kosong
//  4. Daftarkan semua endpoint REST API
//  5. Jalankan server HTTP di port 8080
//
// ============================================================
package main

import (
	"fmt"
	"log"
	"os"
	"vipizza/config"
	"vipizza/handlers"
	"vipizza/middleware"
	"vipizza/models"
	"vipizza/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 0. Muat file .env
	if err := godotenv.Load(); err != nil {
		log.Println("[WARNING] File .env tidak ditemukan, menggunakan environment variable sistem")
	}

	// 1. Hubungkan ke database MySQL
	config.HubungkanDatabase()

	// 1.5 Inisialisasi Midtrans
	config.InisialisasiMidtrans()

	// 2. Lakukan Auto-Migrasi Skema Database GORM (9 Tabel TA Vipizza)
	fmt.Println("Melakukan migrasi database...")
	err := config.DB.AutoMigrate(
		// 1. Tabel users (pengguna)
		&models.Pengguna{},
		// 2. Tabel categories (kategori menu)
		&models.Kategori{},
		// 3. Tabel menus (daftar menu pizza)
		&models.Menu{},
		// 4. Tabel promos (promo / diskon)
		&models.Promo{},
		// 5. Tabel carts (keranjang belanja)
		&models.Keranjang{},
		// 6. Tabel orders (pesanan)
		&models.Pesanan{},
		// 7. Tabel order_items (item dalam pesanan)
		&models.ItemPesanan{},
		// 8. Tabel payments (pembayaran)
		&models.Pembayaran{},
		// 9. Tabel notifications (notifikasi)
		&models.Notifikasi{},
		// 10. Tabel pesan_pelanggan (pertanyaan dari halaman Kontak)
		&models.PesanPelanggan{},
		// 11. Tabel ulasan (rating menu)
		&models.Ulasan{},
		// 12. Tabel galeri (galeri foto)
		&models.Galeri{},
	)
	if err != nil {
		log.Fatalf("Gagal melakukan auto-migrasi database: %v", err)
	}

	// FIX: Memastikan kolom harga di database tidak memiliki batas 5 digit (yang menyebabkan angka terpotong menjadi 99999)
	config.DB.Exec("ALTER TABLE menus MODIFY harga INT(11) NOT NULL;")
	config.DB.Exec("ALTER TABLE menus MODIFY harga_medium INT(11) DEFAULT 0;")
	config.DB.Exec("ALTER TABLE menus MODIFY harga_large INT(11) DEFAULT 0;")
	fmt.Println("Migrasi database selesai!")

	// 3. Seed data default jika tabel kosong (Sangat berguna untuk pengujian awal)
	seedDataDefault()

	// 4. Inisialisasi router Gin
	r := gin.Default()

	// Gunakan middleware CORS
	r.Use(middleware.MiddlewareCORS())

	// Sediakan folder uploads secara statis agar bisa diakses browser
	// (Contoh: http://localhost:8080/uploads/menus/123.jpg)
	_ = os.MkdirAll("uploads/menus", os.ModePerm)
	_ = os.MkdirAll("uploads/payments", os.ModePerm)
	_ = os.MkdirAll("uploads/promo", os.ModePerm)
	_ = os.MkdirAll("uploads/galeri", os.ModePerm)
	r.Static("/uploads", "./uploads")

	// 5. Definisikan Endpoint RESTful API
	api := r.Group("/api")
	{
		// --- rute publik (tidak perlu login) ---
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", handlers.Registrasi)
			authGroup.POST("/login", handlers.Login)
			authGroup.POST("/forgot-password", handlers.LupaPassword)
		}

		// Menu (publik)
		api.GET("/menus", handlers.AmbilSemuaMenu)
		api.GET("/menus/rekomendasi", handlers.AmbilRekomendasiMenu)
		api.GET("/menus/:id", handlers.AmbilDetailMenu)
		api.GET("/menus/:id/ulasan", handlers.AmbilUlasanMenu)

		// Galeri (publik - hanya GET untuk melihat)
		api.GET("/galeri", handlers.AmbilSemuaGaleri)

		// Ulasan (publik)
		api.GET("/ulasan/terbaru", handlers.AmbilSemuaUlasanTerbaru)
		api.POST("/ulasan/publik", handlers.TambahUlasanPublik)

		// Promo publik (tidak perlu login)
		promoGroup := api.Group("/promo")
		{
			promoGroup.GET("", handlers.AmbilSemuaPromo)
			promoGroup.GET("/check", handlers.CekKodePromo)
		}

		// Webhook Midtrans (publik, diakses oleh server midtrans)
		api.POST("/payment/notification", handlers.MidtransNotification)

		// Pesan pelanggan — kirim pesan (bisa tanpa login)
		api.GET("/pesan-pelanggan", handlers.AmbilSemuaPesanPelanggan)
		api.POST("/pesan-pelanggan", handlers.KirimPesanPelanggan)

		// --- rute terproteksi (harus login terlebih dahulu) ---
		terproteksi := api.Group("")
		terproteksi.Use(middleware.WajibAutentikasi())
		{
			// Profil user
			terproteksi.GET("/auth/me", handlers.GetProfil)
			terproteksi.PUT("/auth/me", handlers.UpdateProfil)
			terproteksi.PUT("/auth/change-password", handlers.ChangePassword)

			// Dashboard pelanggan
			terproteksi.GET("/dashboard", handlers.RingkasanDashboardPelanggan)

			// Fitur pemesanan untuk pelanggan (Customer)
			terproteksi.POST("/orders", middleware.WajibPelanggan(), handlers.BuatPesanan)
			terproteksi.GET("/orders/my", handlers.RiwayatPesananSaya)
			terproteksi.GET("/orders/:id", handlers.DetailPesanan)
			terproteksi.POST("/orders/:id/payment", handlers.UnggahBuktiBayar)
			terproteksi.POST("/orders/:id/refresh-token", handlers.RefreshSnapToken)
			terproteksi.POST("/orders/:id/verify-payment", handlers.VerifikasiPembayaran)
			terproteksi.POST("/orders/:id/ulasan", handlers.TambahUlasan)
			terproteksi.POST("/galeri", handlers.TambahGaleri) // Pelanggan login bisa tambah galeri

			// --- rute khusus administrator (Admin-Only) ---
			adminGroup := terproteksi.Group("")
			adminGroup.Use(middleware.WajibAdmin())
			{
				// Manajemen data menu
				adminGroup.POST("/menus", handlers.TambahMenu)
				adminGroup.PUT("/menus/:id", handlers.EditMenu)
				adminGroup.DELETE("/menus/:id", handlers.HapusMenu)

				// Manajemen kategori
				adminGroup.GET("/categories", handlers.AmbilSemuaKategori)
				adminGroup.GET("/categories/:id", handlers.AmbilDetailKategori)
				adminGroup.POST("/categories", handlers.TambahKategori)
				adminGroup.PUT("/categories/:id", handlers.EditKategori)
				adminGroup.DELETE("/categories/:id", handlers.HapusKategori)

				// Manajemen pesanan masuk
				adminGroup.GET("/orders", handlers.AmbilSemuaPesanan)
				adminGroup.PUT("/orders/:id/status", handlers.PerbaruiStatusPesanan)
				adminGroup.DELETE("/orders/:id", handlers.HapusPesanan)

				// Manajemen promo
				adminGroup.GET("/promo/admin", handlers.AmbilSemuaPromoAdmin)
				adminGroup.POST("/promo", handlers.TambahPromo)
				adminGroup.PUT("/promo/:id", handlers.EditPromo)
				adminGroup.DELETE("/promo/:id", handlers.HapusPromo)

				// Data pengguna (admin & pelanggan)
				adminGroup.GET("/users", handlers.AmbilSemuaPengguna)
				adminGroup.POST("/users", handlers.TambahPengguna)
				adminGroup.PUT("/users/:id", handlers.EditPengguna)
				adminGroup.DELETE("/users/:id", handlers.HapusPengguna)
				adminGroup.GET("/users/:id", handlers.AmbilDetailPelanggan)

				// Pesan Pelanggan (Halaman Kontak)
				adminGroup.PUT("/pesan-pelanggan/:id/balas", handlers.BalasPesanPelanggan)
				adminGroup.DELETE("/pesan-pelanggan/:id", handlers.HapusPesanPelanggan)

				// Manajemen Ulasan (Admin)
				adminGroup.GET("/ulasan", handlers.AmbilSemuaUlasanAdmin)
				adminGroup.DELETE("/ulasan/:id", handlers.HapusUlasan)
				adminGroup.DELETE("/galeri/:id", handlers.HapusGaleri)

				// Dashboard ringkasan
				adminGroup.GET("/reports/summary", handlers.RingkasanDashboard)

				// Laporan penjualan
				adminGroup.GET("/reports/sales", handlers.LaporanPenjualanJSON)
				adminGroup.GET("/reports/pdf", handlers.LaporanPenjualanPDF)
			}
		}
	}

	// 6. Jalankan server pada port default 8080 atau melalui ENV
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server backend ViPizza berjalan pada port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Gagal menjalankan server Gin: %v", err)
	}
}

// seedDataDefault mengisi data awal ke database jika tabel kosong
func seedDataDefault() {
	// 1. Seed data Admin default
	var hitungAdmin int64
	config.DB.Model(&models.Pengguna{}).Where("peran = ?", "admin").Count(&hitungAdmin)
	if hitungAdmin == 0 {
		hashPassword, _ := utils.HashPassword("adminvipizza")
		adminDefault := models.Pengguna{
			Nama:     "Admin Vipizza",
			Email:    "admin@vipizza.com",
			Password: hashPassword,
			Peran:    "admin",
			Telepon:  "081234567890",
			Alamat:   "Kantor Pusat Vipizza, Kota Padang",
		}
		config.DB.Create(&adminDefault)
		fmt.Println("[SEED] Berhasil menambahkan Admin default (email: admin@vipizza.com, pass: adminvipizza)")
	}

	// 2. Seed data Pelanggan default untuk simulasi
	var hitungCustomer int64
	config.DB.Model(&models.Pengguna{}).Where("peran = ?", "pelanggan").Count(&hitungCustomer)
	if hitungCustomer == 0 {
		hashPassword, _ := utils.HashPassword("pelangganvipizza")
		customerDefault := models.Pengguna{
			Nama:     "Budi Santoso",
			Email:    "budi@vipizza.com",
			Password: hashPassword,
			Peran:    "pelanggan",
			Telepon:  "082345678901",
			Alamat:   "Jl. Khatib Sulaiman No. 12, Padang Utara, Padang",
		}
		config.DB.Create(&customerDefault)
		fmt.Println("[SEED] Berhasil menambahkan Pelanggan default (email: budi@vipizza.com, pass: pelangganvipizza)")
	} else {
		// Update email pelanggan lama (budi@gmail.com -> budi@vipizza.com)
		var customerLama models.Pengguna
		result := config.DB.Where("peran = ? AND email = ?", "pelanggan", "budi@gmail.com").First(&customerLama)
		if result.Error == nil {
			config.DB.Model(&customerLama).Update("email", "budi@vipizza.com")
			fmt.Println("[SEED] Memperbarui email pelanggan: budi@gmail.com -> budi@vipizza.com")
		}
	}

	// 3. Seed data Kategori default
	var hitungKategori int64
	config.DB.Model(&models.Kategori{}).Count(&hitungKategori)
	if hitungKategori == 0 {
		kategoriList := []models.Kategori{
			{Nama: "Pizza", Slug: "pizza", Deskripsi: "Berbagai pilihan pizza homemade Vipizza", Aktif: true},
			{Nama: "Minuman", Slug: "minuman", Deskripsi: "Minuman segar pendamping pizza", Aktif: true},
			{Nama: "Dessert", Slug: "dessert", Deskripsi: "Hidangan penutup manis dan lezat", Aktif: true},
			{Nama: "Paket Hemat", Slug: "paket", Deskripsi: "Paket bundling pizza dengan harga spesial", Aktif: true},
		}
		for _, k := range kategoriList {
			config.DB.Create(&k)
		}
		fmt.Println("[SEED] Berhasil menambahkan 4 Kategori menu ke database!")
	}

	// 4. Seed data Menu default (Sesuai dengan Katalog Mockup Desain)
	var hitungMenu int64
	config.DB.Model(&models.Menu{}).Count(&hitungMenu)
	if hitungMenu == 0 {
		// Ambil ID kategori pizza untuk relasi
		var katPizza models.Kategori
		config.DB.Where("slug = ?", "pizza").First(&katPizza)

		menuList := []models.Menu{
			// 1. Sosis Lovers
			{
				Nama:      "Sosis Lovers Pizza (Medium)",
				Deskripsi: "Pizza lezat dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, sosis sapi/ayam, dan oregano.",
				Harga:     35000,
				Stok:      15,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Sosis Lovers Pizza (Large)",
				Deskripsi: "Ukuran besar! Pizza lezat dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, sosis sapi/ayam, dan oregano.",
				Harga:     50000,
				Stok:      10,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 2. Beef Slice
			{
				Nama:      "Beef Slice Pizza (Medium)",
				Deskripsi: "Pizza gurih dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, beef slice melimpah, dan oregano.",
				Harga:     35000,
				Stok:      12,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Beef Slice Pizza (Large)",
				Deskripsi: "Ukuran besar! Pizza gurih dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, beef slice melimpah, dan oregano.",
				Harga:     50000,
				Stok:      10,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 3. Abon Sapi
			{
				Nama:      "Abon Sapi Pizza (Medium)",
				Deskripsi: "Pizza unik nusantara dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, abon sapi premium, dan oregano.",
				Harga:     35000,
				Stok:      10,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Abon Sapi Pizza (Large)",
				Deskripsi: "Ukuran besar! Pizza unik nusantara dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, abon sapi premium.",
				Harga:     50000,
				Stok:      8,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 4. Cheese Corn Moza
			{
				Nama:      "Cheese Corn Moza Pizza (Medium)",
				Deskripsi: "Perpaduan manis gurih saos tomat/sambal, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer, dan oregano.",
				Harga:     45000,
				Stok:      8,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Cheese Corn Moza Pizza (Large)",
				Deskripsi: "Ukuran besar! Perpaduan manis gurih saos tomat/sambal, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer.",
				Harga:     60000,
				Stok:      5,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 5. Beef Burger Moza
			{
				Nama:      "Beef Burger Moza Pizza (Medium)",
				Deskripsi: "Kenikmatan ekstra saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella lumer, dan beef burger tumis bumbu.",
				Harga:     50000,
				Stok:      10,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Beef Burger Moza Pizza (Large)",
				Deskripsi: "Ukuran besar! Kenikmatan ekstra saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella lumer, beef burger.",
				Harga:     70000,
				Stok:      8,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 6. Chicken Mushroom Moza
			{
				Nama:      "Chicken Mushroom Moza (Medium)",
				Deskripsi: "Pizza spesial dengan saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella, dan tumisan daging ayam jamur.",
				Harga:     60000,
				Stok:      12,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Chicken Mushroom Moza (Large)",
				Deskripsi: "Ukuran besar! Pizza spesial dengan saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella, ayam jamur.",
				Harga:     80000,
				Stok:      10,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 7. Combo Mix Special
			{
				Nama:      "Combo Mix Special Pizza (Medium)",
				Deskripsi: "Paket komplit saos tomat/sambal, mayo, jagung, bombai, keju cheddar, Moza, sosis sapi, sosis ayam, beef slice.",
				Harga:     60000,
				Stok:      8,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			{
				Nama:      "Combo Mix Special Pizza (Large)",
				Deskripsi: "Ukuran besar! Paket komplit saos tomat/sambal, mayo, jagung, bombai, keju cheddar, Moza, sosis sapi/ayam, beef slice.",
				Harga:     80000,
				Stok:      5,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
			// 8. Pizza 1/2 Meter
			{
				Nama:      "Pizza 1/2 Meter (Raksasa)",
				Deskripsi: "Pizza raksasa 1/2 meter dengan kombinasi topping spesial Sosis Lovers mix Beef Burger Moza. Sempurna untuk pesta!",
				Harga:     130000,
				Stok:      5,
				Kategori:  "pizza",
				KategoriID: func() *uint { if katPizza.ID > 0 { return &katPizza.ID }; return nil }(),
				GambarURL: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300",
				Tersedia:  true,
			},
		}

		for _, menu := range menuList {
			config.DB.Create(&menu)
		}
		fmt.Println("[SEED] Berhasil menambahkan 8 Menu pizza resmi Vipizza ke database!")
	}
}

