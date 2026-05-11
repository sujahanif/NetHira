const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const usernameValue = document.getElementById('username').value;
    const passwordValue = document.getElementById('password').value;

    if (usernameValue === 'admin' && passwordValue === 'admin') {
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // [KODE BARU] SweetAlert Sukses Login
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Mengalihkan ke Dashboard...',
            showConfirmButton: false, // Sembunyikan tombol OK
            timer: 1500 // Hilang otomatis dalam 1,5 detik
        }).then(() => {
            window.location.href = 'dashboard.html';
        });
        
    } else {
        // [KODE BARU] SweetAlert Gagal Login
        Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Username atau Password salah!',
            confirmButtonColor: '#2a56f6'
        });
    }
});