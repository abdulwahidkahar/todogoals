<?php

return [
    'timezone' => ':attribute tidak valid. Gunakan nama seperti Asia/Jakarta.',
    'required' => ':attribute wajib diisi.',
    'string' => ':attribute harus berupa teks.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'unique' => ':attribute sudah digunakan.',
    'confirmed' => 'Konfirmasi :attribute tidak sesuai.',
    'current_password' => 'Kata sandi saat ini tidak sesuai.',
    'max' => ['string' => ':attribute maksimal :max karakter.', 'numeric' => ':attribute maksimal :max.'],
    'min' => ['string' => ':attribute minimal :min karakter.', 'numeric' => ':attribute minimal :min.'],
    'date_format' => 'Format :attribute tidak valid.',
    'before_or_equal' => ':attribute tidak boleh setelah :date.',
    'boolean' => ':attribute harus berupa pilihan yang valid.',
    'integer' => ':attribute harus berupa bilangan bulat.',
    'in' => 'Pilihan :attribute tidak valid.',
    'exists' => ':attribute tidak ditemukan atau tidak dapat digunakan.',
    'password' => [
        'letters' => ':attribute harus mengandung huruf.',
        'mixed' => ':attribute harus mengandung huruf besar dan kecil.',
        'numbers' => ':attribute harus mengandung angka.',
        'symbols' => ':attribute harus mengandung simbol.',
        'uncompromised' => ':attribute pernah ditemukan dalam kebocoran data. Gunakan kata sandi lain.',
    ],
    'attributes' => ['name' => 'Nama', 'email' => 'Alamat email', 'password' => 'Kata sandi', 'current_password' => 'Kata sandi saat ini', 'title' => 'Judul', 'description' => 'Deskripsi', 'filter' => 'Filter', 'date' => 'Tanggal', 'timezone' => 'Zona waktu'],
];
