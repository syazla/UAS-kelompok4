// script.js
// Frontend Logic untuk Camprent - Keranjang Belanja, Integrasi API Backend, & Uji Submit

// ---------------------------------------------------------
// 1. DATA KATALOG CADANGAN (FALLBACK)
// ---------------------------------------------------------
// Digunakan jika backend Node.js sedang offline agar UI tetap terisi 30 barang
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
    { id: 30, nama_alat: "Kacamata Outdoor", harga: 5000, stock: 20, deskripsi: "Pelindung mata dari debu, angin kencang, dan terik matahari di puncak gunung.", gambar: "assets/kacamata.png" }
];

// ---------------------------------------------------------
// 2. STATE APLIKASI
// ---------------------------------------------------------
let catalog = []; // Menyimpan data katalog yang ditarik dari database / fallback
let cart = [];    // Menyimpan daftar barang yang sedang disewa

// Konfigurasi URL API Backend
const API_BASE_URL = '/api';

// ---------------------------------------------------------
// 3. EVENT LISTENERS UTAMA (ON LOAD)
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi awal
    fetchKatalog();
    setupEventListeners();
    updateCartUI();
});

// ---------------------------------------------------------
// 4. FETCH DATA KATALOG DARI BACKEND
// ---------------------------------------------------------
async function fetchKatalog() {
    const grid = document.getElementById('katalogGrid');
    try {
        const response = await fetch(`${API_BASE_URL}/alat-camping`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            console.log('[API Connection] Berhasil terhubung ke Backend & Database MySQL.');
            // Gunakan gambar Unsplash estetik agar visual menarik, namun nama file gambar tetap disesuaikan dengan DB
            //     catalog = result.data.map((item, index) => {
            //         return {
            //             ...item,
            //             // Map gambar lokal ke URL fallback agar UI mempesona di tahap awal
            //             gambar_url: FALLBACK_CATALOG[index] ? FALLBACK_CATALOG[index].gambar : 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop'
            //         };
            //     });
            // Kode pengganti baru Anda:
            catalog = result.data;

        } else {
            throw new Error('Katalog kosong atau format tidak sesuai');
        }
    } catch (error) {
        console.warn('[API Connection] Gagal terhubung ke Backend. Mengaktifkan mode offline/fallback dengan data 30 barang.');
        catalog = FALLBACK_CATALOG.map(item => ({ ...item, gambar_url: item.gambar }));
    }

    renderKatalog(catalog);
}

// Render Katalog ke Grid HTML
function renderKatalog(items) {
    const grid = document.getElementById('katalogGrid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = `<div class="loading-catalog"><p>Tidak ada perlengkapan yang ditemukan.</p></div>`;
        return;
    }

    items.forEach(item => {
        // Tentukan kategori default untuk filter sederhana
        let category = 'aksesoris';
        const nama = item.nama_alat.toLowerCase();
        if (nama.includes('tenda') || nama.includes('matras') || nama.includes('flysheet') || nama.includes('pasak')) {
            category = 'tenda';
        } else if (nama.includes('kompor') || nama.includes('gas') || nama.includes('nesting')) {
            category = 'masak';
        } else if (nama.includes('sepatu') || nama.includes('jaket') || nama.includes('celana') || nama.includes('sarung tangan')) {
            category = 'pakaian';
        }

        const isAvailable = item.stok > 0;
        const cardHtml = `
            <div class="katalog-card" data-category="${category}">
                <div class="card-img-wrapper">
                    <img src="assets/${item.gambar}" alt="${item.nama_alat}">
                    <span class="card-stock-badge ${isAvailable ? 'available' : 'out'}">
                        ${isAvailable ? `Stok: ${item.stok}` : 'Stok Habis'}
                    </span>
                </div>
                <div class="card-content">
                    <h3>${item.nama_alat}</h3>
                    <p class="card-desc">${item.deskripsi || 'Perlengkapan camping premium untuk petualangan alam bebas.'}</p>
                    
                    <div class="card-footer">
                        <div class="card-price-row">
                            <div class="card-price">
                                Rp ${parseInt(item.harga).toLocaleString('id-ID')} <span>/ 2H1M</span>
                            </div>
                        </div>
                        
                        <!-- Pilihan Durasi -->
                        <select class="card-duration-select" id="durasi-${item.id}">
                            <option value="2">2 Hari 1 Malam (Harga Dasar)</option>
                            <option value="3">3 Hari 2 Malam (+ Rp 3.000)</option>
                            <option value="4">4 Hari 3 Malam (+ Rp 6.000)</option>
                            <option value="7">7 Hari 6 Malam (+ Rp 10.000)</option>
                        </select>
                        
                        <button class="btn-rent-card" onclick="tambahKeKeranjang(${item.id})" ${!isAvailable ? 'disabled' : ''}>
                            <i class="fa-solid fa-basket-shopping"></i> Sewa Alat
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// ---------------------------------------------------------
// 5. SISTEM KERANJANG SEWA
// ---------------------------------------------------------

// Tambah Barang ke Keranjang
function tambahKeKeranjang(itemId) {
    const item = catalog.find(p => p.id === itemId);
    if (!item) return;

    // Ambil pilihan durasi dari dropdown card
    const durationSelect = document.getElementById(`durasi-${itemId}`);
    const durasi = parseInt(durationSelect.value);

    // Cek apakah barang dengan ID dan Durasi yang sama sudah ada di keranjang
    const existing = cart.find(c => c.id === itemId && c.durasi === durasi);

    if (existing) {
        if (existing.jumlah < item.stok) {
            existing.jumlah += 1;
        } else {
            alert(`Batas maksimal penyewaan sesuai ketersediaan stok: ${item.stok} unit.`);
        }
    } else {
        cart.push({
            id: item.id,
            nama_alat: item.nama_alat,
            harga: item.harga,
            gambar_url: item.gambar_url,
            stok: item.stok,
            jumlah: 1,
            durasi: durasi
        });
    }

    updateCartUI();
    // Efek smooth scroll ke keranjang sewa
    document.getElementById('sewa').scrollIntoView({ behavior: 'smooth' });
}

// Hapus Item dari Keranjang
function hapusDariKeranjang(itemId, durasi) {
    cart = cart.filter(c => !(c.id === itemId && c.durasi === durasi));
    updateCartUI();
}

// Kurangi Jumlah Item
function kurangiJumlahItem(itemId, durasi) {
    const existing = cart.find(c => c.id === itemId && c.durasi === durasi);
    if (existing) {
        existing.jumlah -= 1;
        if (existing.jumlah <= 0) {
            hapusDariKeranjang(itemId, durasi);
        } else {
            updateCartUI();
        }
    }
}

// Tambah Jumlah Item
function tambahJumlahItem(itemId, durasi) {
    const existing = cart.find(c => c.id === itemId && c.durasi === durasi);
    if (existing) {
        if (existing.jumlah < existing.stok) {
            existing.jumlah += 1;
            updateCartUI();
        } else {
            alert(`Stok tidak mencukupi. Sisa stok: ${existing.stok} unit.`);
        }
    }
}

// Update Pilihan Durasi Langsung di Keranjang
function updateDurasiKeranjang(itemId, durasiLama, durasiBaru) {
    const existing = cart.find(c => c.id === itemId && c.durasi === durasiLama);
    if (existing) {
        existing.durasi = parseInt(durasiBaru);
        // Cek apakah setelah diupdate, ada item sejenis dengan durasi yang sama
        const duplicateIndex = cart.findIndex(c => c.id === itemId && c.durasi === existing.durasi && c !== existing);
        if (duplicateIndex !== -1) {
            cart[duplicateIndex].jumlah += existing.jumlah;
            cart = cart.filter(c => c !== existing);
        }
        updateCartUI();
    }
}

// Bersihkan Keranjang
function kosongkanKeranjang() {
    cart = [];
    updateCartUI();
}

// Hitung Total Bayar Berdasarkan Aturan Tambah Hari Baru
function hitungTotalHargaItem(hargaKatalog, durasi, jumlah) {
    let extraFee = 0;
    if (durasi === 2) extraFee = 0;
    else if (durasi === 3) extraFee = 3000;
    else if (durasi === 4) extraFee = 6000;
    else if (durasi === 7) extraFee = 10000;
    else {
        if (durasi > 2) extraFee = (durasi - 2) * 3000;
    }
    return (hargaKatalog + extraFee) * jumlah;
}

// Update Tampilan UI Keranjang
function updateCartUI() {
    const cartList = document.getElementById('cartItemsList');
    const badgeCount = document.getElementById('cartBadgeCount');
    const summaryTotalItems = document.getElementById('summaryTotalItems');
    const summaryTotalPrice = document.getElementById('summaryTotalPrice');

    // Update floating badge
    const totalUnit = cart.reduce((acc, curr) => acc + curr.jumlah, 0);
    badgeCount.textContent = totalUnit;
    summaryTotalItems.textContent = `${totalUnit} Unit`;

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-mountain-sun"></i>
                <p>Keranjang sewa Anda kosong.</p>
                <span>Pilih perlengkapan di katalog untuk disewa.</span>
            </div>
        `;
        summaryTotalPrice.textContent = 'Rp 0';
        return;
    }

    cartList.innerHTML = '';
    let grandTotal = 0;

    cart.forEach(item => {
        const totalHargaItem = hitungTotalHargaItem(item.harga, item.durasi, item.jumlah);
        grandTotal += totalHargaItem;

        const itemHtml = `
            <div class="cart-item">
                <img src="${item.gambar_url}" alt="${item.nama_alat}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.nama_alat}</h4>
                    <div class="cart-item-price">
                        Rp ${totalHargaItem.toLocaleString('id-ID')}
                    </div>
                    
                    <div class="cart-item-controls">
                        <!-- Pilihan Durasi -->
                        <select class="cart-item-duration" onchange="updateDurasiKeranjang(${item.id}, ${item.durasi}, this.value)">
                            <option value="2" ${item.durasi === 2 ? 'selected' : ''}>2H1M</option>
                            <option value="3" ${item.durasi === 3 ? 'selected' : ''}>3H2M</option>
                            <option value="4" ${item.durasi === 4 ? 'selected' : ''}>4H3M</option>
                            <option value="7" ${item.durasi === 7 ? 'selected' : ''}>7H6M</option>
                        </select>
                        
                        <!-- Kuantitas -->
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="kurangiJumlahItem(${item.id}, ${item.durasi})">-</button>
                            <span class="qty-val">${item.jumlah}</span>
                            <button class="qty-btn" onclick="tambahJumlahItem(${item.id}, ${item.durasi})">+</button>
                        </div>
                    </div>
                </div>
                
                <button class="btn-remove-item" onclick="hapusDariKeranjang(${item.id}, ${item.durasi})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        cartList.insertAdjacentHTML('beforeend', itemHtml);
    });

    summaryTotalPrice.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

// ---------------------------------------------------------
// 6. SISTEM PAKET BUNDLING (AUTO-CART)
// ---------------------------------------------------------
function sewaPaket(jenisPaket) {
    kosongkanKeranjang();

    let itemsToAdd = [];

    if (jenisPaket === 'duo') {
        // Tenda 2P, 2 Sleeping Bag, 2 Matras Spon, 1 Kompor, 1 Gas
        itemsToAdd = [
            { name: "Tenda Kapasitas 2 Orang", qty: 1, duration: 2 },
            { name: "Sleeping Bag", qty: 2, duration: 2 },
            { name: "Matras Karet / Matras Spon", qty: 2, duration: 2 },
            { name: "Kompor Portable / Kompor Camping", qty: 1, duration: 2 },
            { name: "Gas Portable", qty: 1, duration: 2 }
        ];
    } else if (jenisPaket === 'family') {
        // Tenda 4P, 4 Sleeping Bag, 4 Matras Foil, 1 Kompor, 1 Nesting, 1 Gas
        itemsToAdd = [
            { name: "Tenda Kapasitas 4 Orang", qty: 1, duration: 2 },
            { name: "Sleeping Bag", qty: 4, duration: 2 },
            { name: "Matras Foil", qty: 4, duration: 2 },
            { name: "Kompor Portable / Kompor Camping", qty: 1, duration: 2 },
            { name: "Nesting / Peralatan Masak", qty: 1, duration: 2 },
            { name: "Gas Portable", qty: 1, duration: 2 }
        ];
    } else if (jenisPaket === 'squad') {
        // Tenda 6P, 6 Sleeping Bag, 6 Matras Foil, 1 Kompor, 1 Nesting, 1 Gas, 1 Lampu, 2 Kursi
        itemsToAdd = [
            { name: "Tenda Kapasitas 6 Orang", qty: 1, duration: 2 },
            { name: "Sleeping Bag", qty: 6, duration: 2 },
            { name: "Matras Foil", qty: 6, duration: 2 },
            { name: "Kompor Portable / Kompor Camping", qty: 1, duration: 2 },
            { name: "Gas Portable", qty: 1, duration: 2 },
            { name: "Nesting / Peralatan Masak", qty: 1, duration: 2 },
            { name: "Lampu Tenda", qty: 1, duration: 2 },
            { name: "Kursi Lipat", qty: 2, duration: 2 }
        ];
    }

    // Temukan item dari katalog dan masukkan ke keranjang sewa
    itemsToAdd.forEach(pItem => {
        const found = catalog.find(c => c.nama_alat.toLowerCase() === pItem.name.toLowerCase());
        if (found) {
            cart.push({
                id: found.id,
                nama_alat: found.nama_alat,
                harga: found.harga,
                gambar_url: found.gambar_url,
                stok: found.stok,
                jumlah: pItem.qty,
                durasi: pItem.duration
            });
        }
    });

    updateCartUI();
    document.getElementById('sewa').scrollIntoView({ behavior: 'smooth' });
}

// ---------------------------------------------------------
// 7. SETUP EVENT LISTENERS & LOGIKA FORM
// ---------------------------------------------------------
function setupEventListeners() {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 2. Pencarian Real-Time
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = catalog.filter(item =>
            item.nama_alat.toLowerCase().includes(val) ||
            (item.deskripsi && item.deskripsi.toLowerCase().includes(val))
        );
        renderKatalog(filtered);
    });

    // 3. Filter Kategori
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.getAttribute('data-category');
            if (cat === 'all') {
                renderKatalog(catalog);
            } else {
                const filtered = catalog.filter(item => {
                    let category = 'aksesoris';
                    const nama = item.nama_alat.toLowerCase();
                    if (nama.includes('tenda') || nama.includes('matras') || nama.includes('flysheet') || nama.includes('pasak')) {
                        category = 'tenda';
                    } else if (nama.includes('kompor') || nama.includes('gas') || nama.includes('nesting')) {
                        category = 'masak';
                    } else if (nama.includes('sepatu') || nama.includes('jaket') || nama.includes('celana') || nama.includes('sarung tangan')) {
                        category = 'pakaian';
                    }
                    return category === cat;
                });
                renderKatalog(filtered);
            }
        });
    });

    // 4. Metode Pembayaran Toggle (COD vs Transfer)
    const paymentSelect = document.getElementById('metode_pembayaran');
    const tfWrapper = document.getElementById('buktiTransferWrapper');
    const uploadGrid = document.querySelector('.file-upload-grid');
    const tfInput = document.getElementById('bukti_transfer');

    paymentSelect.addEventListener('change', () => {
        if (paymentSelect.value === 'Transfer') {
            tfWrapper.style.display = 'block';
            tfInput.required = true;
            uploadGrid.classList.remove('single-layout');
        } else {
            tfWrapper.style.display = 'none';
            tfInput.required = false;
            tfInput.value = ''; // Reset file
            document.getElementById('buktiTransferLabel').textContent = 'Pilih Bukti Transfer';
            document.getElementById('buktiTransferLabel').parentElement.classList.remove('has-file');
            uploadGrid.classList.add('single-layout');
        }
    });

    // 5. File Upload Label Update (Visual Feedback)
    const ktpInput = document.getElementById('ktp');
    ktpInput.addEventListener('change', (e) => {
        const label = document.getElementById('ktpLabel');
        if (e.target.files.length > 0) {
            label.textContent = e.target.files[0].name;
            label.parentElement.classList.add('has-file');
        } else {
            label.textContent = 'Pilih Foto KTP (.jpg, .png)';
            label.parentElement.classList.remove('has-file');
        }
    });

    tfInput.addEventListener('change', (e) => {
        const label = document.getElementById('buktiTransferLabel');
        if (e.target.files.length > 0) {
            label.textContent = e.target.files[0].name;
            label.parentElement.classList.add('has-file');
        } else {
            label.textContent = 'Pilih Bukti Transfer';
            label.parentElement.classList.remove('has-file');
        }
    });

    // 6. Tombol Hapus Semua Keranjang
    document.getElementById('clearCartBtn').addEventListener('click', kosongkanKeranjang);

    // 7. Form Submission (Koneksi ke API Backend)
    const form = document.getElementById('rentalForm');
    form.addEventListener('submit', handleFormSubmit);
}

// ---------------------------------------------------------
// 8. SUBMIT FORM & LOOP REQUEST KE BACKEND
// ---------------------------------------------------------
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validasi keranjang kosong
    if (cart.length === 0) {
        alert('Keranjang sewa Anda masih kosong. Silakan pilih alat camping di katalog terlebih dahulu!');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Mengirim Permintaan...`;

    // Ambil field data dari form
    const nama = document.getElementById('nama').value;
    const umur = document.getElementById('umur').value;
    const no_wa = document.getElementById('no_wa').value;
    const alamat = document.getElementById('alamat').value;
    const metode_pembayaran = document.getElementById('metode_pembayaran').value;
    const ktpFile = document.getElementById('ktp').files[0];
    const tfFile = document.getElementById('bukti_transfer').files[0];

    try {
        // Karena API backend menangani 1 transaksi per barang sewa, kita melakukan loop pengiriman
        const promises = cart.map(item => {
            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('umur', umur);
            formData.append('no_wa', no_wa);
            formData.append('alamat', alamat);
            formData.append('alat_id', item.id);
            formData.append('jumlah', item.jumlah);
            formData.append('durasi', item.durasi);
            formData.append('metode_pembayaran', metode_pembayaran);

            // Masukkan KTP
            formData.append('ktp', ktpFile);

            // Masukkan Bukti Transfer jika metode transfer
            if (metode_pembayaran === 'Transfer' && tfFile) {
                formData.append('bukti_transfer', tfFile);
            }

            // Jalankan request POST ke endpoint backend
            return fetch(`${API_BASE_URL}/penyewaan`, {
                method: 'POST',
                body: formData
            }).then(async res => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Gagal menyimpan transaksi');
                }
                return data;
            });
        });

        // Tunggu hingga semua request selesai
        await Promise.all(promises);

        // Sukses
        showModal(
            'Penyewaan Berhasil!',
            'Permintaan sewa Anda telah berhasil dikirim ke database. Kami akan segera mengirimkan status penyewaan via WhatsApp Anda. Terima kasih!',
            'success'
        );

        // Reset keranjang & Form
        kosongkanKeranjang();
        document.getElementById('rentalForm').reset();

        // Reset label file dropzone
        document.getElementById('ktpLabel').textContent = 'Pilih Foto KTP (.jpg, .png)';
        document.getElementById('ktpLabel').parentElement.classList.remove('has-file');
        document.getElementById('buktiTransferLabel').textContent = 'Pilih Bukti Transfer';
        document.getElementById('buktiTransferLabel').parentElement.classList.remove('has-file');
        document.getElementById('buktiTransferWrapper').style.display = 'none';
        document.querySelector('.file-upload-grid').classList.add('single-layout');

    } catch (error) {
        console.error('[Submit Error]', error);
        showModal(
            'Gagal Mengirim Sewa',
            `Terjadi kesalahan saat memproses permintaan sewa Anda: ${error.message}. Silakan cek koneksi server backend.`,
            'error'
        );
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Kirim Permintaan Sewa`;
    }
}

// ---------------------------------------------------------
// 9. MODAL POPUP HELPER
// ---------------------------------------------------------
function showModal(title, message, type) {
    const overlay = document.getElementById('modalOverlay');
    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');

    titleEl.textContent = title;
    messageEl.textContent = message;

    if (type === 'success') {
        icon.className = 'modal-icon success';
        icon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    } else {
        icon.className = 'modal-icon error';
        icon.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>`;
    }

    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}
