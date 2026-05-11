// 1. Data Base Sementara (Array)
let devicesData = [
    { id: 1, name: 'huawei', role: 'SERVER', ip: '10.100.1.20', status: 'ONLINE' },
    { id: 2, name: 'cisco-core', role: 'SWITCH', ip: '10.100.1.1', status: 'ONLINE' },
    { id: 3, name: 'mikrotik-gw', role: 'ROUTER', ip: '192.168.1.1', status: 'OFFLINE' }
];

// 2. Fungsi untuk menampilkan data ke tabel
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
            <tr class="hover:bg-blue-50/50 transition">
                <td class="py-4 px-6 font-bold text-gray-700">${device.name}</td>
                <td class="py-4 px-6">
                    <span class="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">${device.role}</span>
                </td>
                <td class="py-4 px-6 font-semibold text-[#2a56f6]">${device.ip}</td>
                <td class="py-4 px-6">${statusBadge}</td>
                <td class="py-4 px-6 text-gray-400">
                    <button onclick="deleteDevice(${device.id})" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHTML;
    });
}

// 3. Fungsi Filter dan Pencarian
function filterData() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const roleFilter = document.getElementById('filterRole').value;

    const filteredData = devicesData.filter(device => {
        const matchKeyword = device.name.toLowerCase().includes(keyword) || device.ip.includes(keyword);
        const matchStatus = statusFilter === 'All' ? true : device.status === statusFilter;
        const matchRole = roleFilter === 'All' ? true : device.role === roleFilter;

        return matchKeyword && matchStatus && matchRole;
    });
    renderTable(filteredData);
}

// 4. Mendaftarkan pendeteksi interaksi (Event Listener)
document.getElementById('searchInput').addEventListener('input', filterData);
document.getElementById('filterStatus').addEventListener('change', filterData);
document.getElementById('filterRole').addEventListener('change', filterData);

// 5. Fungsi untuk membuka dan menutup Modal
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

// 6. Fungsi menyimpan perangkat baru
function saveDevice() {
    const name = document.getElementById('modalDeviceName').value;
    const role = document.getElementById('modalRole').value;
    const ip = document.getElementById('modalIpAddress').value;
    const status = document.getElementById('modalStatus').value;

    if (!name || !ip) {
        alert("Device Name dan IP Address tidak boleh kosong!");
        return;
    }

    devicesData.push({
        id: Date.now(),
        name: name,
        role: role,
        ip: ip,
        status: status
    });

    closeModal(); 
    filterData(); 
}

// 7. Fungsi menghapus perangkat
function deleteDevice(idToDelete) {
    const isConfirm = confirm("Apakah kamu yakin ingin menghapus perangkat ini?");
    if (isConfirm) {
        devicesData = devicesData.filter(device => device.id !== idToDelete);
        filterData();
    }
}

// 8. Fungsi Export PDF (Simulasi)
function exportData() {
    alert("Fitur Export PDF memerlukan library tambahan (seperti jsPDF). Saat ini simulasi berhasil diklik!");
}

// 9. Jalankan fungsi render saat pertama kali dimuat
renderTable(devicesData);