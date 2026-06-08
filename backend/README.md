# Backend Camprent - Dokumentasi & Petunjuk Penggunaan

Backend API untuk web aplikasi penyewaan alat camping **Camprent**, menggunakan **Node.js, Express.js, dan MySQL**.

---

## 🚀 Cara Menjalankan Backend

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (minimal versi 18)
* Server MySQL (bisa menggunakan XAMPP, Laragon, atau MySQL Installer langsung)

### 2. Konfigurasi Database
1. Nyalakan server MySQL Anda (XAMPP / Laragon).
2. Buat database baru bernama `camprent` melalui phpMyAdmin atau SQL client (DBeaver/Navicat):
   ```sql
   CREATE DATABASE camprent;
   ```
3. Import file `database.sql` ke dalam database `camprent`. Berkas SQL ini sudah berisi:
   * Skema tabel `admin`, `alat_camping`, dan `penyewaan`.
   * **30 katalog barang camping** lengkap dengan harga sewa harian dan deskripsi siap pakai.
   * Akun administrator bawaan untuk uji coba:
     * **Username:** `admin`
     * **Password:** `admin123`

### 3. Instalasi Dependensi & Menjalankan Server
1. Buka terminal di direktori backend (`d:/project_akhir/backend`).
2. Jalankan perintah berikut untuk menginstal semua library pendukung:
   ```bash
   npm install
   ```
3. Salin file `.env` jika diperlukan (sudah otomatis dibuatkan dengan konfigurasi default).
4. Jalankan backend dalam mode pengembangan (development):
   ```bash
   npm run dev
   ```
5. Server akan aktif di port `5000` dengan URL utama: **`http://localhost:5000`**.

---

## 📁 Struktur Folder Penyimpanan Gambar
Saat server dijalankan pertama kali, sistem akan membuat folder penyimpanan unggahan (uploads) secara otomatis jika belum ada:
* `uploads/ktp/` – Menyimpan berkas foto KTP penyewa.
* `uploads/bukti_transfer/` – Menyimpan berkas bukti transfer pembayaran penyewa.
* `uploads/alat/` – Menyimpan berkas gambar katalog alat camping.

*Semua berkas di atas disajikan secara statis dan dapat diakses publik melalui URL: `http://localhost:5000/uploads/<nama_folder>/<nama_file>`.*

---

## 🔑 Dokumentasi API Lengkap

### 1. Autentikasi Admin

#### **a. Login Admin**
Digunakan untuk masuk ke dashboard admin dan mendapatkan token akses JWT.
* **Method:** `POST`
* **Endpoint:** `/api/admin/login`
* **Request Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
* **Response (Success - 200 OK):**
  ```json
  {
    "status": "success",
    "message": "Login berhasil!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "nama_admin": "Super Admin Camprent"
    }
  }
  ```

#### **b. Register Admin Baru**
Digunakan untuk mendaftarkan akun admin baru (menyimpan password dengan enkripsi aman bcrypt).
* **Method:** `POST`
* **Endpoint:** `/api/admin/register`
* **Request Body (JSON):**
  ```json
  {
    "username": "admin_baru",
    "password": "passwordrahasia",
    "nama_admin": "Admin Dua"
  }
  ```

---

### 2. Katalog Alat Camping

> [!NOTE]
> Semua endpoint yang bertanda **(Admin Only)** memerlukan Header Autentikasi JWT:
> **`Authorization: Bearer <TOKEN_JWT_HASIL_LOGIN>`**

#### **a. Ambil Semua Katalog Alat Camping**
Menampilkan katalog 30 barang camping yang tersedia beserta harga dan stoknya.
* **Method:** `GET`
* **Endpoint:** `/api/alat-camping`
* **Response (Success - 200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "nama_alat": "Tenda Kapasitas 2 Orang",
        "harga": 25000,
        "stok": 15,
        "deskripsi": "Tempat berlindung utama dari hujan...",
        "gambar": "tenda_2p.jpg"
      }
      // ... 29 barang lainnya
    ]
  }
  ```

#### **b. Ambil Detail Satu Alat Camping**
* **Method:** `GET`
* **Endpoint:** `/api/alat-camping/:id`

#### **c. Tambah Alat Camping Baru (Admin Only)**
* **Method:** `POST`
* **Endpoint:** `/api/alat-camping`
* **Content-Type:** `multipart/form-data`
* **Request Body:**
  * `nama_alat` (text, wajib)
  * `harga` (number, wajib)
  * `stok` (number, wajib)
  * `deskripsi` (text, opsional)
  * `gambar` (file foto alat, opsional)

#### **d. Update Data Alat Camping (Admin Only)**
* **Method:** `PUT`
* **Endpoint:** `/api/alat-camping/:id`
* **Content-Type:** `multipart/form-data`
* **Request Body:** Field yang ingin diubah (nama_alat, harga, stok, deskripsi, gambar).

#### **e. Hapus Alat Camping (Admin Only)**
* **Method:** `DELETE`
* **Endpoint:** `/api/alat-camping/:id`

---

### 3. Transaksi Penyewaan

#### **a. Kirim Form Penyewaan Baru (Umum/Pengguna)**
Digunakan pengguna saat melakukan order sewa barang di frontend.
* **Method:** `POST`
* **Endpoint:** `/api/penyewaan`
* **Content-Type:** `multipart/form-data`
* **Request Body (Form Data):**
  * `nama` (text) - Nama Lengkap Penyewa
  * `umur` (number) - Umur Penyewa
  * `no_wa` (text) - Nomor WhatsApp Aktif (misal: 08123456789)
  * `alamat` (text) - Alamat Lengkap
  * `alat_id` (number) - ID Alat Camping yang ingin disewa
  * `jumlah` (number) - Jumlah unit barang yang disewa
  * `durasi` (number) - Durasi sewa (dalam hitungan hari)
  * `metode_pembayaran` (text) - Pilihan: `COD` atau `Transfer`
  * `ktp` (file gambar KTP, **Wajib**)
  * `bukti_transfer` (file gambar bukti transfer, **Wajib jika metode_pembayaran adalah 'Transfer'**, **Boleh Kosong jika 'COD'**)

* **Logika Backend:**
  1. Backend memvalidasi ketersediaan stok barang. Jika stok kurang dari jumlah sewa, order akan ditolak otomatis.
  2. Backend akan menghitung total harga di server: `total_harga = harga_alat * jumlah * durasi`.
  3. Status awal order diset menjadi `'pending'`.
  4. Berkas foto akan disimpan di folder unggahan yang sesuai.

* **Response (Success - 201 Created):**
  ```json
  {
    "status": "success",
    "message": "Permintaan sewa berhasil dikirim! Silakan menunggu konfirmasi admin via WhatsApp.",
    "data": {
      "id": 12,
      "nama": "Budi Santoso",
      "total_harga": 105000,
      "status": "pending"
    }
  }
  ```

#### **b. Ambil Semua Transaksi Penyewaan (Admin Only)**
Digunakan admin untuk melihat data order masuk di dashboard admin.
* **Method:** `GET`
* **Endpoint:** `/api/penyewaan`
* **Response (Success - 200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "nama": "Budi Santoso",
        "umur": 22,
        "no_wa": "08123456789",
        "alamat": "Jl. Merdeka No. 10",
        "alat_id": 2,
        "jumlah": 1,
        "durasi": 3,
        "total_harga": 105000,
        "metode_pembayaran": "Transfer",
        "ktp": "ktp-1716892305882-992384.png",
        "bukti_transfer": "bukti_transfer-1716892305891-382942.png",
        "status": "pending",
        "tanggal_sewa": "2026-05-28T03:30:00.000Z",
        "nama_alat": "Tenda Kapasitas 4 Orang",
        "harga_satuan": 35000
      }
    ]
  }
  ```

#### **c. Update Status Penyewaan & Manajemen Stok Otomatis (Admin Only)**
Digunakan admin untuk menyetujui atau menolak pesanan sewa.
* **Method:** `PUT`
* **Endpoint:** `/api/penyewaan/:id/status`
* **Request Body (JSON):**
  ```json
  {
    "status": "disetujui"
  }
  ```
  *(Pilihan status: `pending`, `disetujui`, `ditolak`)*

* **Logika Pengurangan Stok:**
  * Jika status diubah dari pending/ditolak menjadi **`disetujui`**: Stok barang terkait di database akan dikurangi secara otomatis sebanyak `jumlah` sewa. Jika stok barang ternyata tidak cukup sewaktu disetujui, API akan merespon dengan error stok habis.
  * Jika status diubah dari disetujui menjadi **`ditolak`** atau **`pending`**: Stok barang terkait akan dikembalikan otomatis (bertambah kembali) ke jumlah semula.
