-- ============================================================
-- DATABASE VIPIZZA - Sistem Pemesanan UMKM Vipizza Homemade Padang
-- Final Schema (Tugas Akhir)
-- ============================================================
-- Cara import di XAMPP:
--   1. Buka http://localhost/phpmyadmin
--   2. Klik tab "Import" / "Impor"
--   3. Pilih file vipizza.sql ini, lalu klik "Go" / "Jalankan"
--
-- ATAU: Backend Go akan otomatis buat database & tabel saat dijalankan.
-- File SQL ini berguna untuk dokumentasi skripsi & backup manual.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `vipizza`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `vipizza`;

-- ------------------------------------------------------------
-- TABEL 1: pengguna (Akun Admin & Pelanggan)
-- File model: backend/models/pengguna.go
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama`       VARCHAR(100)    NOT NULL,
  `email`      VARCHAR(100)    NOT NULL,
  `password`   VARCHAR(255)    NOT NULL COMMENT 'Password di-hash dengan Bcrypt',
  `peran`      VARCHAR(20)     NOT NULL DEFAULT 'pelanggan' COMMENT 'admin atau pelanggan',
  `telepon`    VARCHAR(20)     DEFAULT NULL,
  `alamat`     TEXT            DEFAULT NULL,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pengguna_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL 2: menu (Katalog Pizza & Produk)
-- File model: backend/models/menu.go
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menu` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama`       VARCHAR(100)    NOT NULL,
  `deskripsi`  TEXT            DEFAULT NULL,
  `harga`      INT             NOT NULL COMMENT 'Harga dalam Rupiah',
  `stok`       INT             NOT NULL DEFAULT 0,
  `kategori`   VARCHAR(50)     NOT NULL COMMENT 'pizza, side, drink, dessert',
  `gambar_url` VARCHAR(255)    DEFAULT NULL,
  `tersedia`   TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL 3: promo (Promosi & Diskon)
-- File model: backend/models/promo.go
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promo` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul`         VARCHAR(150)    NOT NULL,
  `deskripsi`     TEXT            DEFAULT NULL,
  `diskon`        INT             NOT NULL DEFAULT 0 COMMENT 'Persen diskon, misal 20 = 20%',
  `kode_promo`    VARCHAR(50)     DEFAULT NULL COMMENT 'Kode unik untuk redeem',
  `banner_url`    VARCHAR(255)    DEFAULT NULL,
  `tanggal_mulai` DATETIME(3)     DEFAULT NULL,
  `tanggal_akhir` DATETIME(3)     DEFAULT NULL,
  `aktif`         TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`    DATETIME(3)     DEFAULT NULL,
  `updated_at`    DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL 4: pesanan (Transaksi Pemesanan)
-- File model: backend/models/pesanan.go
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pesanan` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pengguna_id`       BIGINT UNSIGNED NOT NULL,
  `nama_penerima`     VARCHAR(100)    DEFAULT NULL,
  `tanggal_pesanan`   DATETIME(3)     DEFAULT NULL,
  `total_harga`       INT             NOT NULL,
  `status`            VARCHAR(50)     NOT NULL DEFAULT 'menunggu_pembayaran'
                      COMMENT 'menunggu_pembayaran | diproses | sedang_diantar | selesai | dibatalkan',
  `status_pembayaran` VARCHAR(50)     NOT NULL DEFAULT 'belum_dibayar'
                      COMMENT 'belum_dibayar | lunas',
  `alamat_pengiriman` TEXT            NOT NULL,
  `telepon`           VARCHAR(20)     NOT NULL,
  `catatan`           VARCHAR(255)    DEFAULT NULL,
  `metode_pembayaran` VARCHAR(50)     NOT NULL COMMENT 'midtrans | tunai',
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
  KEY `idx_pesanan_pengguna` (`pengguna_id`),
  KEY `idx_pesanan_status` (`status`),
  CONSTRAINT `fk_pesanan_pengguna`
    FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABEL 5: item_pesanan (Detail Item dalam Pesanan)
-- File model: backend/models/item_pesanan.go
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `item_pesanan` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pesanan_id` BIGINT UNSIGNED NOT NULL,
  `menu_id`    BIGINT UNSIGNED NOT NULL,
  `jumlah`     INT             NOT NULL,
  `harga`      INT             NOT NULL COMMENT 'Harga saat dipesan (historis)',
  `catatan`    VARCHAR(255)    DEFAULT NULL,
  `created_at` DATETIME(3)     DEFAULT NULL,
  `updated_at` DATETIME(3)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_item_pesanan_pesanan` (`pesanan_id`),
  KEY `idx_item_pesanan_menu` (`menu_id`),
  CONSTRAINT `fk_item_pesanan_pesanan`
    FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_pesanan_menu`
    FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATA AWAL (SEED) - Akun Demo untuk Pengujian & Sidang
-- Password di-hash Bcrypt (cost 10)
-- admin@vipizza.com  -> adminvipizza
-- budi@gmail.com     -> pelangganvipizza
-- ============================================================

INSERT INTO `pengguna` (`nama`, `email`, `password`, `peran`, `telepon`, `alamat`, `created_at`, `updated_at`) VALUES
('Admin Vipizza', 'admin@vipizza.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'admin', '081234567890', 'Kantor Pusat Vipizza, Kota Padang', NOW(), NOW()),
('Budi Santoso', 'budi@gmail.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'pelanggan', '082345678901', 'Jl. Khatib Sulaiman No. 12, Padang Utara, Padang', NOW(), NOW())
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- ============================================================
-- DATA AWAL MENU PIZZA VIPIZZA
-- ============================================================
INSERT INTO `menu` (`nama`, `deskripsi`, `harga`, `stok`, `kategori`, `gambar_url`, `tersedia`, `created_at`, `updated_at`) VALUES
('Sosis Lovers Pizza', 'Pizza lezat dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, sosis sapi/ayam, dan oregano.', 35000, 15, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Beef Slice Pizza', 'Pizza gurih dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, beef slice melimpah, dan oregano.', 35000, 12, 'pizza', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Abon Sapi Pizza', 'Pizza unik nusantara dengan saos tomat, mayo, jagung manis, bombai, keju cheddar, abon sapi premium, dan oregano.', 35000, 10, 'pizza', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Cheese Corn Moza Pizza', 'Perpaduan manis gurih saos tomat/sambal, mayo, SKM vanilla, jagung manis, keju cheddar, Moza lumer, dan oregano.', 45000, 8, 'pizza', 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Beef Burger Moza Pizza', 'Kenikmatan ekstra saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella lumer, dan beef burger tumis bumbu.', 50000, 10, 'pizza', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Chicken Mushroom Moza', 'Pizza spesial dengan saos tomat/sambal, mayo, jagung, bombai, keju cheddar, mozzarella, dan tumisan daging ayam jamur gurih.', 60000, 12, 'pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Combo Mix Special Pizza', 'Paket komplit saos tomat/sambal, mayo, jagung, bombai, keju cheddar, Moza, sosis sapi, sosis ayam, dan beef slice premium.', 60000, 8, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW()),
('Pizza 1/2 Meter (Raksasa)', 'Pizza raksasa 1/2 meter dengan kombinasi topping spesial Sosis Lovers mix Beef Burger Moza. Sempurna untuk pesta!', 130000, 5, 'pizza', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=300', 1, NOW(), NOW());
