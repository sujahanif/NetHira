// Fungsi untuk mengganti tema dan menyimpan ke Local Storage
function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    
    if (html.classList.contains('dark')) {
        localStorage.setItem('netboxTheme', 'dark');
    } else {
        localStorage.setItem('netboxTheme', 'light');
    }
}

// Cek tema apa yang terakhir dipakai pengguna saat membuka web
if (localStorage.getItem('netboxTheme') === 'dark') {
    document.documentElement.classList.add('dark');
}