# ROADMAP & TASK LIST PENGEMBANGAN WEBSITE CV WIN TEKNIK MANDIRI
*Berdasarkan Dokumen Spesifikasi: WEBSITE NEED FIX.docx*

---

## 🎨 1. IDENTITAS & ATURAN DESAIN (BRAND SPECIFICATION)
- **Nama Resmi Badan Usaha**: CV WIN TEKNIK MANDIRI
- **Warna Primer**: Ice Blue (`#8ACFF8` / `#DCF1FD`)
- **Warna Sekunder / Aksen**: Crimson Red (`#A82020`)
- **Warna Teks & Elemen Gelap**: Dark Navy (`#0A2540`)
- **Konsep Tampilan**: Zigzag Konsisten (*Putih ⟷ Biru Muda Ice Blue*)
- **Tagline Resmi**: *"Fresh Air, Fresh Mind, Your AC Solutions"*
- **Hotline WhatsApp**: `+62 812-1662-2840` (`https://wa.me/6281216622840?s=t`)
- **Email Resmi**: `cswinteknikmandiri@gmail.com`
- **Google Maps**: [Buka Lokasi Google Maps](https://maps.app.goo.gl/W2qiypTupnmwVVay7)
- **Jam Operasional Resmi**:
  - Senin – Jumat: 08.00 – 16.00 WIB
  - Sabtu: 08.00 – 12.00 WIB
  - Minggu & Tanggal Merah: **LIBUR**
- **Media Sosial Resmi**:
  - Instagram: `@winteknikmandiri` ([Link Profil](https://www.instagram.com/winteknikmandiri?xtok=MWcxbWdteXR5YTNuMQ==))
  - TikTok: `@winteknikmandiri` ([Link Profil](https://www.tiktok.com/@winteknikmandiri?_r=1&_t=ZS-9AmW2KKxbPB))
  - Facebook: `Win Teknik Mandiri` ([Link Profil](https://www.facebook.com/share/1By3XGtpVT/))

---

## 🗺️ 2. PEMETAAN HALAMAN (SITEMAP & STRUCTURE)

```
CV WIN TEKNIK MANDIRI
│
├── 1. Beranda (Home - `/`)
│   ├── Header: Logo CV WTM & Navigasi Utama
│   ├── Banner Utama (Hero): Video/Foto, Tagline, Tombol WA Konsultasi Gratis
│   ├── Stats Bar (Statistik Ringkas): 364 Proyek Selesai, 36 Berjalan, 20 Mitra, Sejak 2014
│   ├── Ringkasan Layanan: 5 Ikon & Judul Jasa Utama + Tombol ke Detail Layanan
│   ├── Cuplikan Tentang Kami: Profil Singkat & Badge Legalitas Kemenkumham
│   ├── Cuplikan Galeri Proyek: Dokumentasi Pekerjaan Unggulan
│   ├── Testimoni Klien: Ulasan Pelanggan Puas
│   ├── Banner CTA: Booking Cepat / Konsultasi WhatsApp
│   └── Footer Resmi: Profil, Jam Operasional, Sosmed, Alamat
│
├── 2. Tentang Kami (About Us - `/tentang-kami`)
│   ├── Section 1: Our Journey (Perjalanan sejak 2014)
│   ├── Section 2: Visi & Misi (Layanan Prima, Solusi Efisien, Teknisi Profesional, Kemitraan)
│   ├── Section 3: Legalitas Usaha (AHU Kemenkumham 2026, NIB, NPWP, KBLI 43224 & 71109)
│   └── Section 4: Our Team (Dokumentasi & Profil Tim Teknisi & Manajemen)
│
├── 3. Layanan (Services - `/layanan`)
│   ├── Layanan 1: Supply dan Pengadaan AC Segala Merk AC
│   ├── Layanan 2: Instalasi Jaringan AC Konvensional dan VRF
│   ├── Layanan 3: Maintenance dan Services Segala Merk AC
│   ├── Layanan 4: Supply dan Pengadaan Ducting AC
│   └── Layanan 5: Instalasi Ducting AC (Sekolah, RS, Kantor, Mall, Industri)
│       *(Catatan Wajib: Tiap layanan memiliki tombol "Pesan Layanan / Tanya Dulu" langsung ke WhatsApp)*
│
├── 4. Galeri Proyek (Portfolio - `/galeri`)
│   ├── Banner Rekam Jejak Proyek: 364 Proyek Kami, 36 Proyek Berjalan, 20 Mitra
│   ├── Filter Kategori Proyek: Semua, Komersial/Kantor, Rumah Sakit/Sekolah, Mall/Tenant, Industri
│   └── Grid Dokumentasi Proyek: Foto Dokumentasi + Keterangan Nama Proyek & Lokasi
│
└── 5. Hubungi Kami (Contact - `/kontak`)
    ├── Embed Peta Interaktif Google Maps
    ├── Kontak Resmi: WhatsApp (+62 812-1662-2840) & Email (cswinteknikmandiri@gmail.com)
    ├── Jadwal Jam Operasional Resmi
    ├── Tautan Media Sosial Aktif (Instagram, TikTok, Facebook)
    └── Form Inquiry / Pesan Cepat Terintegrasi WhatsApp
```

---

## 📋 3. CHECKLIST TASK IMPLEMENTASI

### 🎯 FASE 1: SINKRONISASI IDENTITAS GLOBAL & KOMPONEN
- [ ] **Task 1.1**: Perbarui informasi global di `Navbar` & `Footer`:
  - Ganti nomor telepon lama (`0812-9000-8789`) ke nomor resmi baru: `+62 812-1662-2840` (`https://wa.me/6281216622840?s=t`).
  - Tambahkan link email: `cswinteknikmandiri@gmail.com`.
  - Tambahkan link media sosial resmi (Instagram, TikTok, Facebook).
  - Perbarui jam operasional resmi (Senin-Jumat 08.00-16.00, Sabtu 08.00-12.00, Minggu/Libur Libur).
  - Perbarui navigasi menu: `HOME`, `LAYANAN`, `TENTANG KAMI`, `GALERI`, `KONTAK`.
- [ ] **Task 1.2**: Pastikan skema warna zigzag konsisten (Putih ⟷ Biru Muda `#8ACFF8`/30) pada setiap section.

---

### 🏠 FASE 2: PEMBARUAN HALAMAN BERANDA (`app/page.tsx`)
- [ ] **Task 2.1**: Update Hero Section:
  - Terapkan tagline resmi: *"Fresh Air, Fresh Mind, Your AC Solutions"*.
  - Arahkan tombol konsultasi gratis ke WhatsApp baru (`0812-1662-2840`).
- [ ] **Task 2.2**: Update Stats Bar dengan angka dari dokumen:
  - 364+ Proyek Diselesaikan
  - 36+ Proyek Berjalan
  - 20+ Mitra Perusahaan
  - Berdiri Sejak 2014
- [ ] **Task 2.3**: Update Section Layanan Utama di Beranda:
  - Ganti 6 layanan retail lama menjadi 5 pilar layanan B2B/B2C resmi sesuai dokumen:
    1. Supply & Pengadaan AC Segala Merk
    2. Instalasi Jaringan AC Konvensional & VRF
    3. Maintenance & Services Segala Merk AC
    4. Supply & Pengadaan Ducting AC
    5. Instalasi Ducting AC di Gedung Sekolah, RS, Perkantoran, Mall & Industri
- [ ] **Task 2.4**: Tambahkan Section Testimoni Klien di Beranda.
- [ ] **Task 2.5**: Tambahkan Cuplikan Galeri Proyek & Legalitas Perusahaan.

---

### 🏢 FASE 3: PEMBUATAN HALAMAN TENTANG KAMI (`app/tentang-kami/page.tsx`)
- [ ] **Task 3.1**: Buat route & page baru di `app/tentang-kami/page.tsx`.
- [ ] **Task 3.2**: Bagian *Our Journey*:
  - Deskripsi sejarah berdiri tahun 2014 sebagai kontraktor pendingin ruangan terpercaya untuk hunian, komersial, dan industri.
- [ ] **Task 3.3**: Bagian *Visi & Misi*:
  - Visi perusahaan.
  - 4 Misi: Layanan Prima, Solusi Efisien, Teknisi Profesional, Kemitraan Berkelanjutan.
- [ ] **Task 3.4**: Bagian *Legalitas Usaha*:
  - Tampilkan tabel/badge legalitas lengkap:
    - Nama: CV WIN TEKNIK MANDIRI
    - Pengesahan Kemenkumham: AHU-0066756-AH.01.14 Tahun 2026
    - NIB: 1310260079829
    - NPWP: 1000000011517477
    - KBLI Utama: 43224 & 71109
- [ ] **Task 3.5**: Bagian *Our Team*:
  - Dokumentasi tim teknisi bersertifikasi dan manajemen.

---

### 🛠️ FASE 4: PEMBARUAN HALAMAN LAYANAN (`app/layanan/page.tsx`)
- [ ] **Task 4.1**: Sinkronisasi konten 5 layanan kontraktor AC & HVAC:
  1. Supply dan Pengadaan AC Segala Merk AC (Split, Cassette, Floor Standing, VRF/VRV).
  2. Instalasi Jaringan AC Konvensional dan VRF (Standar pemipaan & vakum mesin).
  3. Maintenance dan Services Segala Merk AC (Pembersihan kimia, perbaikan modul PCB, kompresor).
  4. Supply dan Pengadaan Ducting AC (Fabrikasi BJLS, PU duct, spiral duct).
  5. Instalasi Ducting AC di semua gedung sekolahan, rumah sakit, perkantoran, tenant mall, dan industri.
- [ ] **Task 4.2**: Tambahkan tombol CTA di setiap layanan:
  - Tombol **"Pesan Layanan / Tanya Dulu"** yang langsung membuka WhatsApp dengan pesan pre-filled spesifik layanan terkait.

---

### 🖼️ FASE 5: PEMBUATAN HALAMAN GALERI PROYEK (`app/galeri/page.tsx`)
- [ ] **Task 5.1**: Buat route & page baru di `app/galeri/page.tsx`.
- [ ] **Task 5.2**: Buat Banner Rekam Jejak Proyek:
  - Tampilkan kartu statistik: Proyek Kami (364), Proyek Berjalan (36), Mitra Perusahaan (20).
- [ ] **Task 5.3**: Buat Galeri Dokumentasi Proyek:
  - Tab Filter kategori: Semua, Sekolah & Universitas, Rumah Sakit, Perkantoran & Gedung, Mall & Retail, Residensial / Industri.
  - Kartu foto proyek dilengkapi keterangan nama pekerjaan & lokasi proyek.

---

### 📞 FASE 6: PEMBUATAN HALAMAN KONTAK (`app/kontak/page.tsx`)
- [ ] **Task 6.1**: Buat route & page baru di `app/kontak/page.tsx`.
- [ ] **Task 6.2**: Embed Google Maps Interaktif resmi (`https://maps.app.goo.gl/W2qiypTupnmwVVay7`).
- [ ] **Task 6.3**: Kartu Kontak & Alamat:
  - Workshop: Dusun Selomanen, Purwokerto, Ngadiluwih, Kediri.
  - WhatsApp: `+62 812-1662-2840`.
  - Email: `cswinteknikmandiri@gmail.com`.
- [ ] **Task 6.4**: Jadwal Jam Kerja Resmi (Senin-Jumat 08-16, Sabtu 08-12, Minggu Libur).
- [ ] **Task 6.5**: Tautan Media Sosial Aktif (Instagram, TikTok, Facebook).
- [ ] **Task 6.6**: Form Kirim Pesan Cepat ke WhatsApp.

---

### 🚀 FASE 7: TESTING, POLISHING & VALIDASI
- [ ] **Task 7.1**: Pastikan seluruh link WhatsApp mengarah ke `0812-1662-2840`.
- [ ] **Task 7.2**: Uji responsivitas mobile & desktop di semua halaman.
- [ ] **Task 7.3**: Periksa konsistensi palet warna (Zigzag: Putih vs Biru Muda `#8ACFF8`/30).
- [ ] **Task 7.4**: Verifikasi build Next.js (`npm run build`) berjalan bersih tanpa error.
