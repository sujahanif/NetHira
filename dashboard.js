// 1. PROTEKSI HALAMAN
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('Akses ditolak! Kamu harus login terlebih dahulu.');
    window.location.href = 'login.html';
}

function logout() {
    Swal.fire({
        title: 'Keluar Aplikasi?',
        text: "Sesi kamu akan diakhiri.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2a56f6',
        cancelButtonColor: '#f43f5e',
        confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        }
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('mobileOverlay').classList.toggle('hidden');
}

// 2. MENGAMBIL DATA DARI KETIGA LOCAL STORAGE
const devicesData = JSON.parse(localStorage.getItem('netboxData')) || [];
const vmData = JSON.parse(localStorage.getItem('netboxVMData')) || [];
const ipData = JSON.parse(localStorage.getItem('netboxIPData')) || [];

// 3. UPDATE KOTAK STATISTIK DI ATAS
document.getElementById('statDevices').innerText = devicesData.length;
document.getElementById('statVMs').innerText = vmData.length;
document.getElementById('statIPs').innerText = ipData.length;

// 4. MENGHITUNG DATA UNTUK GRAFIK (Gabungan Hardware & VM)
let onlineCount = 0;
let offlineCount = 0;

// Hitung status Hardware
devicesData.forEach(device => {
    // Pastikan menggunakan device.status
    if (device.status === 'ONLINE') onlineCount++;
    if (device.status === 'OFFLINE') offlineCount++;
});

// Hitung status VM
vmData.forEach(vm => {
    // Pastikan menggunakan vm.status
    if (vm.status === 'ONLINE') onlineCount++;
    if (vm.status === 'OFFLINE') offlineCount++;
});

// MEMBUAT GRAFIK PIE CHART (Mengganti Bar Chart lama)
const ctx = document.getElementById('overviewChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut', // Menggunakan grafik donat agar lebih estetik
    data: {
        labels: ['ONLINE', 'OFFLINE'],
        datasets: [{
            data: [onlineCount, offlineCount],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)', // Hijau untuk Online
                'rgba(244, 63, 94, 0.8)'  // Merah untuk Offline
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // Ketebalan donat
        plugins: {
            legend: { position: 'bottom' }
        }
    }
});

// 5. MENGISI TABEL "RECENTLY ADDED" DENGAN GABUNGAN DATA
const recentTbody = document.getElementById('recentTableBody');
recentTbody.innerHTML = '';

// Menggabungkan array Hardware dan VM, lalu memberi label agar kita tahu asalnya
const combinedData = [
    ...devicesData.map(item => ({ ...item, type: 'Hardware' })),
    ...vmData.map(item => ({ ...item, type: 'Virtual Machine' }))
];

// Urutkan dari yang paling baru (ID terbesar), dan ambil 5 teratas
const recentItems = combinedData
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

if (recentItems.length === 0) {
    recentTbody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-sm text-gray-500 italic">Belum ada perangkat yang ditambahkan.</td></tr>`;
} else {
    recentItems.forEach(item => {
        const statusBadge = item.status === 'ONLINE' 
            ? '<span class="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200">ONLINE</span>'
            : '<span class="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">OFFLINE</span>';
        
        const typeBadge = item.type === 'Hardware'
            ? '<span class="text-blue-500 text-xs font-bold"><i class="fa-solid fa-server mr-1"></i> Hardware</span>'
            : '<span class="text-purple-500 text-xs font-bold"><i class="fa-solid fa-cloud mr-1"></i> Virtual Machine</span>';

        const rowHTML = `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td class="py-3 px-4 font-bold text-gray-700 dark:text-gray-200 text-sm">${item.name}</td>
                <td class="py-3 px-4">${typeBadge}</td>
                <td class="py-3 px-4">${statusBadge}</td>
            </tr>
        `;
        recentTbody.innerHTML += rowHTML;
    });
}