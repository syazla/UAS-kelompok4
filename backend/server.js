// server.js
// Backend API untuk Camprent (Penyewaan Alat Camping)

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// bagiaaaaaan wa, perubahan untuk waaa///
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------
// 1. AUTO CREATION FOLDER UPLOADS
// ---------------------------------------------------------
const uploadDirs = [
  path.join(__dirname, 'uploads', 'ktp'),
  path.join(__dirname, 'uploads', 'bukti_transfer'),
  path.join(__dirname, 'uploads', 'alat')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[System] Folder dibuat secara otomatis: ${dir}`);
  }
});

// ---------------------------------------------------------
// 2. MIDDLEWARE CONFIGURATION
// ---------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file static uploads agar bisa diakses oleh frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------
// 3. KONEKSI DATABASE MYSQL
// ---------------------------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'camprent',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Cek koneksi ke database saat aplikasi berjalan
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[Database] Terhubung ke MySQL dengan sukses!');
    connection.release();
  } catch (error) {
    console.error('[Database] ERROR: Gagal terhubung ke MySQL!', error.message);
    console.log('[Database] Pastikan server MySQL (XAMPP/Laragon) Anda sudah menyala dan database "camprent" sudah dibuat.');
  }
}
testDbConnection();

testDbConnection();

// ---------------------------------------------------------
// WA CLIENT - whatsapp-web.js
// ---------------------------------------------------------
const waClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  }
});

waClient.on('qr', (qr) => {
  console.log('[WhatsApp] Scan QR Code ini dengan HP kamu:');
  qrcode.generate(qr, { small: true });
});

waClient.on('ready', () => {
  console.log('[WhatsApp] ✅ WhatsApp Client siap digunakan!');
});

waClient.on('auth_failure', (msg) => {
  console.error('[WhatsApp] ❌ Autentikasi gagal:', msg);
});

waClient.initialize().catch(err => {
  console.error('[WhatsApp] ❌ Gagal inisialisasi WA client:', err.message);
});

// ---------------------------------------------------------
// 4. KONFIGURASI MULTER UNTUK FILE UPLOADS
// ---------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'ktp') {
      cb(null, path.join(__dirname, 'uploads', 'ktp'));
    } else if (file.fieldname === 'bukti_transfer') {
      cb(null, path.join(__dirname, 'uploads', 'bukti_transfer'));
    } else {
      cb(null, path.join(__dirname, 'uploads', 'alat'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file untuk memastikan hanya format gambar yang diunggah
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya format file gambar (.jpg, .jpeg, .png) yang diperbolehkan!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Batas ukuran file 2MB
});

// Middleware penanganan upload sewa
const uploadPenyewaan = upload.fields([
  { name: 'ktp', maxCount: 1 },
  { name: 'bukti_transfer', maxCount: 1 }
]);

// ---------------------------------------------------------
// 5. MIDDLEWARE AUTENTIKASI ADMIN (JWT VERIFY)
// ---------------------------------------------------------
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN_STRING

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak. Token otorisasi tidak ditemukan.'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Token tidak valid atau kadaluwarsa.'
      });
    }
    req.admin = decoded;
    next();
  });
};

// ---------------------------------------------------------
// 6. ENDPOINT API - AUTENTIKASI ADMIN
// ---------------------------------------------------------

// Register Admin Baru (Biasanya diakses sekali di awal/postman)
app.post('/api/admin/register', async (req, res) => {
  const { username, password, nama_admin } = req.body;

  if (!username || !password || !nama_admin) {
    return res.status(400).json({ status: 'error', message: 'Semua field wajib diisi.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM admin WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Username sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admin (username, password, nama_admin) VALUES (?, ?, ?)',
      [username, hashedPassword, nama_admin]
    );

    res.status(201).json({
      status: 'success',
      message: 'Admin berhasil didaftarkan!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Login Admin
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username dan password wajib diisi.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Username atau password salah.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, nama_admin: admin.nama_admin },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Token berlaku selama 1 hari
    );

    res.json({
      status: 'success',
      message: 'Login berhasil!',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nama_admin: admin.nama_admin
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ---------------------------------------------------------
// 7. ENDPOINT API - KATALOG ALAT CAMPING
// ---------------------------------------------------------

// Ambil Semua Daftar Alat Camping (Katalog)
app.get('/api/alat-camping', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alat_camping ORDER BY nama_alat ASC');
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ambil Detail Alat Camping berdasarkan ID
app.get('/api/alat-camping/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alat_camping WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Alat camping tidak ditemukan.' });
    }
    res.json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Tambah Alat Camping Baru (Admin Only)
app.post('/api/alat-camping', verifyAdmin, upload.single('gambar'), async (req, res) => {
  const { nama_alat, harga, stok, deskripsi } = req.body;
  const gambar = req.file ? req.file.filename : null;

  if (!nama_alat || !harga || !stok) {
    return res.status(400).json({ status: 'error', message: 'Nama alat, harga, dan stok wajib diisi.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO alat_camping (nama_alat, harga, stok, deskripsi, gambar) VALUES (?, ?, ?, ?, ?)',
      [nama_alat, harga, stok, deskripsi || null, gambar]
    );

    res.status(201).json({
      status: 'success',
      message: 'Alat camping berhasil ditambahkan!',
      data: {
        id: result.insertId,
        nama_alat,
        harga: parseInt(harga),
        stok: parseInt(stok),
        deskripsi,
        gambar
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update Data Alat Camping (Admin Only)
app.put('/api/alat-camping/:id', verifyAdmin, upload.single('gambar'), async (req, res) => {
  const { nama_alat, harga, stok, deskripsi } = req.body;
  const id = req.params.id;

  try {
    // Ambil data alat camping lama untuk mengecek gambar
    const [rows] = await pool.query('SELECT * FROM alat_camping WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Alat camping tidak ditemukan.' });
    }

    const currentAlat = rows[0];
    let gambar = currentAlat.gambar;

    // Jika admin mengunggah gambar baru
    if (req.file) {
      gambar = req.file.filename;
      // Hapus gambar lama dari folder uploads jika ada
      if (currentAlat.gambar) {
        const oldPath = path.join(__dirname, 'uploads', 'alat', currentAlat.gambar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    await pool.query(
      'UPDATE alat_camping SET nama_alat = ?, harga = ?, stok = ?, deskripsi = ?, gambar = ? WHERE id = ?',
      [
        nama_alat || currentAlat.nama_alat,
        harga !== undefined ? harga : currentAlat.harga,
        stok !== undefined ? stok : currentAlat.stok,
        deskripsi !== undefined ? deskripsi : currentAlat.deskripsi,
        gambar,
        id
      ]
    );

    res.json({
      status: 'success',
      message: 'Alat camping berhasil diperbarui!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Hapus Alat Camping (Admin Only)
app.delete('/api/alat-camping/:id', verifyAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM alat_camping WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Alat camping tidak ditemukan.' });
    }

    const alat = rows[0];

    // Hapus gambar dari file system
    if (alat.gambar) {
      const imgPath = path.join(__dirname, 'uploads', 'alat', alat.gambar);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await pool.query('DELETE FROM alat_camping WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Alat camping berhasil dihapus!'
    });
  } catch (error) {
    // Menangani error jika ada relasi penyewaan (foreign key restrict)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Tidak dapat menghapus alat camping karena sedang disewa dalam data transaksi.'
      });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ---------------------------------------------------------
// 8. ENDPOINT API - TRANSAKSI PENYEWAAN (USER & ADMIN)
// ---------------------------------------------------------

// Kirim Form Penyewaan Baru (Diakses oleh Pengguna di Frontend)
app.post('/api/penyewaan', (req, res) => {
  uploadPenyewaan(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'error', message: `Kesalahan Upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }

    const {
      nama,
      umur,
      no_wa,
      alamat,
      alat_id,
      jumlah,
      durasi,
      metode_pembayaran
    } = req.body;

    // 1. Validasi Input Dasar
    if (!nama || !umur || !no_wa || !alamat || !alat_id || !jumlah || !durasi || !metode_pembayaran) {
      // Hapus file yang sudah terlanjur diunggah jika validasi input gagal
      if (req.files) {
        if (req.files.ktp) fs.unlinkSync(req.files.ktp[0].path);
        if (req.files.bukti_transfer) fs.unlinkSync(req.files.bukti_transfer[0].path);
      }
      return res.status(400).json({ status: 'error', message: 'Semua field formulir wajib diisi.' });
    }

    // 2. Validasi Upload KTP (Wajib untuk semua metode pembayaran)
    if (!req.files || !req.files.ktp) {
      if (req.files && req.files.bukti_transfer) fs.unlinkSync(req.files.bukti_transfer[0].path);
      return res.status(400).json({ status: 'error', message: 'Foto KTP wajib diunggah untuk verifikasi.' });
    }

    // 3. Validasi Logika Bukti Transfer berdasarkan Metode Pembayaran
    if (metode_pembayaran === 'Transfer' && (!req.files || !req.files.bukti_transfer)) {
      if (req.files && req.files.ktp) fs.unlinkSync(req.files.ktp[0].path);
      return res.status(400).json({
        status: 'error',
        message: 'Metode pembayaran Transfer wajib menyertakan unggahan foto bukti transfer.'
      });
    }

    try {
      // 4. Periksa apakah alat camping tersedia di database
      const [alatRows] = await pool.query('SELECT * FROM alat_camping WHERE id = ?', [alat_id]);
      if (alatRows.length === 0) {
        // Hapus file terunggah
        if (req.files.ktp) fs.unlinkSync(req.files.ktp[0].path);
        if (req.files.bukti_transfer) fs.unlinkSync(req.files.bukti_transfer[0].path);
        return res.status(404).json({ status: 'error', message: 'Alat camping yang dipilih tidak ditemukan.' });
      }

      const alat = alatRows[0];

      // 5. Periksa Ketersediaan Stok
      if (alat.stok < parseInt(jumlah)) {
        // Hapus file terunggah
        if (req.files.ktp) fs.unlinkSync(req.files.ktp[0].path);
        if (req.files.bukti_transfer) fs.unlinkSync(req.files.bukti_transfer[0].path);
        return res.status(400).json({
          status: 'error',
          message: `Stok barang tidak mencukupi. Stok saat ini: ${alat.stok} unit.`
        });
      }

      // 6. Hitung Total Harga Otomatis Berdasarkan Aturan Durasi Baru
      let extra_fee = 0;
      const d = parseInt(durasi);
      if (d === 2) extra_fee = 0;
      else if (d === 3) extra_fee = 3000;
      else if (d === 4) extra_fee = 6000;
      else if (d === 7) extra_fee = 10000;
      else {
        if (d > 2) extra_fee = (d - 2) * 3000;
      }
      const total_harga = (alat.harga + extra_fee) * parseInt(jumlah);

      const ktpFilename = req.files.ktp[0].filename;
      const buktiTransferFilename = (metode_pembayaran === 'Transfer' && req.files.bukti_transfer)
        ? req.files.bukti_transfer[0].filename
        : null;

      // 7. Simpan data sewa ke database (status awal 'pending')
      const [result] = await pool.query(
        `INSERT INTO penyewaan 
        (nama, umur, no_wa, alamat, alat_id, jumlah, durasi, total_harga, metode_pembayaran, ktp, bukti_transfer, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          nama,
          umur,
          no_wa,
          alamat,
          alat_id,
          jumlah,
          durasi,
          total_harga,
          metode_pembayaran,
          ktpFilename,
          buktiTransferFilename
        ]
      );

      res.status(201).json({
        status: 'success',
        message: 'Permintaan sewa berhasil dikirim! Silakan menunggu konfirmasi admin via WhatsApp.',
        data: {
          id: result.insertId,
          nama,
          total_harga,
          status: 'pending'
        }
      });

    } catch (error) {
      // Hapus file jika terjadi kegagalan query database
      if (req.files && req.files.ktp) fs.unlinkSync(req.files.ktp[0].path);
      if (req.files && req.files.bukti_transfer) fs.unlinkSync(req.files.bukti_transfer[0].path);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });
});

// Ambil Seluruh Data Penyewaan (Untuk Dashboard Admin)
app.get('/api/penyewaan', verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT p.*, a.nama_alat, a.harga as harga_satuan 
      FROM penyewaan p
      LEFT JOIN alat_camping a ON p.alat_id = a.id
      ORDER BY p.tanggal_sewa DESC
    `;
    const [rows] = await pool.query(query);
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ambil Detail Penyewaan berdasarkan ID
app.get('/api/penyewaan/:id', verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT p.*, a.nama_alat, a.harga as harga_satuan 
      FROM penyewaan p
      LEFT JOIN alat_camping a ON p.alat_id = a.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Transaksi penyewaan tidak ditemukan.' });
    }

    res.json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update Status Penyewaan & Otomatisasi Stok (Admin Only)
app.put('/api/penyewaan/:id/status', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const transactionId = req.params.id;

  if (!status || !['pending', 'disetujui', 'ditolak'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Status tidak valid. Harus pending, disetujui, atau ditolak.'
    });
  }

  const conn = await pool.getConnection();
  try {
    // Mulai transaksi database untuk menjamin konsistensi
    await conn.beginTransaction();

    // 1. Ambil data penyewaan dan alat_camping terkait
    const [rentRows] = await conn.query(
      'SELECT * FROM penyewaan WHERE id = ? FOR UPDATE',
      [transactionId]
    );

    if (rentRows.length === 0) {
      conn.release();
      return res.status(404).json({ status: 'error', message: 'Transaksi penyewaan tidak ditemukan.' });
    }

    const transaksi = rentRows[0];
    const statusSebelumnya = transaksi.status;
    const statusBaru = status;

    const [alatRows] = await conn.query(
      'SELECT * FROM alat_camping WHERE id = ? FOR UPDATE',
      [transaksi.alat_id]
    );

    if (alatRows.length === 0) {
      conn.release();
      return res.status(404).json({ status: 'error', message: 'Data alat camping tidak ditemukan.' });
    }

    const alat = alatRows[0];

    // 2. Logika Penyesuaian Stok
    if (statusSebelumnya !== 'disetujui' && statusBaru === 'disetujui') {
      // Jika status berubah ke 'disetujui', kurangi stok barang
      if (alat.stok < transaksi.jumlah) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          status: 'error',
          message: `Gagal menyetujui. Stok alat camping "${alat.nama_alat}" tidak mencukupi. Sisa stok: ${alat.stok} unit.`
        });
      }

      await conn.query(
        'UPDATE alat_camping SET stok = stok - ? WHERE id = ?',
        [transaksi.jumlah, transaksi.alat_id]
      );
      console.log(`[Stok] Stok ${alat.nama_alat} berkurang ${transaksi.jumlah} unit (Disetujui).`);

    } else if (statusSebelumnya === 'disetujui' && statusBaru !== 'disetujui') {
      // Jika status dibatalkan dari 'disetujui' ke status lain, kembalikan stok barang
      await conn.query(
        'UPDATE alat_camping SET stok = stok + ? WHERE id = ?',
        [transaksi.jumlah, transaksi.alat_id]
      );
      console.log(`[Stok] Stok ${alat.nama_alat} dikembalikan ${transaksi.jumlah} unit (Dibatalkan/Ditolak).`);
    }

    // 3. Update status transaksi
    await conn.query(
      'UPDATE penyewaan SET status = ? WHERE id = ?',
      [statusBaru, transactionId]
    );

    // Commit transaksi ke database
    await conn.commit();
    conn.release();

    // // 4. Simulasi Pengiriman WhatsApp (di masa depan dapat dihubungkan dengan Fazzara, Wablas, atau Twilio)
    // console.log(`[WhatsApp Notification] Mengirim notifikasi WhatsApp ke ${transaksi.no_wa}:
    // "Halo ${transaksi.nama}, status penyewaan Anda untuk ${transaksi.jumlah} unit ${alat.nama_alat} telah diubah menjadi: ${statusBaru.toUpperCase()}."`);

    // 4. Kirim Notifikasi WhatsApp ke penyewa
    try {
      const nomorWA = transaksi.no_wa + '@c.us';

      let pesanWA = '';
      if (statusBaru === 'disetujui') {
        pesanWA = `Halo *${transaksi.nama}* 👋\n\nPermintaan sewa kamu telah *DISETUJUI* ✅\n\n📦 *Detail Sewa:*\n- Alat: ${alat.nama_alat}\n- Jumlah: ${transaksi.jumlah} unit\n- Durasi: ${transaksi.durasi} hari\n- Total: Rp ${transaksi.total_harga.toLocaleString('id-ID')}\n\nSilakan ambil alat sesuai kesepakatan. Terima kasih telah menggunakan *Camprent*! 🏕️`;
      } else if (statusBaru === 'ditolak') {
        pesanWA = `Halo *${transaksi.nama}* 👋\n\nMohon maaf, permintaan sewa kamu *DITOLAK* ❌\n\n📦 *Detail Sewa:*\n- Alat: ${alat.nama_alat}\n- Jumlah: ${transaksi.jumlah} unit\n\nSilakan hubungi admin untuk informasi lebih lanjut. Terima kasih.`;
      } else {
        pesanWA = `Halo *${transaksi.nama}* 👋\n\nStatus penyewaan kamu untuk *${alat.nama_alat}* telah diubah menjadi: *${statusBaru.toUpperCase()}*`;
      }

      await waClient.sendMessage(nomorWA, pesanWA);
      console.log(`[WhatsApp] ✅ Pesan terkirim ke ${transaksi.no_wa}`);
    } catch (waError) {
      console.error('[WhatsApp] ❌ Gagal mengirim pesan:', waError.message);
    }
    // akhir whatsap///////////////////


    res.json({
      status: 'success',
      message: `Status penyewaan berhasil diubah menjadi: ${statusBaru}`,
      data: {
        id: transactionId,
        status: statusBaru
      }
    });

  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ======================================================================
// ENDPOINT BARU: HAPUS TRANSAKSI PENYEWAAN (Admin Only)
// ======================================================================
app.delete('/api/penyewaan/:id', verifyAdmin, async (req, res) => {
  const transactionId = req.params.id;

  try {
    // 1. Cek validasi apakah data transaksi tersebut memang ada di database
    const [rows] = await pool.query('SELECT id FROM penyewaan WHERE id = ?', [transactionId]);
    if (rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Data transaksi tidak ditemukan di database.' 
      });
    }

    // 2. Eksekusi penghapusan baris data dari database MySQL Railway
    await pool.query('DELETE FROM penyewaan WHERE id = ?', [transactionId]);

    // 3. Kirim respon sukses ke frontend
    res.json({
      status: 'success',
      message: 'Data transaksi penyewaan berhasil dihapus secara permanen!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ----------------------------------------------------------------------
// 9. ROUTING FRONTEND STATIC (Kunci Utama Mengatasi Cannot GET /)
// ----------------------------------------------------------------------

// Menyajikan folder frontend statis yang saat ini sudah Anda masukkan ke dalam backend
app.use(express.static(path.join(__dirname, 'frontend')));

// Endpoint utama untuk menyajikan file index.html milik pengguna umum
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Endpoint khusus untuk menyajikan file dashboard milik admin
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'admin', 'admin.html'));
});

// ---------------------------------------------------------
// 10. JALANKAN SERVER
// ---------------------------------------------------------
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[Camprent Backend] Berjalan di port: ${PORT}`);
  console.log(`[API URL] http://localhost:${PORT}`);
  console.log(`====================================================`);
});



