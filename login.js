// 1. Mengambil elemen formulir dari HTML berdasarkan ID
const loginForm = document.getElementById('loginForm');

// 2. Menambahkan pendeteksi kejadian (Event Listener) ketika formulir dikirim
loginForm.addEventListener('submit', function(event) {
    
    // Mencegah browser melakukan refresh halaman secara otomatis (bawaan form HTML)
    event.preventDefault();

    // 3. Mengambil nilai yang diketik oleh pengguna
    const usernameValue = document.getElementById('username').value;
    const passwordValue = document.getElementById('password').value;

    // 4. Simulasi Pengecekan Akun
    // Dalam dunia nyata, bagian ini akan mengecek ke database.
    // Untuk saat ini, kita buat aturan: username "admin" dan password "admin".
    if (usernameValue === 'admin' && passwordValue === 'admin') {
        
        // Menampilkan pesan sukses sebentar
        alert('Login Berhasil! Mengalihkan ke Dashboard...');
        
        // MENGALIHKAN (Redirect) halaman ke index.html
        window.location.href = 'index.html';
        
    } else {
        // Jika salah ketik, tampilkan pesan error
        alert('Gagal! Username atau Password salah. (Petunjuk: gunakan "admin" untuk keduanya)');
    }
});