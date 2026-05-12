const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const usernameValue = document.getElementById('username').value;
    const passwordValue = document.getElementById('password').value;

    // Ambil kredensial dari memori browser, atau gunakan default admin/admin
    const savedCreds = JSON.parse(localStorage.getItem('netboxCreds')) || { 
        username: 'admin', 
        password: 'admin',
        fullname: 'Administrator'
    };

    // Cocokkan inputan dengan data yang tersimpan
    if (usernameValue === savedCreds.username && passwordValue === savedCreds.password) {
        sessionStorage.setItem('isLoggedIn', 'true');
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Mengalihkan ke Dashboard...',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = 'dashboard.html';
        });
        
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Username atau Password salah!',
            confirmButtonColor: '#2a56f6'
        });
    }
});