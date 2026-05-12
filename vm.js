let sortColumn = ''; 
let sortAscending = true; 
let currentPage = 1;
const rowsPerPage = 5; 

if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('Akses ditolak! Kamu harus login terlebih dahulu.');
    window.location.href = 'login.html';
}

// Menggunakan Key LocalStorage yang berbeda ('netboxVMData')
let vmData = JSON.parse(localStorage.getItem('netboxVMData')) || [];

function saveToLocalStorage() {
    localStorage.setItem('netboxVMData', JSON.stringify(vmData));
}

function renderTable(dataToRender) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    if(dataToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-gray-500">Tidak ada Virtual Machine yang ditemukan.</td></tr>`;
        return;
    }

    dataToRender.forEach((vm) => {
        const statusBadge = vm.status === 'ONLINE' 
            ? '<span class="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full border border-green-200">ONLINE</span>'
            : '<span class="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full border border-red-200">OFFLINE</span>';

        const osIcon = vm.os === 'Windows' ? 'fa-windows text-blue-500' : (vm.os === 'Ubuntu' ? 'fa-ubuntu text-orange-500' : 'fa-linux text-gray-700');

        const rowHTML = `
            <tr class="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition">
                <td class="py-4 px-6 font-bold text-gray-700 dark:text-gray-200">${vm.name}</td>
                <td class="py-4 px-6">
                    <div class="flex items-center gap-2">
                        <i class="fa-brands ${osIcon} text-lg"></i>
                        <span class="text-sm text-gray-600 dark:text-gray-300">${vm.os}</span>
                    </div>
                </td>
                <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400"><i class="fa-solid fa-server mr-1"></i> ${vm.host}</td>
                <td class="py-4 px-6 font-semibold text-[#2a56f6] dark:text-blue-400">${vm.ip}</td>
                <td class="py-4 px-6">${statusBadge}</td>
                <td class="py-4 px-6 flex gap-2">
                    <button onclick="openEditModal(${vm.id})" class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded transition"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteDevice(${vm.id})" class="text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-gray-700 p-2 rounded transition"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHTML;
    });
}

function filterData() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const osFilter = document.getElementById('filterOS').value;

    let filteredData = vmData.filter(vm => {
        const matchKeyword = vm.name.toLowerCase().includes(keyword) || vm.ip.includes(keyword) || vm.host.toLowerCase().includes(keyword);
        const matchStatus = statusFilter === 'All' ? true : vm.status === statusFilter;
        const matchOS = osFilter === 'All' ? true : vm.os === osFilter;
        return matchKeyword && matchStatus && matchOS;
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
    if (sortColumn === columnName) sortAscending = !sortAscending;
    else { sortColumn = columnName; sortAscending = true; }
    filterData();
}

document.getElementById('searchInput').addEventListener('input', filterData);
document.getElementById('filterStatus').addEventListener('change', filterData);
document.getElementById('filterOS').addEventListener('change', filterData);

function renderPagination(filteredData) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (totalPages === 0) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const dataToDisplay = filteredData.slice(startIndex, startIndex + rowsPerPage);
    renderTable(dataToDisplay);

    const infoText = document.getElementById('paginationInfo');
    const startText = filteredData.length === 0 ? 0 : startIndex + 1;
    const endText = startIndex + rowsPerPage > filteredData.length ? filteredData.length : startIndex + rowsPerPage;
    infoText.innerHTML = `Menampilkan <span class="font-bold text-gray-800">${startText}</span> sampai <span class="font-bold text-gray-800">${endText}</span> dari <span class="font-bold text-gray-800">${filteredData.length}</span> VM`;

    const paginationContainer = document.getElementById('paginationButtons');
    paginationContainer.innerHTML = ''; 

    if (totalPages > 1) {
        paginationContainer.innerHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-3 py-1.5 border rounded-lg text-sm font-semibold transition ${currentPage === 1 ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-600 hover:bg-gray-100'}"><i class="fa-solid fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'bg-[#2a56f6] text-white border-[#2a56f6]' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200';
            paginationContainer.innerHTML += `<button onclick="changePage(${i})" class="px-3 py-1.5 border rounded-lg text-sm font-semibold transition w-9 h-9 flex justify-center items-center ${activeClass}">${i}</button>`;
        }
        paginationContainer.innerHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-3 py-1.5 border rounded-lg text-sm font-semibold transition ${currentPage === totalPages ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-600 hover:bg-gray-100'}"><i class="fa-solid fa-chevron-right"></i></button>`;
    }
}

function changePage(pageNumber) { currentPage = pageNumber; filterData(); }

function openModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.children[0].classList.remove('scale-95'); modal.children[0].classList.add('scale-100'); }, 10);
}

function closeModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.children[0].classList.remove('scale-100'); modal.children[0].classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('modalName').value = '';
        document.getElementById('modalHost').value = '';
        document.getElementById('modalIpAddress').value = '';
        document.getElementById('modalOS').value = 'Ubuntu';
        document.getElementById('modalStatus').value = 'ONLINE';
    }, 200); 
}

function saveDevice() {
    const name = document.getElementById('modalName').value;
    const os = document.getElementById('modalOS').value;
    const host = document.getElementById('modalHost').value;
    const ip = document.getElementById('modalIpAddress').value;
    const status = document.getElementById('modalStatus').value;

    if (!name || !ip || !host) { Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Nama, Host, dan IP tidak boleh kosong!' }); return; }
    if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
        Swal.fire({ icon: 'error', title: 'IP Address Tidak Valid!', text: 'Gunakan format IPv4.' }); return;
    }

    vmData.push({ id: Date.now(), name: name, os: os, host: host, ip: ip, status: status });
    saveToLocalStorage(); closeModal(); filterData(); 
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'VM berhasil ditambahkan', showConfirmButton: false, timer: 3000 });
}

function openEditModal(idToEdit) {
    const vm = vmData.find(d => d.id === idToEdit);
    if (vm) {
        document.getElementById('editModalId').value = vm.id;
        document.getElementById('editModalName').value = vm.name;
        document.getElementById('editModalOS').value = vm.os;
        document.getElementById('editModalHost').value = vm.host;
        document.getElementById('editModalIpAddress').value = vm.ip;
        document.getElementById('editModalStatus').value = vm.status;

        const modal = document.getElementById('editDeviceModal');
        modal.classList.remove('hidden');
        setTimeout(() => { modal.children[0].classList.remove('scale-95'); modal.children[0].classList.add('scale-100'); }, 10);
    }
}

function closeEditModal() {
    const modal = document.getElementById('editDeviceModal');
    modal.children[0].classList.remove('scale-100'); modal.children[0].classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 200); 
}

function updateDevice() {
    const id = parseInt(document.getElementById('editModalId').value);
    const newName = document.getElementById('editModalName').value;
    const newOS = document.getElementById('editModalOS').value;
    const newHost = document.getElementById('editModalHost').value;
    const newIp = document.getElementById('editModalIpAddress').value;
    const newStatus = document.getElementById('editModalStatus').value;

    if (!newName || !newIp || !newHost) { Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Form tidak boleh ada yang kosong!' }); return; }
    if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newIp)) {
        Swal.fire({ icon: 'error', title: 'IP Tidak Valid!'}); return;
    }

    const index = vmData.findIndex(d => d.id === id);
    if (index !== -1) {
        vmData[index] = { id: id, name: newName, os: newOS, host: newHost, ip: newIp, status: newStatus };
        saveToLocalStorage(); closeEditModal(); filterData(); 
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'VM diperbarui', showConfirmButton: false, timer: 3000 });
    }
}

function deleteDevice(idToDelete) {
    Swal.fire({
        title: 'Hapus VM?', text: "Tindakan ini permanen!", icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#d33', cancelButtonColor: '#9ca3af', confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            vmData = vmData.filter(vm => vm.id !== idToDelete);
            saveToLocalStorage(); filterData();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'VM dihapus', showConfirmButton: false, timer: 3000 });
        }
    });
}

function exportData() {
    const tabelData = document.querySelector('.bg-white.rounded-xl.border.shadow-sm.overflow-x-auto.w-full');
    html2pdf().set({ margin: 0.5, filename: 'VM_Inventory.pdf', html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape' } }).from(tabelData).save();
}

function backupData() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(vmData, null, 2)], { type: "application/json" }));
    a.download = `Backup_VM_${new Date().getTime()}.json`; a.click();
}

function processRestore(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                Swal.fire({ title: 'Restore Data VM?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya' }).then((result) => {
                    if (result.isConfirmed) { vmData = importedData; saveToLocalStorage(); filterData(); Swal.fire('Berhasil!', '', 'success'); }
                    document.getElementById('restoreFile').value = '';
                });
            } else throw new Error();
        } catch (error) { Swal.fire('Error', 'File backup tidak valid!', 'error'); document.getElementById('restoreFile').value = ''; }
    };
    reader.readAsText(file);
}

function logout() {
    sessionStorage.removeItem('isLoggedIn'); window.location.href = 'login.html';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('mobileOverlay').classList.toggle('hidden');
}

filterData();