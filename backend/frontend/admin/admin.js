// admin.js - Camprent Admin Panel Control
const BASE_URL = 'http://localhost:5000/api';
let TOKEN = localStorage.getItem('admin_token') || '';

// Element Selektor Utama
const loginModal = document.getElementById('login-modal');
const mainDashboard = document.getElementById('main-dashboard');
const formLogin = document.getElementById('form-login');
const loginError = document.getElementById('login-error');
const namaAdminLogged = document.getElementById('nama-admin-logged');

// Jalankan pengecekan token saat pertama kali file dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (TOKEN) {
        showDashboard();
    } else {
        showLoginModal();
    }
});

// ---------------------------------------------------------
// FUNGSI AUTENTIKASI (LOGIN & LOGOUT)
// ---------------------------------------------------------
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const resData = await response.json();

        if (resData.status === 'success') {
            // Simpan token & info admin ke local storage
            TOKEN = resData.token;
            localStorage.setItem('admin_token', resData.token);
            localStorage.setItem('admin_nama', resData.admin.nama_admin);
            
            showDashboard();
        } else {
            loginError.textContent = resData.message || 'Login gagal, periksa kembali akun Anda.';
            loginError.style.display = 'block';
        }
    } catch (err) {
        loginError.textContent = 'Gagal terhubung ke server backend!';
        loginError.style.display = 'block';
    }
});

// Fungsi Aksi Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_nama');
    TOKEN = '';
    window.location.reload();
});

function showLoginModal() {
    loginModal.style.display = 'flex';
    mainDashboard.style.display = 'none';
}

function showDashboard() {
    loginModal.style.display = 'none';
    mainDashboard.style.display = 'flex';
    namaAdminLogged.textContent = localStorage.getItem('admin_nama') || 'Super Admin';
    
    // Load seluruh data dari API database semenjak login sukses
    loadStatistik();
    loadDataPenyewaan();
    loadDataAlatCamping();
}

// ---------------------------------------------------------
// FUNGSI PINDAH MENU SIDEBAR (TABBING)
// ---------------------------------------------------------
function switchSection(sectionId) {
    // Sembunyikan semua section
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(sec => sec.classList.remove('active-section'));
    
    // Hilangkan semua kelas active di sidebar links
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    // Tampilkan section pilihan & aktifkan highlight menunya
    document.getElementById(`section-${sectionId}`).classList.add('active-section');
    event.currentTarget.classList.add('active');
}

// ---------------------------------------------------------
// FUNGSI LOAD STATISTIK SEDERHANA
// ---------------------------------------------------------
async function loadStatistik() {
    try {
        const response = await fetch(`${BASE_URL}/penyewaan`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const resRent = await response.json();

        const responseAlat = await fetch(`${BASE_URL}/alat-camping`);
        const resAlat = await responseAlat.json();

        if (resRent.status === 'success' && resAlat.status === 'success') {
            const dataSewa = resRent.data;
            const dataAlat = resAlat.data;

            const totalSewa = dataSewa.length;
            const pendingSewa = dataSewa.filter(item => item.status === 'pending').length;
            const totalAlat = dataAlat.length;

            document.getElementById('stat-total-sewa').textContent = totalSewa;
            document.getElementById('stat-pending-sewa').textContent = pendingSewa;
            document.getElementById('stat-total-alat').textContent = totalAlat;
        }
    } catch (err) {
        console.error('Gagal mengambil data statistik:', err);
    }
}

// ---------------------------------------------------------
// FUNGSI AMBIL & TAMPILKAN DATA PENYEWAAN (REALTIME SIMULATION)
// ---------------------------------------------------------
async function loadDataPenyewaan() {
    const tbody = document.getElementById('tabel-penyewaan');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Memuat data transaksi...</td></tr>';

    try {
        const response = await fetch(`${BASE_URL}/penyewaan`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const result = await response.json();

        if (result.status === 'success') {
            tbody.innerHTML = '';
            const listTransaksi = result.data;

            if (listTransaksi.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Belum ada riwayat transaksi penyewaan.</td></tr>';
                return;
            }

            listTransaksi.forEach(item => {
                const tr = document.createElement('tr');
                
                // Format total rupiah ke mata uang lokal IDR
                const formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_harga);

                // Path Gambar dari file system uploads backend
                const ktpUrl = `http://localhost:5000/uploads/ktp/${item.ktp}`;
                const buktiUrl = item.bukti_transfer ? `http://localhost:5000/uploads/bukti_transfer/${item.bukti_transfer}` : null;

                tr.innerHTML = `
                    <td>
                        <strong>${item.nama}</strong><br>
                        <small>WA: ${item.no_wa}</small><br>
                        <small>Alamat: ${item.alamat}</small>
                    </td>
                    <td><strong>${item.nama_alat}</strong><br><small>${item.jumlah} Unit</small></td>
                    <td>${item.durasi} Hari</td>
                    <td><b style="color:var(--success-color);">${formatRupiah}</b></td>
                    <td><span class="badge" style="background:#e0e0e0; color:#333;">${item.metode_pembayaran}</span></td>
                    <td>
                        <a href="${ktpUrl}" target="_blank">
                            <img src="${ktpUrl}" class="img-thumb" alt="KTP">
                        </a>
                    </td>
                    <td>
                        ${buktiUrl ? `
                            <a href="${buktiUrl}" target="_blank">
                                <img src="${buktiUrl}" class="img-thumb" alt="Transfer">
                            </a>
                        ` : '<i style="color:#aaa;">COD (Tanpa Bukti)</i>'}
                    </td>
                    <td><span class="badge badge-${item.status}">${item.status}</span></td>
                    <td>
                        ${item.status === 'pending' ? `
                            <button class="btn-action btn-approve" onclick="updateStatusSewa(${item.id}, 'disetujui')">Setujui</button>
                            <button class="btn-action btn-reject" onclick="updateStatusSewa(${item.id}, 'ditolak')">Tolak</button>
                        ` : `<span style="color:#888; font-size:12px;">Selesai diproses</span>`}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">Gagal memuat data dari API Backend.</td></tr>';
    }
}

// ---------------------------------------------------------
// FUNGSI UPDATE STATUS PENYEWAAN (PUT METHOD)
// ---------------------------------------------------------
async function updateStatusSewa(id, statusBaru) {
    if (!confirm(`Apakah Anda yakin ingin mengubah status transaksi ini menjadi [${statusBaru.toUpperCase()}]?`)) {
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/penyewaan/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ status: statusBaru })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(`Transaksi berhasil diupdate ke status: ${statusBaru}`);
            // Reload otomatis data dan statistik agar realtime
            loadDataPenyewaan();
            loadStatistik();
        } else {
            alert(`Gagal merubah status: ${result.message}`);
        }
    } catch (err) {
        alert('Terjadi kesalahan sistem saat mencoba update data.');
    }
}

// // ---------------------------------------------------------
// // FUNGSI AMBIL & TAMPILKAN DATA ALAT CAMPING (KATALOG)
// // ---------------------------------------------------------
// async function loadDataAlatCamping() {
//     const tbody = document.getElementById('tabel-alat');
//     tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat katalog alat...</td></tr>';

//     try {
//         const response = await fetch(`${BASE_URL}/alat-camping`);
//         const result = await response.json();

//         if (result.status === 'success') {
//             tbody.innerHTML = '';
//             const listAlat = result.data;

//             listAlat.forEach(alat => {
//                 const tr = document.createElement('tr');
//                 const formatHarga = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(alat.harga);
                
//                 // Mengambil gambar default dari backend (jika seed, gambar langsung string nama_file)
//                 const gambarUrl = `http://localhost:5000/uploads/alat/${alat.gambar}`;

//                 tr.innerHTML = `
//                     <td><img src="${gambarUrl}" class="img-thumb" style="width:60px; height:60px;" onerror="this.src='https://via.placeholder.com/60?text=Alat'"></td>
//                     <td><strong>${alat.nama_alat}</strong></td>
//                     <td>${formatHarga}</td>
//                     <td><b style="color:${alat.stok > 0 ? 'var(--dark-green)' : 'red'}">${alat.stok} Unit</b></td>
//                     <td><p style="max-width:300px; font-size:13px; color:#555;">${alat.deskripsi || '-'}</p></td>
//                 `;
//                 tbody.appendChild(tr);
//             });
//         }
//     } catch (err) {
//         tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat katalog barang.</td></tr>';
//     }
// }


// Pasang data array yang sudah kamu rapikan di atas admin.js atau di dalam fungsi ini
const FALLBACK_CATALOG = [
    { id: 1, nama_alat: "Tenda Kapasitas 2 Orang", harga: 25000, stok: 15, deskripsi: "Tempat berlindung utama dari hujan, angin, dan udara dingin untuk kapasitas kecil.", gambar: "assets/tenda2org.png" },
    { id: 2, nama_alat: "Tenda Kapasitas 4 Orang", harga: 35000, stok: 20, deskripsi: "Ukuran tenda paling populer dan paling sering disewa oleh kelompok kecil atau keluarga.", gambar: "assets/tenda4org.png" },
    { id: 3, nama_alat: "Tenda Kapasitas 6 Orang", harga: 50000, stok: 10, deskripsi: "Akomodasi utama berukuran besar untuk rombongan atau kelompok banyak orang.", gambar: "assets/tenda6org.png" },
    { id: 4, nama_alat: "Tas Carrier / Ransel Gunung", harga: 20000, stok: 25, deskripsi: "Wadah utama paling penting untuk mengemas dan membawa semua logistik ke atas gunung.", gambar: "assets/carrier.png" },
    { id: 5, nama_alat: "Sepatu Gunung", harga: 20000, stok: 15, deskripsi: "Pelindung kaki paling krusial untuk melewati medan tanah, batu, dan jalur licin.", gambar: "assets/sepatu gunung.png" },
    { id: 6, nama_alat: "Sleeping Bag", harga: 8000, stok: 30, deskripsi: "Selimut kantung krusial untuk menjaga suhu tubuh tetap hangat saat tidur di malam hari.", gambar: "assets/sleeping_bag.png" },
    { id: 7, nama_alat: "Matras Foil", harga: 5000, stok: 20, deskripsi: "Alas tidur premium yang sangat efektif memantulkan panas tubuh dan menahan dingin tanah.", gambar: "assets/matras foil.png" },
    { id: 8, nama_alat: "Matras Karet / Matras Spon", harga: 3000, stok: 40, deskripsi: "Alas tidur dasar di dalam tenda agar tidak langsung bersentuhan dengan lantai tanah.", gambar: "assets/matras.png" },
    { id: 9, nama_alat: "Flysheet", harga: 7000, stok: 25, deskripsi: "Lapisan terpal pelindung tambahan di luar tenda agar terhindar dari kebocoran air hujan.", gambar: "assets/flysheet.png" },
    { id: 10, nama_alat: "Tiang Flysheet", harga: 5000, stok: 20, deskripsi: "Penyangga besi utama untuk mendirikan flysheet sebagai tempat berkumpul atau dapur darurat.", gambar: "assets/tiang_flysheet.png" },
    { id: 11, nama_alat: "Pasak Tenda", harga: 1000, stok: 100, deskripsi: "Komponen krusial untuk menancapkan tenda dan flysheet ke tanah agar kokoh ditiup angin.", gambar: "assets/pasak_tenda.png" },
    { id: 12, nama_alat: "Kotak P3K", harga: 5000, stok: 15, deskripsi: "Perlengkapan keselamatan medis wajib untuk mengantisipasi luka ringan atau cedera di gunung.", gambar: "assets/active_kotak-p3k.png" },
    { id: 13, nama_alat: "Kompor Portable / Kompor Camping", harga: 10000, stok: 25, deskripsi: "Alat masak utama yang ringkas untuk mengolah makanan dan air hangat di area camp.", gambar: "assets/active_kotak-p3k.png" },
    { id: 14, nama_alat: "Gas Portable", harga: 5000, stok: 50, deskripsi: "Bahan bakar wajib yang harus selalu ada untuk menyalakan kompor camping.", gambar: "assets/gas_portable.png" },
    { id: 15, nama_alat: "Nesting / Peralatan Masak", harga: 10000, stok: 20, deskripsi: "Set panci dan wajan susun yang praktis untuk memasak berbagai jenis makanan di gunung.", gambar: "assets/nesting.png" },
    { id: 16, nama_alat: "Jaket Waterproof", harga: 15000, stok: 15, deskripsi: "Pakaian luar utama pendaki untuk menahan badai angin dan air hujan di jalur pendakian.", gambar: "assets/jaket waterproof.png" },
    { id: 17, nama_alat: "Lampu Tenda", harga: 5000, stok: 30, deskripsi: "Sumber pencahayaan utama yang wajib digantung di dalam tenda saat malam hari.", gambar: "assets/lampu_tenda.png" },
    { id: 18, nama_alat: "Trekking Pole", harga: 5000, stok: 30, deskripsi: "Alat bantu kestabilan kaki dan lutut saat menanjak maupun turun gunung.", gambar: "assets/trekking pole.png" },
    { id: 19, nama_alat: "Sarung Tangan", harga: 3000, stok: 30, deskripsi: "Pelindung tangan dari gesekan batu/tumbuhan sekaligus menjaga kehangatan dari udara dingin.", gambar: "assets/sarung_tangan.png" },
    { id: 20, nama_alat: "Tas Hydropack", harga: 10000, stok: 15, deskripsi: "Ransel punggung praktis untuk membawa kantung air minum selama berjalan.", gambar: "assets/tas hydropack.png" },
    { id: 21, nama_alat: "Celana Outdoor", harga: 10000, stok: 15, deskripsi: "Pakaian lapangan yang fleksibel, ringan, dan cepat kering jika terkena basah.", gambar: "assets/celana outdoor.png" },
    { id: 22, nama_alat: "Topi Rimba", harga: 3000, stok: 20, deskripsi: "Pelindung kepala dan wajah dari sengatan matahari langsung atau tetesan air dari pohon.", gambar: "assets/topi rimba.png" },
    { id: 23, nama_alat: "Powerbank", harga: 10000, stok: 20, deskripsi: "Sumber daya cadangan penting untuk mengisi ulang baterai HP, lampu, atau kamera.", gambar: "assets/powerbank.png" },
    { id: 24, nama_alat: "Jas Hujan Plastik", harga: 2000, stok: 50, deskripsi: "Proteksi darurat tambahan yang murah dan ringan jika intensitas hujan sangat tinggi.", gambar: "assets/jas hujan plastik.png" },
    { id: 25, nama_alat: "Emergency Blanket", harga: 3000, stok: 30, deskripsi: "Selimut aluminium tipis wajib untuk pertolongan pertama pada korban gejala hipotermia.", gambar: "assets/emergency blanket.png" },
    { id: 26, nama_alat: "Hand Warmer", harga: 2000, stok: 50, deskripsi: "Alat penghangat instan sekali pakai untuk meredakan jari kaku akibat cuaca ekstrem.", gambar: "assets/hand warmer.png" },
    { id: 27, nama_alat: "Hammock", harga: 5000, stok: 25, deskripsi: "Tempat tidur gantung untuk bersantai-santai di antara dua pohon saat siang hari.", gambar: "assets/hammock.png" },
    { id: 28, nama_alat: "Kursi Lipat", harga: 8000, stok: 30, deskripsi: "Kursi portabel untuk bersantai dengan nyaman di depan tenda sambil menikmati kopi.", gambar: "assets/kursi_lipat.png" },
    { id: 29, nama_alat: "Meja Lipat", harga: 12000, stok: 15, deskripsi: "Meja praktis untuk menaruh makanan atau kompor agar tidak kotor terkena tanah.", gambar: "assets/meja_lipat.png" },
    { id: 30, nama_alat: "Kacamata Outdoor", harga: 5000, stok: 20, deskripsi: "Pelindung mata dari debu, angin kencang, dan terik matahari di puncak gunung.", gambar: "assets/kacamata.png" }
];

// ---------------------------------------------------------
// FUNGSI AMBIL & TAMPILKAN DATA ALAT CAMPING (KATALOG)
// ---------------------------------------------------------
async function loadDataAlatCamping() {
    const tbody = document.getElementById('tabel-alat');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat katalog alat...</td></tr>';

    try {
        const response = await fetch(`${BASE_URL}/alat-camping`);
        const result = await response.json();

        if (result.status === 'success') {
            tbody.innerHTML = '';
            const listAlat = result.data;

            listAlat.forEach(alat => {
                const tr = document.createElement('tr');
                const formatHarga = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(alat.harga);
                
                // --- LOGIKA EMAS COCOKKAN GAMBAR ---
                let gambarUrl = '';

                // 1. Cek dulu apakah nama file mengandung 'alat-' (Artinya barang upload-an baru lewat Multer Node.js)
                if (alat.gambar && alat.gambar.startsWith('alat-')) {
                    gambarUrl = `http://localhost:5000/uploads/alat/${alat.gambar}`;
                } else {
                    // 2. Jika data seed (bawaan DB), cari objek di FALLBACK_CATALOG yang ID-nya sama dengan ID dari Database
                    const itemCocok = FALLBACK_CATALOG.find(item => item.id === alat.id);
                    
                    if (itemCocok) {
                        // Ambil path "assets/tenda2org.png" -> diubah jadi "../assets/tenda2org.png" karena posisi admin ada di folder admin/
                        const pathBersih = itemCocok.gambar.replace('assets/', '');
                        gambarUrl = `../assets/${pathBersih}`;
                    } else {
                        // Jika tidak ada di data lokal, gunakan nama file dari database langsung
                        gambarUrl = `../assets/${alat.gambar}`;
                    }
                }

                tr.innerHTML = `
                    <td>
                        <img src="${gambarUrl}" class="img-thumb" style="width:60px; height:60px; object-fit:contain;" 
                             onerror="this.src='https://via.placeholder.com/60?text=Alat'">
                    </td>
                    <td><strong>${alat.nama_alat}</strong></td>
                    <td>${formatHarga}</td>
                    <td><b style="color:${alat.stok > 0 ? 'green' : 'red'}">${alat.stok} Unit</b></td>
                    <td><p style="max-width:300px; font-size:13px; color:#555; margin:0;">${alat.deskripsi || '-'}</p></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat katalog barang.</td></tr>';
    }
}
