// ==========================================
// 1. VARIABEL GLOBAL (State)
// ==========================================
let sortColumn = ''; 
let sortAscending = true; 
let currentPage = 1;
const rowsPerPage = 5; 

// ==========================================
// 2. PROTEKSI HALAMAN & LOCAL STORAGE
// ==========================================
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('Akses ditolak! Kamu harus login terlebih dahulu.');
    window.location.href = 'login.html';
}

let devicesData = JSON.parse(localStorage.getItem('netboxData')) || [];

function saveToLocalStorage() {
    localStorage.setItem('netboxData', JSON.stringify(devicesData));
}

// ==========================================
// 3. FUNGSI RENDER TABEL
// ==========================================
function renderTable(dataToRender) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    if(dataToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-500">Tidak ada perangkat yang ditemukan.</td></tr>`;
        return;
    }

    dataToRender.forEach((device) => {
        const statusBadge = device.status === 'ONLINE' 
            ? '<span class="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full border border-green-200">ONLINE</span>'
            : '<span class="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full border border-red-200">OFFLINE</span>';

        const rowHTML = `
            <tr class="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition">
                <td class="py-4 px-6 font-bold text-gray-700 dark:text-gray-200">${device.name}</td>
                <td class="py-4 px-6">
                    <span class="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded">${device.role}</span>
                </td>
                <td class="py-4 px-6 font-semibold text-[#2a56f6] dark:text-blue-400">${device.ip}</td>
                <td class="py-4 px-6">${statusBadge}</td>
                <td class="py-4 px-6 flex gap-2">
                    <button onclick="openEditModal(${device.id})" class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded transition" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteDevice(${device.id})" class="text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-gray-700 p-2 rounded transition" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHTML;
    });
}

// ==========================================
// 4. FUNGSI FILTER, SORTING & PENCARIAN
// ==========================================
function filterData() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const roleFilter = document.getElementById('filterRole').value;

    let filteredData = devicesData.filter(device => {
        const matchKeyword = device.name.toLowerCase().includes(keyword) || device.ip.includes(keyword);
        const matchStatus = statusFilter === 'All' ? true : device.status === statusFilter;
        const matchRole = roleFilter === 'All' ? true : device.role === roleFilter;
        return matchKeyword && matchStatus && matchRole;
    });

    if (sortColumn !== '') {
        filteredData.sort((a, b) => {
            let nilaiA = a[sortColumn].toString().toLowerCase();
            let nilaiB = b[sortColumn].toString().toLowerCase();
            if (nilaiA < nilaiB) return sortAscending ? -1 : 1;
            if (nilaiA > nilaiB) return sortAscending ? 1 : -1;
            return 0;
        });
    }

    renderPagination(filteredData);
}

function sortTable(columnName) {
    if (sortColumn === columnName) {
        sortAscending = !sortAscending;
    } else {
        sortColumn = columnName;
        sortAscending = true;
    }
    filterData();
}

document.getElementById('searchInput').addEventListener('input', filterData);
document.getElementById('filterStatus').addEventListener('change', filterData);
document.getElementById('filterRole').addEventListener('change', filterData);

// ==========================================
// 5. FUNGSI PAGINATION
// ==========================================
function renderPagination(filteredData) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (totalPages === 0) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const dataToDisplay = filteredData.slice(startIndex, endIndex);

    renderTable(dataToDisplay);

    const infoText = document.getElementById('paginationInfo');
    const startText = filteredData.length === 0 ? 0 : startIndex + 1;
    const endText = endIndex > filteredData.length ? filteredData.length : endIndex;
    
    infoText.innerHTML = `Menampilkan <span class="font-bold text-gray-800">${startText}</span> sampai <span class="font-bold text-gray-800">${endText}</span> dari <span class="font-bold text-gray-800">${filteredData.length}</span> perangkat`;

    const paginationContainer = document.getElementById('paginationButtons');
    paginationContainer.innerHTML = ''; 

    if (totalPages > 1) {
        paginationContainer.innerHTML += `
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-3 py-1.5 border rounded-lg text-sm font-semibold transition ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100'}">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage 
                ? 'bg-[#2a56f6] text-white border-[#2a56f6]' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200';
            
            paginationContainer.innerHTML += `
                <button onclick="changePage(${i})" class="px-3 py-1.5 border rounded-lg text-sm font-semibold transition w-9 h-9 flex justify-center items-center ${activeClass}">
                    ${i}
                </button>
            `;
        }

        paginationContainer.innerHTML += `
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-3 py-1.5 border rounded-lg text-sm font-semibold transition ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100'}">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        `;
    }
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    filterData();
}

// ==========================================
// 6. FUNGSI CRUD (CREATE, UPDATE, DELETE)
// ==========================================
function openModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.children[0].classList.remove('scale-95');
        modal.children[0].classList.add('scale-100');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.children[0].classList.remove('scale-100');
    modal.children[0].classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('modalDeviceName').value = '';
        document.getElementById('modalIpAddress').value = '';
        document.getElementById('modalRole').value = 'SERVER';
        document.getElementById('modalStatus').value = 'ONLINE';
    }, 200); 
}

function saveDevice() {
    const name = document.getElementById('modalDeviceName').value;
    const role = document.getElementById('modalRole').value;
    const ip = document.getElementById('modalIpAddress').value;
    const status = document.getElementById('modalStatus').value;

    if (!name || !ip) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Device Name dan IP Address tidak boleh kosong!' });
        return;
    }

    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(ip)) {
        Swal.fire({ icon: 'error', title: 'IP Address Tidak Valid!', text: 'Format harus berupa IPv4 yang benar (contoh: 192.168.1.100)' });
        return;
    }

    devicesData.push({ id: Date.now(), name: name, role: role, ip: ip, status: status });
    saveToLocalStorage(); 
    closeModal(); 
    filterData(); 
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Perangkat berhasil ditambahkan', showConfirmButton: false, timer: 3000 });
}

function openEditModal(idToEdit) {
    const device = devicesData.find(d => d.id === idToEdit);
    if (device) {
        document.getElementById('editModalId').value = device.id;
        document.getElementById('editModalDeviceName').value = device.name;
        document.getElementById('editModalRole').value = device.role;
        document.getElementById('editModalIpAddress').value = device.ip;
        document.getElementById('editModalStatus').value = device.status;

        const modal = document.getElementById('editDeviceModal');
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.children[0].classList.remove('scale-95');
            modal.children[0].classList.add('scale-100');
        }, 10);
    }
}

function closeEditModal() {
    const modal = document.getElementById('editDeviceModal');
    modal.children[0].classList.remove('scale-100');
    modal.children[0].classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 200); 
}

function updateDevice() {
    const id = parseInt(document.getElementById('editModalId').value);
    const newName = document.getElementById('editModalDeviceName').value;
    const newRole = document.getElementById('editModalRole').value;
    const newIp = document.getElementById('editModalIpAddress').value;
    const newStatus = document.getElementById('editModalStatus').value;

    if (!newName || !newIp) {
        Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Device Name dan IP Address tidak boleh kosong!' });
        return;
    }

    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(newIp)) {
        Swal.fire({ icon: 'error', title: 'IP Address Tidak Valid!', text: 'Format harus berupa IPv4 yang benar' });
        return;
    }

    const index = devicesData.findIndex(d => d.id === id);
    if (index !== -1) {
        devicesData[index].name = newName;
        devicesData[index].role = newRole;
        devicesData[index].ip = newIp;
        devicesData[index].status = newStatus;

        saveToLocalStorage(); 
        closeEditModal(); 
        filterData(); 
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data berhasil diperbarui', showConfirmButton: false, timer: 3000 });
    }
}

function deleteDevice(idToDelete) {
    Swal.fire({
        title: 'Apakah kamu yakin?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', 
        cancelButtonColor: '#9ca3af', 
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            devicesData = devicesData.filter(device => device.id !== idToDelete);
            saveToLocalStorage(); 
            filterData();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data berhasil dihapus', showConfirmButton: false, timer: 3000 });
        }
    });
}

// ==========================================
// 7. LAIN-LAIN (Export, Logout, Sidebar)
// ==========================================
function exportData() {
    const tabelData = document.querySelector('.bg-white.rounded-xl.border.shadow-sm.overflow-x-auto.w-full');
    if (!tabelData) { alert("Tabel data tidak ditemukan!"); return; }

    const tombolExport = document.querySelector('button.bg-\\[\\#f43f5e\\]'); 
    const teksAsli = tombolExport.innerHTML;
    tombolExport.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> DOWNLOADING...';
    
    const opsiPDF = {
        margin: 0.5, 
        filename: 'Hardware_Inventory_NetboxLite.pdf', 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2 }, 
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } 
    };

    html2pdf().set(opsiPDF).from(tabelData).save().then(() => {
        tombolExport.innerHTML = teksAsli;
    });
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
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// JALANKAN PROGRAM PERTAMA KALI
filterData();

// ==========================================
// 8. FITUR BACKUP & RESTORE DATA (JSON)
// ==========================================

// Fungsi untuk mengunduh data (Backup)
function backupData() {
    // 1. Ubah array data kita menjadi teks berformat JSON
    const dataStr = JSON.stringify(devicesData, null, 2);
    
    // 2. Buat file baru di memori browser (Blob)
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // 3. Buat link unduhan tersembunyi dan klik otomatis
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_NetboxLite_${new Date().getTime()}.json`; // Nama file unik berdasarkan waktu
    a.click();
    
    // 4. Bersihkan memori dan tampilkan notifikasi
    URL.revokeObjectURL(url);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File Backup berhasil diunduh', showConfirmButton: false, timer: 3000 });
}

// Fungsi untuk mengunggah dan membaca data (Restore)
function processRestore(event) {
    const file = event.target.files[0];
    if (!file) return; // Batal jika tidak ada file yang dipilih

    const reader = new FileReader(); // Alat JS untuk membaca isi file
    
    // Saat file selesai dibaca...
    reader.onload = function(e) {
        try {
            // Coba ubah teks dari file kembali menjadi array JavaScript
            const importedData = JSON.parse(e.target.result);
            
            // Validasi: pastikan isinya memang daftar (Array)
            if (Array.isArray(importedData)) {
                
                // Minta konfirmasi sebelum menimpa data lama
                Swal.fire({
                    title: 'Restore Data?',
                    text: "Data yang ada di tabel saat ini akan ditimpa dengan data dari file backup!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#2a56f6',
                    cancelButtonColor: '#f43f5e',
                    confirmButtonText: 'Ya, Restore!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        devicesData = importedData; // Timpa data lama dengan yang baru
                        saveToLocalStorage(); // Simpan permanen
                        filterData(); // Render ulang tabel
                        Swal.fire('Berhasil!', 'Data telah berhasil dikembalikan.', 'success');
                    }
                    // Reset input file agar bisa digunakan lagi
                    document.getElementById('restoreFile').value = '';
                });
                
            } else {
                throw new Error("Format tidak valid"); // Picu error jika isinya bukan array
            }
        } catch (error) {
            Swal.fire('Error', 'File backup tidak valid atau rusak!', 'error');
            document.getElementById('restoreFile').value = '';
        }
    };
    
    // Mulai membaca file sebagai Teks
    reader.readAsText(file);
}