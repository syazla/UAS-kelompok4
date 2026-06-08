-- database.sql
-- Skema Database untuk Aplikasi Camprent (Penyewaan Alat Camping)

CREATE DATABASE IF NOT EXISTS `camprent`;
USE `camprent`;

-- 1. TABEL admin
CREATE TABLE IF NOT EXISTS `admin` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `nama_admin` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL alat_camping
CREATE TABLE IF NOT EXISTS `alat_camping` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_alat` VARCHAR(150) NOT NULL,
    `harga` INT NOT NULL,
    `stok` INT NOT NULL DEFAULT 0,
    `deskripsi` TEXT NULL,
    `gambar` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL penyewaan
CREATE TABLE IF NOT EXISTS `penyewaan` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama` VARCHAR(100) NOT NULL,
    `umur` INT NOT NULL,
    `no_wa` VARCHAR(20) NOT NULL,
    `alamat` TEXT NOT NULL,
    `alat_id` INT NOT NULL,
    `jumlah` INT NOT NULL,
    `durasi` INT NOT NULL COMMENT 'Durasi sewa dalam hitungan hari',
    `total_harga` INT NOT NULL,
    `metode_pembayaran` ENUM('COD', 'Transfer') NOT NULL,
    `ktp` VARCHAR(255) NOT NULL COMMENT 'Menyimpan nama/path file foto KTP',
    `bukti_transfer` VARCHAR(255) NULL COMMENT 'Menyimpan nama/path file bukti transfer, boleh NULL jika COD',
    `status` ENUM('pending', 'disetujui', 'ditolak') NOT NULL DEFAULT 'pending',
    `tanggal_sewa` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_penyewaan_alat` FOREIGN KEY (`alat_id`) REFERENCES `alat_camping` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA: 30 Alat Camping yang Disediakan Camprent
INSERT INTO `alat_camping` (`nama_alat`, `harga`, `stok`, `deskripsi`, `gambar`) VALUES
('Tenda Kapasitas 2 Orang', 25000, 15, 'Tempat berlindung utama dari hujan, angin, dan udara dingin untuk kapasitas kecil.', 'tenda_2p.jpg'),
('Tenda Kapasitas 4 Orang', 35000, 20, 'Ukuran tenda paling populer dan paling sering disewa oleh kelompok kecil atau keluarga.', 'tenda_4p.jpg'),
('Tenda Kapasitas 6 Orang', 50000, 10, 'Akomodasi utama berukuran besar untuk rombongan atau kelompok banyak orang.', 'tenda_6p.jpg'),
('Tas Carrier / Ransel Gunung', 20000, 25, 'Wadah utama paling penting untuk mengemas dan membawa semua logistik ke atas gunung.', 'carrier.jpg'),
('Sepatu Gunung', 20000, 15, 'Pelindung kaki paling krusial untuk melewati medan tanah, batu, dan jalur licin.', 'sepatu.jpg'),
('Sleeping Bag', 8000, 30, 'Selimut kantung krusial untuk menjaga suhu tubuh tetap hangat saat tidur di malam hari.', 'sleeping_bag.jpg'),
('Matras Foil', 5000, 20, 'Alas tidur premium yang sangat efektif memantulkan panas tubuh dan menahan dingin tanah.', 'matras_foil.jpg'),
('Matras Karet / Matras Spon', 3000, 40, 'Alas tidur dasar di dalam tenda agar tidak langsung bersentuhan dengan lantai tanah.', 'matras_spon.jpg'),
('Flysheet', 7000, 25, 'Lapisan terpal pelindung tambahan di luar tenda agar terhindar dari kebocoran air hujan.', 'flysheet.jpg'),
('Tiang Flysheet', 5000, 20, 'Penyangga besi utama untuk mendirikan flysheet sebagai tempat berkumpul atau dapur darurat.', 'tiang_flysheet.jpg'),
('Pasak Tenda', 1000, 100, 'Komponen krusial untuk menancapkan tenda dan flysheet ke tanah agar kokoh ditiup angin.', 'pasak.jpg'),
('Kotak P3K', 5000, 15, 'Perlengkapan keselamatan medis wajib untuk mengantisipasi luka ringan atau cedera di gunung.', 'p3k.jpg'),
('Kompor Portable / Kompor Camping', 10000, 25, 'Alat masak utama yang ringkas untuk mengolah makanan dan air hangat di area camp.', 'kompor.jpg'),
('Gas Portable', 5000, 50, 'Bahan bakar wajib yang harus selalu ada untuk menyalakan kompor camping.', 'gas.jpg'),
('Nesting / Peralatan Masak', 10000, 20, 'Set panci dan wajan susun yang praktis untuk memasak berbagai jenis makanan di gunung.', 'nesting.jpg'),
('Jaket Waterproof', 15000, 15, 'Pakaian luar utama pendaki untuk menahan badai angin dan air hujan di jalur pendakian.', 'jaket.jpg'),
('Lampu Tenda', 5000, 30, 'Sumber pencahayaan utama yang wajib digantung di dalam tenda saat malam hari.', 'lampu.jpg'),
('Trekking Pole', 5000, 30, 'Alat bantu kestabilan kaki dan lutut saat menanjak maupun turun gunung.', 'trekking_pole.jpg'),
('Sarung Tangan', 3000, 30, 'Pelindung tangan dari gesekan batu/tumbuhan sekaligus menjaga kehangatan dari udara dingin.', 'sarung_tangan.jpg'),
('Tas Hydropack', 10000, 15, 'Ransel punggung praktis untuk membawa kantung air minum selama berjalan.', 'hydropack.jpg'),
('Celana Outdoor', 10000, 15, 'Pakaian lapangan yang fleksibel, ringan, dan cepat kering jika terkena basah.', 'celana.jpg'),
('Topi Rimba', 3000, 20, 'Pelindung kepala dan wajah dari sengatan matahari langsung atau tetesan air dari pohon.', 'topi.jpg'),
('Powerbank', 10000, 20, 'Sumber daya cadangan penting untuk mengisi ulang baterai HP, lampu, atau kamera.', 'powerbank.jpg'),
('Jas Hujan Plastik', 2000, 50, 'Proteksi darurat tambahan yang murah dan ringan jika intensitas hujan sangat tinggi.', 'jas_hujan.jpg'),
('Emergency Blanket', 3000, 30, 'Selimut aluminium tipis wajib untuk pertolongan pertama pada korban gejala hipotermia.', 'emergency_blanket.jpg'),
('Hand Warmer', 2000, 50, 'Alat penghangat instan sekali pakai untuk meredakan jari kaku akibat cuaca ekstrem.', 'hand_warmer.jpg'),
('Hammock', 5000, 25, 'Tempat tidur gantung untuk bersantai-santai di antara dua pohon saat siang hari.', 'hammock.jpg'),
('Kursi Lipat', 8000, 30, 'Kursi portabel untuk bersantai dengan nyaman di depan tenda sambil menikmati kopi.', 'kursi_lipat.jpg'),
('Meja Lipat', 12000, 15, 'Meja praktis untuk menaruh makanan atau kompor agar tidak kotor terkena tanah.', 'meja_lipat.jpg'),
('Kacamata Outdoor', 5000, 20, 'Pelindung mata dari debu, angin kencang, dan terik matahari di puncak gunung.', 'kacamata.jpg');

-- SEED DATA: Default Admin (Username: admin, Password: admin123 hashed using bcrypt '$2a$10$tM.yF8Qc76b.wlybB6h8oOpXG852B2Dk5Oskg1z8F5.2pA2q7i9r.')
-- Catatan: Password hashing akan di-verify by bcryptjs di server.js
INSERT INTO `admin` (`username`, `password`, `nama_admin`) VALUES
('admin', '$2a$10$tM.yF8Qc76b.wlybB6h8oOpXG852B2Dk5Oskg1z8F5.2pA2q7i9r.', 'Super Admin Camprent');
