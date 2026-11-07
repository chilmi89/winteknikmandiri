-- Tabel Kategori Layanan & Item Layanan CV Win Teknik Mandiri
-- Single Source of Truth untuk halaman /layanan, Produk Beranda, dan Tabel Harga.
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).

CREATE TABLE IF NOT EXISTS service_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10)  NOT NULL DEFAULT '',      -- Nomor urut visual: '01', '02', '03'
    name        VARCHAR(100) NOT NULL,                 -- Nama kategori (mis. 'Perawatan & Cuci AC')
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_service_categories_code ON service_categories (code, is_active);
CREATE INDEX IF NOT EXISTS idx_service_categories_deleted_at ON service_categories (deleted_at);

CREATE TABLE IF NOT EXISTS service_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id  UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL DEFAULT '',
    highlights   TEXT[]       NOT NULL DEFAULT '{}',
    price_prefix VARCHAR(50)  NOT NULL DEFAULT 'Mulai dari',
    price        VARCHAR(50)  NOT NULL DEFAULT '',
    unit         VARCHAR(50)  NOT NULL DEFAULT '/ unit',
    price_note   TEXT         NOT NULL DEFAULT '',
    image_url    TEXT         NOT NULL DEFAULT '',
    image_key    TEXT         NOT NULL DEFAULT '',
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_service_items_cat_order ON service_items (category_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_items_deleted_at ON service_items (deleted_at);

-- Seed awal kategori
INSERT INTO service_categories (id, code, name, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', '01', 'Perawatan & Cuci AC', TRUE),
    ('c2222222-2222-2222-2222-222222222222', '02', 'Instalasi & Relokasi', TRUE),
    ('c3333333-3333-3333-3333-333333333333', '03', 'Freon & Perbaikan', TRUE),
    ('c4444444-4444-4444-4444-444444444444', '04', 'Pengadaan Unit AC', TRUE),
    ('c5555555-5555-5555-5555-555555555555', '05', 'Ducting & Maintenance', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed awal item layanan
INSERT INTO service_items (category_id, title, description, highlights, price_prefix, price, unit, price_note, image_url, sort_order)
VALUES
    -- Kategori 01: Cuci AC
    ('c1111111-1111-1111-1111-111111111111', 'Cuci AC & Deep Cleaning Higienis', 'Bersih menyeluruh, bebas becek, garansi 7 hari.', ARRAY['Tanpa becek', 'Cek freon gratis', 'Garansi 7 hari'], 'Mulai dari', 'Rp 65.000', '/ unit', '1,5–2 PK Rp 85.000 · cassette / floor standing menyesuaikan.', '/images/ac-split-clean.jpg', 1),
    ('c1111111-1111-1111-1111-111111111111', 'Cuci AC Cassette & Floor Standing', 'Pembersihan evaporator empat arah hembusan dan jalur kondensat.', ARRAY['Pembersihan tuntas', 'Blower steril', 'Garansi 7 hari'], 'Mulai dari', 'Rp 150.000', '/ unit', 'Floor standing Rp 175.000 / unit.', '/images/ac-split-clean.jpg', 2),
    ('c1111111-1111-1111-1111-111111111111', 'Deep Cleaning Kimia & Desinfektan', 'Untuk unit berjamur, berbau, atau lama tidak diservis.', ARRAY['Pembersihan kerak', 'Anti bakteri', 'Higienis'], 'Tarif', 'Rp 125.000', '/ unit', 'Termasuk penyemprotan desinfektan coil.', '/images/ac-split-clean.jpg', 3),

    -- Kategori 02: Instalasi & Relokasi
    ('c2222222-2222-2222-2222-222222222222', 'Pemasangan AC Baru & Bekas (Standar Vakum)', 'Instalasi rapi dengan vakum dan flaring presisi tanpa retak.', ARRAY['SOP vakum', 'Pipa tembaga tebal', 'Garansi 30 hari'], 'Mulai dari', 'Rp 250.000', '/ unit', '1,5–2 PK Rp 350.000 · cassette / floor standing Rp 500.000.', '/images/ac-split-indoor.jpg', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Bongkar Pasang & Relokasi Unit AC', 'Pindahan AC aman dengan teknik simpan freon pump-down.', ARRAY['Simpan freon aman', 'Pasang ulang', 'Uji performa'], 'Mulai dari', 'Rp 330.000', '/ unit', 'Bongkar saja tanpa pasang Rp 150.000.', '/images/wtm-pemasangan.jpg', 2),
    ('c2222222-2222-2222-2222-222222222222', 'Pemasangan Jalur Pipa Tembaga Tambahan', 'Pipa tembaga tebal standar R32/R410A termasuk pembungkus isolasi.', ARRAY['Tembaga tebal', 'Insulasi rapi', 'Bebas kondensasi'], 'Tarif', 'Rp 75.000', '/ meter', 'Kabel dan pipa berkualitas SNI.', '/images/wtm-pemipaan.jpg', 3),

    -- Kategori 03: Freon & Perbaikan
    ('c3333333-3333-3333-3333-333333333333', 'Isi & Tambah Freon Murni R32 / R410A', 'Freon murni standar pabrikan dengan uji tekanan manifold gauge.', ARRAY['Uji tekanan manifold', 'Freon murni', 'Uji kebocoran'], 'Mulai dari', 'Rp 150.000', '/ unit', 'Tambah freon R22 Rp 125.000.', '/images/wtm-pemipaan.jpg', 1),
    ('c3333333-3333-3333-3333-333333333333', 'Perbaikan AC & Penggantian Sparepart Asli', 'Diagnosa kerusakan transparan, sparepart original, kompresor & modul PCB.', ARRAY['Diagnosa transparan', 'Sparepart original', 'Garansi 30 hari'], 'Biaya cek', 'Rp 75.000', '/ kunjungan', 'Gratis biaya cek bila lanjut perbaikan.', '/images/ac-technician.jpg', 2),

    -- Kategori 04: Pengadaan Unit AC
    ('c4444444-4444-4444-4444-444444444444', 'Pengadaan Unit AC Split Baru Bergaransi', 'Unit original bergaransi resmi pabrik, konsultasi BTU gratis.', ARRAY['100% original', 'Termasuk pipa', 'Garansi resmi'], 'Mulai dari', 'Rp 2.800.000', '/ unit', 'AC Split 0,5 PK s/d 2 PK semua merk.', '/images/ac-lifestyle.jpg', 1),
    ('c4444444-4444-4444-4444-444444444444', 'Pengadaan Unit AC Cassette & VRF Komersial', 'Perhitungan beban ruangan dan pemilihan unit kapasitas besar gedung.', ARRAY['Kapasitas besar', 'Desain jalur VRF', 'Penawaran resmi'], 'Penawaran', '', '/ proyek', 'Kapasitas dan merk menyesuaikan kebutuhan.', '/images/ac-lifestyle.jpg', 2),

    -- Kategori 05: Ducting & Maintenance
    ('c5555555-5555-5555-5555-555555555555', 'Fabrikasi & Instalasi Ducting BJLS / PU', 'Fabrikasi saluran udara presisi untuk gedung, mall, rumah sakit, dan pabrik.', ARRAY['BJLS & PU panel', 'Balancing udara', 'Pekerjaan rapi'], 'Penawaran', '', '/ titik', 'Berdasarkan gambar kerja atau site survei.', '/images/wtm-instalasi.jpg', 1),
    ('c5555555-5555-5555-5555-555555555555', 'Kontrak Maintenance Berkala Gedung', 'Jadwal rutin berkala, laporan teknis resmi, invoice & faktur pajak.', ARRAY['Jadwal fleksibel', 'Invoice & faktur', 'SLA respons cepat'], 'Mulai dari', 'Rp 75.000', '/ unit / bln', 'Bisa per bulan, per kuartal, atau tahunan.', '/images/ac-technician.jpg', 2)
ON CONFLICT DO NOTHING;
