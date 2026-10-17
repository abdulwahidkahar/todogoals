# Aplikasi To-Do List

## Deskripsi

Todogoals adalah aplikasi pencatatan tugas sederhana untuk membantu mengatur kegiatan sehari-hari. Dibangun dengan Laravel 13, React, TypeScript, Inertia, Tailwind CSS, dan MySQL dari XAMPP.

Aplikasi dapat langsung digunakan tanpa login. Tugas pengunjung tersimpan di browser (`localStorage`), sedangkan tugas pengguna yang sudah login tersimpan di database. Setelah login atau daftar, tugas tamu otomatis ditambahkan ke akun, termasuk tenggat dan status selesainya. Data tamu di browser dibersihkan setelah berhasil tersimpan; jika gagal, data tetap tersedia untuk dicoba kembali.

## Fitur

- Registrasi, login, logout, dan reset kata sandi.
- Tambah, ubah, dan hapus tugas.
- Tandai tugas selesai melalui checkbox.
- Pemindahan otomatis tugas tamu ke akun setelah login atau daftar.
- Tambahkan tenggat opsional saat mengubah tugas.
- Filter semua, belum selesai, dan selesai melalui menu **⋯**.
- Pilih beberapa tugas untuk dihapus sekaligus dengan konfirmasi.
- Tampilan minimalis dan responsif untuk desktop maupun ponsel.

## Struktur Folder

```text
todogoals/
├── app/
│   ├── Http/Controllers/  # Pengelolaan halaman dan aksi tugas
│   ├── Http/Requests/     # Validasi input
│   ├── Models/           # Model pengguna dan tugas
│   └── Policies/         # Hak akses tugas
├── database/migrations/  # Struktur tabel database
├── resources/js/
│   ├── components/       # Komponen antarmuka
│   └── pages/            # Halaman aplikasi
├── routes/web.php        # Rute aplikasi
└── tests/                # Pengujian
```

## Cara Menjalankan

Siapkan PHP 8.3+, Composer 2, Node.js 22.23+, dan XAMPP. Gunakan PHP CLI yang sesuai karena PHP 8.2 bawaan sebagian versi XAMPP belum mendukung Laravel 13.

1. Nyalakan **MySQL** di XAMPP dan buat database bernama `todogoals` melalui phpMyAdmin.
2. Buka terminal di folder proyek, lalu jalankan:

    ```sh
    composer install
    cp .env.example .env
    php artisan key:generate
    npm ci
    ```

3. Sesuaikan koneksi database di file `.env` dengan akun MySQL lokal:

    ```dotenv
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=todogoals
    DB_USERNAME=root
    DB_PASSWORD=
    ```

4. Jalankan migrasi, build antarmuka, dan server aplikasi:

    ```sh
    php artisan migrate
    npm run build
    php artisan serve
    ```

5. Buka [http://localhost:8000](http://localhost:8000).

Untuk mengembangkan antarmuka, jalankan `npm run dev` di terminal terpisah. Reset kata sandi pada konfigurasi pengembangan mengirim tautan ke `storage/logs/laravel.log`.
