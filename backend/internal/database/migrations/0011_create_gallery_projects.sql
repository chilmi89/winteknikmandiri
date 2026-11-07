-- Tabel Galeri Proyek & Portofolio Dokumentasi Pekerjaan Lapangan CV Win Teknik Mandiri.
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).
-- Kategori bersifat dinamis/bebas diinput oleh admin.

CREATE TABLE IF NOT EXISTS gallery_projects (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          VARCHAR(200) NOT NULL,
    category       VARCHAR(100) NOT NULL,
    client         VARCHAR(150) NOT NULL DEFAULT '',
    scope          VARCHAR(200) NOT NULL DEFAULT '',
    location       VARCHAR(150) NOT NULL DEFAULT '',
    image_url      TEXT         NOT NULL DEFAULT '',
    image_key      TEXT         NOT NULL DEFAULT '',
    sort_order     INTEGER      NOT NULL DEFAULT 0,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

-- Indeks performa & filter
CREATE INDEX IF NOT EXISTS idx_gallery_projects_active_category ON gallery_projects (is_active, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_projects_deleted_at ON gallery_projects (deleted_at);

-- Seed awal dari katalog 18 proyek dokumentasi
INSERT INTO gallery_projects (title, category, client, scope, location, image_url, sort_order)
SELECT seed.title, seed.category, seed.client, seed.scope, seed.location, seed.image_url, seed.sort_order
FROM (
    VALUES
        ('Instalasi AHU Mall Galeria Bali', 'Mall & Retail', 'Mall Galeria Bali', 'Air Handling Unit & Ducting', 'Kuta, Bali', '/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall.jpeg', 1),
        ('Supply & Instalasi AC SMK Budi Utomo', 'Sekolah & Fasilitas', 'SMK Budi Utomo', 'Multi-Split Ruang Belajar', 'Gading Mangu, Jombang', '/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu.jpeg', 2),
        ('Pabrikasi Pipa Refrigerant PT Growth Asia', 'Industri & Pabrik', 'PT Growth Asia', 'Pipa Refrigerant & Fitting', 'Pasuruan, Jawa Timur', '/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.17.jpeg', 3),
        ('Instalasi Mesin Splitduct 20 PK Pondok Wali Barokah', 'Sekolah & Fasilitas', 'Pondok Wali Barokah', 'Splitduct 20 PK Mitsubishi', 'Kota Kediri', '/gallery/Proyek%20Pondok%20Wali%20Barokah/Instalasi%20mesin%20splitduct%2020%20PK%20Pondok%20Wali%20Barokah.jpeg', 4),
        ('Pemasangan Unit AC Store Nike Mall Puri Indah', 'Mall & Retail', 'Nike Store', 'Instalasi AC Tenant Retail', 'Jakarta Barat', '/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2009.10.49.jpeg', 5),
        ('Instalasi Jaringan AC Payless Centre Point Mall', 'Mall & Retail', 'Payless Shoesource', 'Central Ducting & Cassette', 'Medan, Sumatera Utara', '/gallery/Proyek%20Payless%20Centre%20Point%20Medan/WhatsApp%20Image%202026-10-24%20at%2009.05.32.jpeg', 6),
        ('Persiapan & Pemasangan Outdoor Unit DMC', 'Komersial & HVAC', 'Pondok Wali Barokah', 'Outdoor DMC Multi-Unit', 'Kota Kediri', '/gallery/Proyek%20Pondok%20Wali%20Barokah/Persiapan%20instalasi%20outdoor%20DMC%20pondok%20Wali%20Barokah.jpeg', 7),
        ('Fabrikasi & Penataan Saluran AHU Galeria Bali', 'Mall & Retail', 'Mall Galeria Bali', 'Ducting BJLS & Insulasi', 'Kuta, Bali', '/gallery/Proyek%20Galeria%20Bali%20Mall/Pemasangan%20AHU%20galeria%20Bali%20Mall.jpeg', 8),
        ('Pemasangan Jalur Pipa Refrigerant Tembaga Tebal', 'Industri & Pabrik', 'PT Growth Asia', 'Pipa Tembaga & Pengelasan Perak', 'Pasuruan, Jawa Timur', '/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.18.jpeg', 9),
        ('Pemasangan Ducting Utama Tenant Nike Puri Indah', 'Mall & Retail', 'Nike Store', 'Supply Air & Return Ducting', 'Jakarta Barat', '/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2009.10.50.jpeg', 10),
        ('Instalasi Outdoor Unit Multi-Split SMK Budi Utomo', 'Sekolah & Fasilitas', 'SMK Budi Utomo', 'Outdoor Bracket & Jalur Kabel', 'Gading Mangu, Jombang', '/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Pemasangan%20outdoor%20SMK%20Budi%20Utomo%20Gading%20Mangu.jpeg', 11),
        ('Perapian Jalur Pipa & Kabel AC Payless Medan', 'Mall & Retail', 'Payless Shoesource', 'Tray Kabel & Insulasi Pipa', 'Medan, Sumatera Utara', '/gallery/Proyek%20Payless%20Centre%20Point%20Medan/WhatsApp%20Image%202026-10-24%20at%2009.05.32%20(1).jpeg', 12),
        ('Pemasangan Unit Indoor DMC Wali Barokah', 'Komersial & HVAC', 'Pondok Wali Barokah', 'Indoor Hanging & Kondensat', 'Kota Kediri', '/gallery/Proyek%20Pondok%20Wali%20Barokah/Pemasangan%20indoor%20DMC%20pondok%20Wali%20Barokah.jpeg', 13),
        ('Pengelasan Header & Cabang Pipa PT Growth Asia', 'Industri & Pabrik', 'PT Growth Asia', 'Brazing Header Refrigerant', 'Pasuruan, Jawa Timur', '/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.19.jpeg', 14),
        ('Penataan Diffuser & Grill Udara Mall Galeria', 'Komersial & HVAC', 'Mall Galeria Bali', 'Linear Slot Diffuser', 'Kuta, Bali', '/gallery/Proyek%20Galeria%20Bali%20Mall/Perapian%20AHU%20galeria%20Bali%20Mall.jpeg', 15),
        ('Pemasangan Jalur Pipa Outdoor Gedung Belajar', 'Sekolah & Fasilitas', 'SMK Budi Utomo', 'Pemipaan R32 & Uji Tekan', 'Gading Mangu, Jombang', '/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Instalasi%20outdoor%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu.jpeg', 16),
        ('Testing & Balancing Aliran Udara Tenant Nike', 'Komersial & HVAC', 'Nike Store', 'Uji CFM & Anemometer', 'Jakarta Barat', '/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2009.10.51.jpeg', 17),
        ('Inspeksi Akhir & Vakum Mesin Pondok Wali Barokah', 'Sekolah & Fasilitas', 'Pondok Wali Barokah', 'SOP Vakum 2-Stage & Serah Terima', 'Kota Kediri', '/gallery/Proyek%20Pondok%20Wali%20Barokah/Perapian%20pipa%20DMC%20pondok%20Wali%20Barokah.jpeg', 18)
) AS seed(title, category, client, scope, location, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_projects LIMIT 1);
