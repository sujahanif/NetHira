// 1. PROTEKSI HALAMAN
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('Akses ditolak! Kamu harus login terlebih dahulu.');
    window.location.href = 'login.html';
}

function logout() {
    Swal.fire({
        title: 'Keluar Aplikasi?', text: "Sesi kamu akan diakhiri.", icon: 'question', showCancelButton: true,
        confirmButtonColor: '#2a56f6', cancelButtonColor: '#f43f5e', confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('isLoggedIn'); window.location.href = 'login.html';
        }
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('mobileOverlay').classList.toggle('hidden');
}

// 2. TAMPILKAN DATA SAAT INI
const savedCreds = JSON.parse(localStorage.getItem('netboxCreds')) || { 
    username: 'admin', 
    password: 'admin',
    fullname: 'Administrator'
};

document.getElementById('setFullname').value = savedCreds.fullname;
document.getElementById('setUsername').value = savedCreds.username;
document.getElementById('headerName').innerText = savedCreds.fullname;
document.getElementById('headerInitial').innerText = savedCreds.fullname.charAt(0).toUpperCase();

// 3. FUNGSI SIMPAN PENGATURAN
function saveSettings() {
    const newFullname = document.getElementById('setFullname').value;
    const newUsername = document.getElementById('setUsername').value;
    const newPassword = document.getElementById('setPassword').value;
    const confirmPassword = document.getElementById('setConfirmPassword').value;

    if (!newFullname || !newUsername || !newPassword) {
        Swal.fire('Oops!', 'Semua kolom harus diisi!', 'warning');
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire('Error!', 'Konfirmasi password tidak cocok!', 'error');
        return;
    }

    if (newPassword.length < 4) {
        Swal.fire('Oops!', 'Password minimal 4 karakter!', 'warning');
        return;
    }

    // Simpan data baru ke LocalStorage
    const newCreds = {
        username: newUsername,
        password: newPassword,
        fullname: newFullname
    };
    localStorage.setItem('netboxCreds', JSON.stringify(newCreds));

    Swal.fire({
        title: 'Berhasil!',
        text: 'Kredensial berhasil diubah. Silakan login ulang.',
        icon: 'success',
        confirmButtonColor: '#2a56f6'
    }).then(() => {
        // Paksa user untuk login ulang agar aman
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
}