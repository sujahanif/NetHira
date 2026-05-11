// 1. Proteksi Halaman (Harus Login)
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('Akses ditolak! Kamu harus login terlebih dahulu.');
    window.location.href = 'login.html';
}

// Fungsi Logout untuk tombol di header
function logout() {
    const isConfirm = confirm("Apakah kamu yakin ingin keluar?");
    if(isConfirm) {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// 2. Ambil data dari Local Storage
// Ambil data dari Local Storage. Jika kosong, gunakan data bawaan ini.
let devicesData = JSON.parse(localStorage.getItem('netboxData')) || [
    { id: 1, name: 'huawei', role: 'SERVER', ip: '10.100.1.20', status: 'ONLINE' },
    { id: 2, name: 'cisco-core', role: 'SWITCH', ip: '10.100.1.1', status: 'ONLINE' },
    { id: 3, name: 'mikrotik-gw', role: 'ROUTER', ip: '192.168.1.1', status: 'OFFLINE' }
];

// Opsional: Langsung simpan data bawaan ini ke memori agar tersinkronisasi
if (!localStorage.getItem('netboxData')) {
    localStorage.setItem('netboxData', JSON.stringify(devicesData));
}

// 3. Menghitung Angka Statistik
let totalDevices = devicesData.length;
let onlineDevices = 0;
let offlineDevices = 0;

// Variabel untuk menghitung jumlah tiap role untuk grafik
let serverCount = 0;
let routerCount = 0;
let switchCount = 0;

// Melakukan perulangan (loop) untuk mengecek setiap data
devicesData.forEach(device => {
    // Hitung Status
    if (device.status === 'ONLINE') onlineDevices++;
    if (device.status === 'OFFLINE') offlineDevices++;

    // Hitung Role
    if (device.role === 'SERVER') serverCount++;
    if (device.role === 'ROUTER') routerCount++;
    if (device.role === 'SWITCH') switchCount++;
});

// 4. Masukkan angka yang dihitung ke dalam HTML (Kotak Statistik)
document.getElementById('statTotal').innerText = totalDevices;
document.getElementById('statOnline').innerText = onlineDevices;
document.getElementById('statOffline').innerText = offlineDevices;

// 5. Membuat Grafik menggunakan Chart.js
const ctx = document.getElementById('roleChart').getContext('2d');

new Chart(ctx, {
    type: 'bar', // Tipe grafik: bar (batang). Bisa juga diubah jadi 'pie' atau 'doughnut'
    data: {
        labels: ['SERVER', 'ROUTER', 'SWITCH'], // Label di bawah sumbu X
        datasets: [{
            label: 'Jumlah Perangkat',
            data: [serverCount, routerCount, switchCount], // Data yang dihitung di atas
            backgroundColor: [
                'rgba(42, 86, 246, 0.7)',  // Biru untuk Server
                'rgba(34, 197, 94, 0.7)',  // Hijau untuk Router
                'rgba(244, 63, 94, 0.7)'   // Merah untuk Switch
            ],
            borderColor: [
                'rgba(42, 86, 246, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(244, 63, 94, 1)'
            ],
            borderWidth: 1,
            borderRadius: 6 // Ujung batang melengkung
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true, // Mulai dari angka 0
                ticks: {
                    stepSize: 1 // Angka di sumbu Y bulat (1, 2, 3...)
                }
            }
        }
    }
});

// ==========================================
// 6. MENAMPILKAN 5 PERANGKAT TERBARU
// ==========================================
const recentTbody = document.getElementById('recentTableBody');
recentTbody.innerHTML = ''; // Kosongkan dulu

// Salin array data, urutkan berdasarkan ID dari yang terbesar (terbaru), lalu potong hanya 5 data pertama
const recentDevices = [...devicesData]
    .sort((a, b) => b.id - a.id) 
    .slice(0, 5);

// Jika tidak ada data
if (recentDevices.length === 0) {
    recentTbody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-sm text-gray-500 italic">Belum ada perangkat yang ditambahkan.</td></tr>`;
} else {
    // Looping data dan buatkan baris tabelnya
    recentDevices.forEach(device => {
        const statusBadge = device.status === 'ONLINE' 
            ? '<span class="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200">ONLINE</span>'
            : '<span class="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">OFFLINE</span>';

        const rowHTML = `
            <tr class="hover:bg-blue-50/50 transition">
                <td class="py-3 px-4">
                    <div class="font-bold text-gray-700 text-sm">${device.name}</div>
                    <div class="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">${device.role}</div>
                </td>
                <td class="py-3 px-4 text-sm font-semibold text-[#2a56f6]">${device.ip}</td>
                <td class="py-3 px-4">${statusBadge}</td>
            </tr>
        `;
        recentTbody.innerHTML += rowHTML;
    });
}