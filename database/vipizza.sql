-- ============================================================
-- DATABASE VIPIZZA - Sistem Pemesanan UMKM Vipizza Homemade Padang
-- ============================================================
-- Database & tabel dibuat OTOMATIS oleh backend Go (GORM AutoMigrate).
-- File ini hanya untuk dokumentasi skripsi & referensi skema tabel.
--
-- Skema tabel di bawah COCOK dengan yang dibuat GORM:
--   users, categories, menus, promos, carts,
--   orders, order_items, payments, notifications
-- ============================================================

CREATE DATABASE IF NOT EXISTS `vipizza`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `vipizza`;

-- ------------------------------------------------------------
-- TABEL: users (Akun Admin & Pelanggan)
-- Model: backend/models/pengguna.go -> TableName() = "users"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama`       VARCHAR(100)    NOT NULL,
  `email`      VARCHAR(100)    NOT NULL,
  `password`   VARCHAR(255)    NOT NULL COMMENT 'Bcrypt hash',
  `peran`      VARCHAR(20)     NOT NULL DEFAULT 'pelanggan' COMMENT 'admin | pelanggan',
  `telepon`    VARCHAR(20)     DEFAULT NULL,
  `alamat`     TEXT            DEFAULT NULL,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: categories (Kategori Menu)
-- Model: backend/models/kategori.go -> TableName() = "categories"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama`       VARCHAR(100)    NOT NULL,
  `slug`       VARCHAR(100)    NOT NULL,
  `deskripsi`  TEXT            DEFAULT NULL,
  `aktif`      TINYINT(1)      DEFAULT 1,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_categories_nama` (`nama`),
  UNIQUE INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: menus (Katalog Pizza & Produk)
-- Model: backend/models/menu.go -> TableName() = "menus"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menus` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kategori_id`  BIGINT UNSIGNED DEFAULT NULL,
  `nama`         VARCHAR(100)    NOT NULL,
  `deskripsi`    TEXT            DEFAULT NULL,
  `harga`        INT             NOT NULL COMMENT 'Harga dalam Rupiah',
  `harga_medium` INT             DEFAULT 0,
  `harga_large`  INT             DEFAULT 0,
  `stok`         INT             NOT NULL DEFAULT 0,
  `kategori`     VARCHAR(50)     NOT NULL COMMENT 'pizza | minuman | dessert | paket',
  `gambar_url`   VARCHAR(255)    DEFAULT NULL,
  `tersedia`     TINYINT(1)      DEFAULT 1,
  `created_at`   DATETIME(3)     DEFAULT NULL,
  `updated_at`   DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_menus_kategori_id` (`kategori_id`),
  CONSTRAINT `fk_menus_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: promos (Promo / Diskon)
-- Model: backend/models/promo.go -> TableName() = "promos"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promos` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul`         VARCHAR(150)    NOT NULL,
  `deskripsi`     TEXT            DEFAULT NULL,
  `diskon`        INT             DEFAULT 0 COMMENT 'Persen, misal 20 = 20%',
  `kode_promo`    VARCHAR(50)     DEFAULT NULL,
  `banner_url`    VARCHAR(255)    DEFAULT NULL,
  `tanggal_mulai` DATETIME(3)     DEFAULT NULL,
  `tanggal_akhir` DATETIME(3)     DEFAULT NULL,
  `aktif`         TINYINT(1)      DEFAULT 1,
  `created_at`    DATETIME(3)     DEFAULT NULL,
  `updated_at`    DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: carts (Keranjang Belanja)
-- Model: backend/models/keranjang.go -> TableName() = "carts"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `carts` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pengguna_id` BIGINT UNSIGNED NOT NULL,
  `menu_id`    BIGINT UNSIGNED NOT NULL,
  `jumlah`     INT             NOT NULL DEFAULT 1,
  `catatan`    VARCHAR(255)    DEFAULT NULL,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_carts_pengguna` (`pengguna_id`),
  INDEX `idx_carts_menu` (`menu_id`),
  CONSTRAINT `fk_carts_users` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_carts_menus` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: orders (Pesanan)
-- Model: backend/models/pesanan.go -> TableName() = "orders"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pengguna_id`       BIGINT UNSIGNED NOT NULL,
  `nama_penerima`     VARCHAR(100)    DEFAULT NULL,
  `tanggal_pesanan`   DATETIME(3)     DEFAULT NULL,
  `total_harga`       INT             NOT NULL,
  `status`            VARCHAR(50)     NOT NULL DEFAULT 'menunggu_pembayaran'
                      COMMENT 'menunggu_pembayaran | menunggu_validasi | diproses | dikirim | selesai | dibatalkan',
  `status_pembayaran` VARCHAR(50)     NOT NULL DEFAULT 'belum_dibayar'
                      COMMENT 'belum_dibayar | lunas | gagal',
  `alamat_pengiriman` TEXT            NOT NULL,
  `telepon`           VARCHAR(20)     NOT NULL,
  `catatan`           VARCHAR(255)    DEFAULT NULL,
  `metode_pembayaran` VARCHAR(50)     NOT NULL COMMENT 'midtrans | transfer_bank | qris',
  `bukti_pembayaran`  VARCHAR(255)    DEFAULT NULL,
  `nama_bank`         VARCHAR(100)    DEFAULT NULL,
  `nama_pengirim`     VARCHAR(100)    DEFAULT NULL,
  `catatan_penolakan` TEXT            DEFAULT NULL,
  `kode_promo`        VARCHAR(50)     DEFAULT NULL,
  `diskon`            INT             DEFAULT 0,
  `snap_token`        VARCHAR(255)    DEFAULT NULL,
  `midtrans_id`       VARCHAR(255)    DEFAULT NULL,
  `created_at`        DATETIME(3)     DEFAULT NULL,
  `updated_at`        DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_pengguna` (`pengguna_id`),
  INDEX `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_users` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: order_items (Item dalam Pesanan)
-- Model: backend/models/item_pesanan.go -> TableName() = "order_items"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pesanan_id` BIGINT UNSIGNED NOT NULL,
  `menu_id`    BIGINT UNSIGNED NOT NULL,
  `jumlah`     INT             NOT NULL,
  `harga`      INT             NOT NULL COMMENT 'Harga historis saat dipesan',
  `catatan`    VARCHAR(255)    DEFAULT NULL,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_pesanan` (`pesanan_id`),
  INDEX `idx_order_items_menu` (`menu_id`),
  CONSTRAINT `fk_order_items_orders` FOREIGN KEY (`pesanan_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_menus` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: payments (Pembayaran)
-- Model: backend/models/pembayaran.go -> TableName() = "payments"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pesanan_id`    BIGINT UNSIGNED NOT NULL,
  `metode`        VARCHAR(50)     DEFAULT NULL,
  `status`        VARCHAR(50)     DEFAULT NULL,
  `jumlah`        INT             DEFAULT NULL,
  `transaction_id` VARCHAR(255)   DEFAULT NULL,
  `snap_token`    VARCHAR(255)    DEFAULT NULL,
  `created_at`    DATETIME(3)     DEFAULT NULL,
  `updated_at`    DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_pesanan` (`pesanan_id`),
  CONSTRAINT `fk_payments_orders` FOREIGN KEY (`pesanan_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL: notifications (Notifikasi)
-- Model: backend/models/notifikasi.go -> TableName() = "notifications"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pengguna_id` BIGINT UNSIGNED DEFAULT NULL,
  `judul`      VARCHAR(255)    DEFAULT NULL,
  `pesan`      TEXT            DEFAULT NULL,
  `dibaca`     TINYINT(1)      DEFAULT 0,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_pengguna` (`pengguna_id`),
  CONSTRAINT `fk_notifications_users` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATA AWAL (SEED) - Untuk Dokumentasi
-- NOTE: Backend Go (main.go -> seedDataDefault) akan mengisi
-- data ini OTOMATIS saat pertama kali dijalankan.
-- Jalankan backend, jangan import manual file ini!
-- ============================================================

-- Password: adminvipizza (bcrypt placeholder)
INSERT INTO `users` (`nama`, `email`, `password`, `peran`, `telepon`, `alamat`, `created_at`, `updated_at`) VALUES
('Admin Vipizza', 'admin@vipizza.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'admin', '081234567890', 'Kantor Pusat Vipizza, Kota Padang', NOW(), NOW()),
('Budi Santoso', 'budi@vipizza.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'pelanggan', '082345678901', 'Jl. Khatib Sulaiman No. 12, Padang Utara, Padang', NOW(), NOW())
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- Kategori (id=1)
INSERT INTO `categories` (`nama`, `slug`, `deskripsi`, `aktif`) VALUES
('Pizza', 'pizza', 'Berbagai pilihan pizza homemade Vipizza', 1),
('Minuman', 'minuman', 'Minuman segar pendamping pizza', 1),
('Dessert', 'dessert', 'Hidangan penutup manis dan lezat', 1),
('Paket Hemat', 'paket', 'Paket bundling pizza dengan harga spesial', 1);

-- Menu (kategori_id=1)
INSERT INTO `menus` (`kategori_id`, `nama`, `deskripsi`, `harga`, `stok`, `kategori`, `gambar_url`, `tersedia`) VALUES
(1, 'Sosis Lovers Pizza', 'Pizza lezat dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, sosis sapi/ayam, dan oregano.', 35000, 15, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Beef Slice Pizza', 'Pizza gurih dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, beef slice melimpah, dan oregano.', 35000, 12, 'pizza', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Abon Sapi Pizza', 'Pizza unik nusantara dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, abon sapi premium, dan oregano.', 35000, 10, 'pizza', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Cheese Corn Moza Pizza', 'Perpaduan manis gurih saos tomat/sambal, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer, dan oregano.', 45000, 8, 'pizza', 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Beef Burger Moza Pizza', 'Kenikmatan ekstra saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella lumer, dan beef burger tumis bumbu.', 50000, 10, 'pizza', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Chicken Mushroom Moza', 'Pizza spesial dengan saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella, dan tumisan daging ayam jamur gurih.', 60000, 12, 'pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Combo Mix Special Pizza', 'Paket komplit saos tomat/sambal, mayo, jagung, bombai, keju cheddar, Moza, sosis sapi, sosis ayam, dan beef slice premium.', 60000, 8, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300', 1),
(1, 'Pizza 1/2 Meter (Raksasa)', 'Pizza raksasa 1/2 meter dengan kombinasi topping spesial Sosis Lovers mix Beef Burger Moza. Sempurna untuk pesta!', 130000, 5, 'pizza', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300', 1);
