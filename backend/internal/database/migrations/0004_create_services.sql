-- Tabel Layanan (Services) yang tampil di landing page /layanan dan dashboard admin.
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).

CREATE TABLE IF NOT EXISTS services (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         VARCHAR(120) NOT NULL,
    title        VARCHAR(200) NOT NULL,
    category     VARCHAR(100) NOT NULL DEFAULT '',
    price_prefix VARCHAR(50)  NOT NULL DEFAULT 'Mulai dari',
    price        VARCHAR(50),
    unit         VARCHAR(50)  NOT NULL DEFAULT '/ unit',
    price_note   TEXT         NOT NULL DEFAULT '',
    image_url    TEXT         NOT NULL DEFAULT '',
    image_key    TEXT         NOT NULL DEFAULT '', -- MinIO Object Key (services/...)
    summary      TEXT         NOT NULL DEFAULT '',
    highlights   TEXT[]       NOT NULL DEFAULT '{}',
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

-- Indeks performa & integritas
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug ON services (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_active_order ON services (is_active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services (category);
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services (deleted_at);

-- Seed data katalog layanan awal jika tabel masih kosong
INSERT INTO services (
    slug,
    title,
    category,
    price_prefix,
    price,
    unit,
    price_note,
    image_url,
    summary,
    highlights,
    sort_order
)
SELECT
    seed.slug,
    seed.title,
    seed.category,
    seed.price_prefix,
    seed.price,
    seed.unit,
    seed.price_note,
    seed.image_url,
    seed.summary,
    seed.highlights,
    seed.sort_order
FROM (VALUES
    (
        'cuci-ac',
        'Cuci AC & Deep Cleaning Higienis',
        'Perawatan Rutin',
        'Mulai dari',
        'Rp 65.000',
        '/ unit',
        '1,5–2 PK Rp 85.000 · cassette / floor standing menyesuaikan.',
        '/images/ac-split-clean.jpg',
        'Bersih menyeluruh, bebas becek, garansi 7 hari.',
        ARRAY['Tanpa becek', 'Cek freon gratis', 'Garansi 7 hari'],
        1
    ),
    (
        'pemasangan-ac',
        'Pemasangan AC Baru & Bekas (Standar Vakum)',
        'Instalasi',
        'Mulai dari',
        'Rp 250.000',
        '/ unit',
        '1,5–2 PK Rp 350.000 · cassette / floor standing Rp 500.000.',
        '/images/ac-split-indoor.jpg',
        'Instalasi rapi dengan vakum dan flaring presisi.',
        ARRAY['SOP vakum', 'Pipa tembaga tebal', 'Garansi 30 hari'],
        2
    ),
    (
        'bongkar-pasang',
        'Bongkar Pasang & Relokasi Unit AC',
        'Bongkar Pasang',
        'Mulai dari',
        'Rp 330.000',
        '/ unit',
        'Bongkar saja tanpa pasang Rp 150.000.',
        '/images/wtm-pemasangan.jpg',
        'Pindahan AC aman dengan teknik simpan freon.',
        ARRAY['Simpan freon', 'Pasang ulang', 'Uji performa'],
        3
    ),
    (
        'perbaikan-kerusakan',
        'Perbaikan AC & Penggantian Sparepart Asli',
        'Reparasi',
        'Biaya cek',
        'Rp 75.000',
        '/ kunjungan',
        'Gratis bila lanjut perbaikan.',
        '/images/ac-technician.jpg',
        'Diagnosa transparan, sparepart asli, garansi 30 hari.',
        ARRAY['Diagnosa transparan', 'Sparepart original', 'Garansi 30 hari'],
        4
    ),
    (
        'tambah-freon',
        'Isi & Tambah Freon R32 / R410A / R22',
        'Pengisian Freon',
        'Mulai dari',
        'Rp 150.000',
        '/ unit',
        'Tergantung tipe refrigeran dan kapasitas PK unit.',
        '/images/wtm-pemipaan.jpg',
        'Freon murni standar pabrikan dengan uji tekanan manifold.',
        ARRAY['Uji tekanan manifold', 'Freon murni', 'Garansi 30 hari'],
        5
    ),
    (
        'kontrak-maintenance',
        'Kontrak Maintenance AC Gedung & Industri',
        'Komersial & Industri',
        'Penawaran',
        'Kustom',
        '/ kontrak',
        'Bisa per bulan, per kuartal, atau tahunan.',
        '/images/ac-lifestyle.jpg',
        'Perawatan berkala terjadwal dengan laporan teknis resmi.',
        ARRAY['Jadwal fleksibel', 'Invoice & faktur', 'SLA respons cepat'],
        6
    )
) AS seed(slug, title, category, price_prefix, price, unit, price_note, image_url, summary, highlights, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);
