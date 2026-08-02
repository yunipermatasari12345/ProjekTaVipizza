-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: vipizza
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pengguna_id` bigint(20) unsigned NOT NULL,
  `menu_id` bigint(20) unsigned NOT NULL,
  `jumlah` bigint(20) NOT NULL DEFAULT 1,
  `catatan` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_carts_pengguna_id` (`pengguna_id`),
  KEY `fk_carts_menu` (`menu_id`),
  CONSTRAINT `fk_carts_menu` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_carts_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uni_categories_nama` (`nama`),
  UNIQUE KEY `uni_categories_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Pizza','pizza','Berbagai pilihan pizza homemade Vipizza',1,'2026-07-20 14:02:53.826','2026-07-20 14:02:53.826'),(2,'Minuman','minuman','Minuman segar pendamping pizza',0,'2026-07-20 14:02:53.832','2026-07-20 14:16:41.280'),(3,'Dessert','dessert','Hidangan penutup manis dan lezat',0,'2026-07-20 14:02:53.838','2026-07-20 14:16:48.998'),(4,'Paket Hemat','paket-hemat','Paket bundling pizza dengan harga spesial',0,'2026-07-20 14:02:53.855','2026-07-20 14:16:53.890');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `galeris`
--

DROP TABLE IF EXISTS `galeris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `galeris` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `gambar_url` varchar(255) NOT NULL,
  `judul` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `galeris`
--

LOCK TABLES `galeris` WRITE;
/*!40000 ALTER TABLE `galeris` DISABLE KEYS */;
INSERT INTO `galeris` VALUES (1,'/uploads/galeri/1784538302_Momen.jpeg','Testimoni Bikin Website','Mendemo kan Hasil projek Ta ke Owner Vipizza Padang','2026-07-20 16:05:02.135','2026-07-20 16:05:02.135'),(2,'/uploads/galeri/1784538491_momen2.jpeg','Serah Terima Projek','Bersama Owner Vipizza Padang','2026-07-20 16:08:11.656','2026-07-20 16:08:11.656'),(3,'/uploads/galeri/1784539007_WhatsApp Image 2026-07-20 at 16.16.23.jpeg','','','2026-07-20 16:16:47.468','2026-07-20 16:16:47.468'),(4,'/uploads/galeri/1784625425_WhatsApp Image 2026-07-18 at 13.12.31 (1).jpeg','ini enak bnget','','2026-07-21 16:17:05.320','2026-07-21 16:17:05.320');
/*!40000 ALTER TABLE `galeris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menus` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kategori_id` bigint(20) unsigned DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` int(11) NOT NULL,
  `harga_medium` int(11) DEFAULT 0,
  `harga_large` int(11) DEFAULT 0,
  `stok` bigint(20) DEFAULT 0,
  `kategori` varchar(50) NOT NULL,
  `gambar_url` varchar(255) DEFAULT NULL,
  `tersedia` tinyint(1) DEFAULT 1,
  `is_favorit` tinyint(1) DEFAULT 0,
  `is_best_seller` tinyint(1) DEFAULT 0,
  `terjual` bigint(20) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `jumlah_ulasan` bigint(20) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_menus_kategori_id` (`kategori_id`),
  CONSTRAINT `fk_menus_kategori_data` FOREIGN KEY (`kategori_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,1,'Paket PROMO 3 box medium Pizza  FREE MINI PIZZA Only 100K','3 pizza ukuran medium dengan topping khusus sosis ayam, Sosis sapi, dan beef slice ditambah dengan Free Pizza kecil varian Manis. Siap melengkapi harimu bersama keluarga, teman2, atau rekan bisnis, yang pastinya bikin lumer suasana.',100000,100000,100000,19,'pizza','/uploads/menus/1784534685_3 box 100.jpeg',1,1,1,2,3.50,2,'2026-07-20 14:02:53.865','2026-07-22 08:19:08.307'),(2,1,'Beef burger Moza ','Pizza dg topping beef burger yg sudah ditumis bumbu dapur yg lezat, perpaduan saos tomat dan barbeque dari beef burgernya pass dan enak banget. Best Seller dan favorit semua nih',50000,50000,70000,3,'pizza','/uploads/menus/1784535517_beef burger moza.jpeg',1,1,0,7,4.00,1,'2026-07-20 14:02:53.871','2026-07-22 15:01:04.695'),(3,1,'Chicken Mushroom Mozza ','Perpaduan chicken fresh yang ditumis dengan bumbu dapur, dipadukan dengan mushroom & bombay yang harum, lalu dilapisi mozzarella lumer ­ƒññ Rasanya gurih, juicy, dan makin lezat di setiap gigitan!',60000,60000,80000,10,'pizza','/uploads/menus/1784535671_Chicken Mushroom Mozza .jpeg',1,0,1,0,0.00,0,'2026-07-20 14:02:53.876','2026-07-20 15:53:13.478'),(4,1,'Cheese corn moza ','Pizza jagung keju yg punya variasi rasa manis dan pedas yang creamy ditambah Mozarella yg lumer pass dilidah para pecinta pedes yg ada manis2nya.. jadi favorit VIP lovers inih ­ƒÿìÔØñ´©Å\r\n',45000,45000,60000,8,'pizza','/uploads/menus/1784535831_Cheese corn moza .jpeg',1,1,0,1,5.00,0,'2026-07-20 14:02:53.882','2026-07-22 13:44:01.601'),(5,1,'Pizza 1/2 M VIPIZZA ÔÇô Sosis Sapi & Beef Burger Full Mozza','Nikmati sensasi pizza jumbo ukuran 1/2 meter dari VIPIZZA dengan topping favorit semua orang! Perpaduan sosis sapi premium dan beef burger juicy yang melimpah, dipadukan dengan keju mozzarella full yang lumer di setiap gigitan ­ƒññ\r\n\r\nDipanggang dengan roti yang lembut, empuk, dan wangi, membuat rasanya makin nagih! Cocok banget buat kamu yang mau makan rame-rame bareng keluarga, teman, atau acara spesial ­ƒÄë',150000,150000,200000,10,'pizza','/uploads/menus/1784536044_WhatsApp Image 2026-07-17 at 13.41.43 (5).jpeg',1,1,1,0,0.00,0,'2026-07-20 14:02:53.888','2026-07-20 15:27:24.042'),(6,1,'Beef Slice Moza ','Nikmati sensasi pizza dengan topping beef slice yang gurih dan juicy, dipadukan dengan keju mozzarella yang meleleh sempurna di setiap gigitan. Rotinya lembut, pinggiranny crunchy , dan aroma oregano yang harum bikin makin menggoda.\r\n',45000,45000,60000,10,'pizza','/uploads/menus/1784536281_Beef Slice Moza .jpeg',1,1,1,0,0.00,0,'2026-07-20 14:02:53.895','2026-07-20 15:31:46.553'),(7,1,'Pizza Abon Sapi','Nikmati lezatnya abon sapi gurih dan enak di atas roti pizza yang lembut, tebal, dan pas di lidah ­ƒññ Bikin kenyang, puas, dan nagih di setiap gigitan!',35000,35000,50000,9,'pizza','/uploads/menus/1784536604_Pizza Abon Sapi.jpeg',1,1,1,1,4.00,1,'2026-07-20 14:02:53.901','2026-07-22 14:40:57.307'),(8,1,'Pizza Otak-Otak Ikan VIPIZZA ','Pizza dengan aroma harum yang menggoda dan rasa gurih khas ikan yang lezat. Dipadukan dengan roti lembut dan topping yang pas, bikin tiap gigitan makin nikmat.',35000,35000,50000,10,'pizza','/uploads/menus/1784536716_Pizza Otak-Otak Ikan VIPIZZA ).jpeg',1,1,0,0,0.00,0,'2026-07-20 14:02:53.907','2026-07-20 15:54:50.882'),(9,1,'Pizza Sosis Ayam ','Pizza dg Rotinya yg lembut sosisnya melimpah bisa request pedes atau original ajjh, lengkap dg keju dan jagung. ',35000,35000,50000,9,'pizza','/uploads/menus/1784536839_Sosis Ayam (8).jpeg',1,1,0,1,5.00,1,'2026-07-20 14:02:53.913','2026-07-22 14:48:48.736'),(10,1,'Pizza Sosis Sapi ','Pizza dg Roti yg lembut sosisnya melimpah bisa request original atau pedes juga lengkap dg keju dan jagung.',35000,35000,50000,10,'pizza','/uploads/menus/1784536929_Sosis Sapi (8).jpeg',1,1,0,0,0.00,0,'2026-07-20 14:02:53.919','2026-07-20 15:55:12.131'),(11,1,'Beef slice ','Pizza dg Roti yg lembut sosisnya melimpah bisa request original atau pedes, lengkap dg keju dan jagung.  ',35000,35000,50000,10,'pizza','/uploads/menus/1784537058_Beef slice  (1).jpeg',1,1,0,0,1.00,1,'2026-07-20 14:02:53.926','2026-07-20 15:55:03.776'),(16,NULL,'beef slice moza','Enak Moza berlimpah dan bisa reques',40000,40000,55000,5,'pizza','/uploads/menus/1784624792_WhatsApp Image 2026-07-18 at 13.12.31 (1).jpeg',1,1,0,0,0.00,0,'2026-07-21 16:06:32.994','2026-07-22 15:01:13.039');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pengguna_id` bigint(20) unsigned DEFAULT NULL,
  `pesanan_id` bigint(20) unsigned DEFAULT NULL,
  `judul` varchar(150) NOT NULL,
  `pesan` text NOT NULL,
  `tipe` varchar(50) NOT NULL,
  `kanal` varchar(50) DEFAULT 'sistem',
  `sudah_dibaca` tinyint(1) DEFAULT 0,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_pengguna_id` (`pengguna_id`),
  KEY `idx_notifications_pesanan_id` (`pesanan_id`),
  CONSTRAINT `fk_notifications_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pesanan_id` bigint(20) unsigned NOT NULL,
  `menu_id` bigint(20) unsigned NOT NULL,
  `jumlah` bigint(20) NOT NULL,
  `harga` bigint(20) NOT NULL,
  `catatan` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_menu` (`menu_id`),
  KEY `fk_orders_item_pesanan` (`pesanan_id`),
  CONSTRAINT `fk_order_items_menu` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`),
  CONSTRAINT `fk_orders_item_pesanan` FOREIGN KEY (`pesanan_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,2,1,50000,'','2026-07-20 14:32:57.636','2026-07-20 14:32:57.636'),(2,2,1,1,35000,'','2026-07-20 14:52:37.002','2026-07-20 14:52:37.002'),(3,3,2,2,50000,'','2026-07-20 19:54:03.672','2026-07-20 19:54:03.672'),(4,4,2,1,50000,'','2026-07-20 20:18:20.957','2026-07-20 20:18:20.957'),(5,5,2,1,50000,'','2026-07-20 20:18:22.353','2026-07-20 20:18:22.353'),(6,6,2,1,50000,'','2026-07-20 20:30:34.022','2026-07-20 20:30:34.022'),(7,7,2,1,50000,'','2026-07-20 20:40:17.024','2026-07-20 20:40:17.024'),(9,9,4,1,45000,'','2026-07-20 20:42:11.031','2026-07-20 20:42:11.031'),(10,10,2,1,50000,'','2026-07-20 20:43:00.226','2026-07-20 20:43:00.226'),(14,14,1,1,100000,'','2026-07-21 16:01:06.577','2026-07-21 16:01:06.577'),(16,16,7,1,35000,'','2026-07-21 16:24:42.934','2026-07-21 16:24:42.934'),(17,17,7,1,35000,'','2026-07-21 16:25:35.940','2026-07-21 16:25:35.940'),(18,18,1,1,100000,'','2026-07-22 08:17:03.136','2026-07-22 08:17:03.136'),(19,19,2,1,50000,'','2026-07-22 13:25:57.276','2026-07-22 13:25:57.276'),(20,20,2,1,50000,'','2026-07-22 13:36:20.107','2026-07-22 13:36:20.107'),(21,21,9,1,35000,'','2026-07-22 14:43:23.691','2026-07-22 14:43:23.691');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pengguna_id` bigint(20) unsigned NOT NULL,
  `nama_penerima` varchar(100) DEFAULT NULL,
  `tanggal_pesanan` datetime(3) DEFAULT NULL,
  `total_harga` bigint(20) NOT NULL,
  `status` varchar(50) DEFAULT 'menunggu_pembayaran',
  `status_pembayaran` varchar(50) DEFAULT 'belum_dibayar',
  `alamat_pengiriman` text NOT NULL,
  `telepon` varchar(20) NOT NULL,
  `catatan` varchar(255) DEFAULT NULL,
  `metode_pembayaran` varchar(50) NOT NULL,
  `bukti_pembayaran` varchar(255) DEFAULT NULL,
  `nama_bank` varchar(100) DEFAULT NULL,
  `nama_pengirim` varchar(100) DEFAULT NULL,
  `catatan_penolakan` text DEFAULT NULL,
  `kode_promo` varchar(50) DEFAULT NULL,
  `diskon` bigint(20) DEFAULT 0,
  `snap_token` varchar(255) DEFAULT NULL,
  `midtrans_id` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_pengguna_id` (`pengguna_id`),
  CONSTRAINT `fk_orders_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,3,'','2026-07-20 14:32:57.632',60000,'selesai','lunas','Kampus unand,Pasar Baru','082171016190','','qris','','','','','',0,'81d55b9e-22ee-49d7-b75c-8c87ed54747b','VIPZ-1-1784532777','2026-07-20 14:32:57.632','2026-07-20 14:34:23.044'),(2,2,'','2026-07-20 14:52:37.001',45000,'selesai','lunas','Jl. Khatib Sulaiman No. 12, Padang Utara, Padang','082345678901','','qris','','','','','',0,'9879e6b8-6f55-40ec-9eac-855b3a3541d7','VIPZ-2-1784533957','2026-07-20 14:52:37.001','2026-07-20 14:53:13.792'),(3,2,'','2026-07-20 19:54:03.669',110000,'selesai','lunas','Jl. Khatib Sulaiman No. 12, Padang Utara, Padang','082345678901','','qris','','','','','',0,'de7c5b09-bc6e-4656-80cf-2dcd914751fe','VIPZ-3-1784552043','2026-07-20 19:54:03.670','2026-07-20 19:55:18.100'),(4,4,'','2026-07-20 20:18:20.956',60000,'selesai','lunas','Pasar Baru Unand','082390129181','','midtrans','','','','','',0,'15dfe7a6-fd38-46a3-9cff-7e7d2cb8a23f','VIPZ-4-1784553500','2026-07-20 20:18:20.956','2026-07-20 20:21:19.317'),(5,4,'','2026-07-20 20:18:22.350',60000,'selesai','lunas','Pasar Baru Unand','082390129181','','midtrans','','','','','',0,'9b4e2e77-ae04-44ea-aa9f-01c7b7701c21','VIPZ-5-1784553502','2026-07-20 20:18:22.350','2026-07-20 20:21:16.934'),(6,4,'','2026-07-20 20:30:34.019',60000,'selesai','lunas','Pasar Baru Unand','082390129181','','midtrans','','','','','',0,'f2aeb401-9bf0-4ee3-8a83-dacc48c080f4','VIPZ-6-1784554234','2026-07-20 20:30:34.021','2026-07-20 20:31:38.597'),(7,2,'','2026-07-20 20:40:17.022',60000,'dibatalkan','gagal','Jl. Khatib Sulaiman No. 12, Padang Utara, Padang','082345678901','','gopay','','','','','',0,'56a6b498-ded2-4e5f-9f5b-06e09b988618','VIPZ-7-1784554817','2026-07-20 20:40:17.024','2026-07-20 20:46:59.669'),(9,2,'','2026-07-20 20:42:11.030',55000,'selesai','lunas','Jl. Khatib Sulaiman No. 12, Padang Utara, Padang','082345678901','','transfer_bank','/uploads/payments/pay_1784554975_100148.jpg','Bri','Budi','','',0,'','','2026-07-20 20:42:11.031','2026-07-20 20:45:01.686'),(10,4,'','2026-07-20 20:43:00.226',60000,'selesai','lunas','Pasar Baru Unand','082390129181','','transfer_bank','/uploads/payments/pay_1784555015_1000097014.jpg','111111','Jeri','','',0,'','','2026-07-20 20:43:00.226','2026-07-20 20:44:17.325'),(14,2,'','2026-07-21 16:01:06.577',110000,'dibatalkan','gagal','padang','081234567890','','midtrans','','','','','',0,'ae037896-f1e3-47cb-ade1-88cb8c8c9dc6','VIPZ-14-1784624466','2026-07-21 16:01:06.577','2026-07-21 16:03:43.595'),(16,6,'','2026-07-21 16:24:42.932',45000,'dibatalkan','gagal','Kos hj etnawati pasar baru unand','082171016190','','midtrans','','','','','',0,'07edd926-6e92-470f-9006-727d60519b60','VIPZ-16-1784625882','2026-07-21 16:24:42.933','2026-07-22 14:40:57.311'),(17,6,'','2026-07-21 16:25:35.935',45000,'selesai','lunas','Kos hj etnawati pasar baru unand','082171016190','','qris','','','','','',0,'bb2c1856-2beb-4b07-9341-9d8f5c1e752a','VIPZ-17-1784625935','2026-07-21 16:25:35.938','2026-07-21 16:26:36.092'),(18,2,'','2026-07-22 08:17:03.131',110000,'selesai','lunas','Jl. Khatib Sulaiman No. 12, Padang Utara, Padang','082345678901','','qris','','','','','',0,'2a6a454f-3a9a-455e-991f-292cbf381d5f','VIPZ-18-1784683023','2026-07-22 08:17:03.133','2026-07-22 08:18:39.927'),(19,2,'','2026-07-22 13:25:57.274',60000,'dibatalkan','gagal','Jl. Khatib Sulaiman No. 12, Padang Utara, PadangJl. Jenderal Sudirman No. 12, Padang','08234567890108123456','','qris','','','','','',0,'','','2026-07-22 13:25:57.274','2026-07-22 14:40:52.858'),(20,2,'','2026-07-22 13:36:20.105',60000,'dibatalkan','gagal','Jalan Dr. M. Hatta, Kapala Koto, Padang, West Sumatra, Sumatra, 25162, Indonesia\n\n­ƒôì Google Maps Navigasi: https://maps.google.com/?q=-0.927017,100.43166400000001','08234567890108123456','','qris','','','','','',0,'','','2026-07-22 13:36:20.105','2026-07-22 14:40:48.841'),(21,2,'','2026-07-22 14:43:23.688',45000,'selesai','lunas','Jalan Dr. M. Hatta, Kapala Koto, Padang, Sumatera Barat, Sumatra, 25162, Indonesia\n\n­ƒôì Google Maps Navigasi: https://maps.google.com/?q=-0.9271051658580807,100.4321336261353','082345678901','','qris','/uploads/payments/pay_1784706440_WhatsApp Image 2026-05-25 at 22.00.25 (2).jpeg','gopay','yuni','','',0,'','','2026-07-22 14:43:23.689','2026-07-22 14:48:08.660');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pesanan_id` bigint(20) unsigned NOT NULL,
  `metode_pembayaran` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'belum_dibayar',
  `jumlah_dibayar` bigint(20) DEFAULT 0,
  `snap_token` varchar(255) DEFAULT NULL,
  `midtrans_order_id` varchar(255) DEFAULT NULL,
  `bukti_pembayaran` varchar(255) DEFAULT NULL,
  `nama_bank` varchar(100) DEFAULT NULL,
  `nama_pengirim` varchar(100) DEFAULT NULL,
  `tanggal_bayar` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payments_pesanan_id` (`pesanan_id`),
  CONSTRAINT `fk_orders_pembayaran` FOREIGN KEY (`pesanan_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pesan_pelanggan`
--

DROP TABLE IF EXISTS `pesan_pelanggan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pesan_pelanggan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pengguna_id` bigint(20) unsigned DEFAULT NULL,
  `nama` varchar(150) NOT NULL,
  `email` varchar(200) NOT NULL,
  `pertanyaan` text NOT NULL,
  `balasan` text DEFAULT NULL,
  `waktu_balas` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pesan_pelanggan_pengguna_id` (`pengguna_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pesan_pelanggan`
--

LOCK TABLES `pesan_pelanggan` WRITE;
/*!40000 ALTER TABLE `pesan_pelanggan` DISABLE KEYS */;
INSERT INTO `pesan_pelanggan` VALUES (1,1,'Admin Vipizza','admin@vipizza.com','kakakka','yaaaa','2026-07-22 13:45:25.546','2026-07-22 13:45:08.312','2026-07-22 13:45:25.546');
/*!40000 ALTER TABLE `pesan_pelanggan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promos`
--

DROP TABLE IF EXISTS `promos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `judul` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `diskon` bigint(20) DEFAULT 0,
  `kode_promo` varchar(50) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `tanggal_mulai` datetime(3) DEFAULT NULL,
  `tanggal_akhir` datetime(3) DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promos`
--

LOCK TABLES `promos` WRITE;
/*!40000 ALTER TABLE `promos` DISABLE KEYS */;
INSERT INTO `promos` VALUES (3,'Promo Libur sekolah','Enakkk bngtttt oiiii',19,'AYOO','/uploads/promo/1784532547_WhatsApp Image 2026-07-20 at 14.18.11.jpeg','2026-07-20 07:00:00.000','2026-07-31 07:00:00.000',1,'2026-07-20 14:29:07.880','2026-07-20 14:29:07.880');
/*!40000 ALTER TABLE `promos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ulasan`
--

DROP TABLE IF EXISTS `ulasan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ulasan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pesanan_id` bigint(20) unsigned DEFAULT NULL,
  `menu_id` bigint(20) unsigned NOT NULL,
  `pengguna_id` bigint(20) unsigned DEFAULT NULL,
  `nama_publik` varchar(100) DEFAULT NULL,
  `rating` bigint(20) NOT NULL,
  `komentar` text DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ulasan_pesanan_id` (`pesanan_id`),
  KEY `idx_ulasan_menu_id` (`menu_id`),
  KEY `idx_ulasan_pengguna_id` (`pengguna_id`),
  CONSTRAINT `fk_ulasan_menu` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`),
  CONSTRAINT `fk_ulasan_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ulasan`
--

LOCK TABLES `ulasan` WRITE;
/*!40000 ALTER TABLE `ulasan` DISABLE KEYS */;
INSERT INTO `ulasan` VALUES (1,1,2,3,'',4,'Enak bnget kak','2026-07-20 14:43:04.460','2026-07-20 14:43:04.460'),(3,2,1,2,'',3,'tambhkan lgi toping nya ya','2026-07-20 14:57:45.315','2026-07-20 14:57:45.315'),(9,21,9,2,'',5,'mantap','2026-07-22 14:48:48.732','2026-07-22 14:48:48.732');
/*!40000 ALTER TABLE `ulasan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `peran` varchar(20) DEFAULT 'pelanggan',
  `telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uni_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Vipizza','admin@vipizza.com','$2a$10$3h2jQ06t5R84XuB/kxJWAOAADsghw.qMvlwZ4XPaA2IMya8D/Xj22','admin','081234567890','Kantor Pusat Vipizza, Kota Padang','2026-07-20 14:02:53.726','2026-07-20 20:14:52.686'),(2,'Budi Santoso','budi@vipizza.com','$2a$10$T5Aft9wQa4FmnaU5B8g.M.Q0sxROlf8oFQD7i4sHrJCNU.Ur/WtGK','pelanggan','082345678901','Jl. Khatib Sulaiman No. 12, Padang Utara, Padang','2026-07-20 14:02:53.810','2026-07-20 14:02:53.810'),(3,'Yuni Permata Sari','yunipermatasariyuni28@gmail.com','$2a$10$JKusxQ7CnGZ.wo.RFt70/.1zV1tqw8u/GHCAkm3jqk6jykpgf1Qfi','pelanggan','082171016190','Kampus unand,Pasar Baru','2026-07-20 14:31:53.626','2026-07-20 20:38:31.274'),(4,'JERI ANTOMI','jeriantomi@gmail.com','$2a$10$dzThK9hOupuFcysMd8.U3emz1hy6cJOElX6TfBoNsA1wmk/0aV1VS','pelanggan','082390129181','Pasar Baru Unand','2026-07-20 20:15:04.371','2026-07-20 20:15:04.371'),(5,'Test','test1@test.com','$2a$10$pxC34.CV45qvdg1LR.ZZbOuI4308pNBNIJUviJm3tir9watvu1BoK','pelanggan','08123456789','Padang','2026-07-21 15:57:24.997','2026-07-21 15:57:24.997'),(6,'Aida','Aida@gmail.com','$2a$10$ww/W5rhORSi0FAEGHFMt/uMrdgrzYtZab7hJ8xfGiaSSZ7PWjtfnu','pelanggan','082171016190','Kos hj etnawati pasar baru unand','2026-07-21 16:14:09.311','2026-07-21 16:14:09.311');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-02 11:05:43

