-- Tabel Visi & Misi Perusahaan (Tampil di halaman /tentang-kami).
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).

-- 1. Tabel Setting Visi Perusahaan (Single-row)
CREATE TABLE IF NOT EXISTS visi_setting (
    id             INTEGER PRIMARY KEY DEFAULT 1,
    visi_eyebrow   VARCHAR(100) NOT NULL DEFAULT 'Visi Perusahaan',
    visi_text      TEXT         NOT NULL DEFAULT 'Menghadirkan layanan tata udara yang terpercaya, efisien, dan inovatif untuk memenuhi kebutuhan sektor hunian, komersial, hingga industri.',
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row_visi CHECK (id = 1)
);

-- 2. Tabel Butir-Butir Misi Perusahaan (Kartu Misi)
CREATE TABLE IF NOT EXISTS misi (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10)  NOT NULL DEFAULT '01',
    title       VARCHAR(150) NOT NULL,
    tagline     VARCHAR(150) NOT NULL DEFAULT '',
    description TEXT         NOT NULL DEFAULT '',
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- Indeks performa
CREATE INDEX IF NOT EXISTS idx_misi_active_order ON misi (is_active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_misi_deleted_at ON misi (deleted_at);

-- Seed awal Visi Perusahaan
INSERT INTO visi_setting (id, visi_eyebrow, visi_text)
VALUES (
    1,
    'Visi Perusahaan',
    'Menghadirkan layanan tata udara yang terpercaya, efisien, dan inovatif untuk memenuhi kebutuhan sektor hunian, komersial, hingga industri.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed awal 4 Misi resmi
INSERT INTO misi (code, title, tagline, description, sort_order, is_active)
SELECT seed.code, seed.title, seed.tagline, seed.description, seed.sort_order, TRUE
FROM (
    VALUES
        ('01', 'Layanan Prima', 'Presisi & Tepat Waktu', 'Menghadirkan pengerjaan instalasi, perawatan berkala, dan reparasi unit AC yang rapi, tepat jadwal, serta berstandar teknis pabrikan.', 1),
        ('02', 'Solusi Efisien', 'Kalkulasi Beban Ruang', 'Merancang sistem tata udara yang hemat konsumsi daya dan presisi sesuai perhitungan beban termal ruang hunian, komersial, maupun industri.', 2),
        ('03', 'Teknisi Profesional', 'SOP & Integritas Tinggi', 'Menerjunkan teknisi bersertifikasi yang berintegritas tinggi, teliti dalam pengelasan pipa, dan mengutamakan keselamatan kerja.', 3),
        ('04', 'Kemitraan Berkelanjutan', 'Garansi Tertulis 30 Hari', 'Membangun hubungan jangka panjang melalui transparansi rincian biaya, respon tanggap darurat, dan jaminan garansi resmi tertulis.', 4)
) AS seed(code, title, tagline, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM misi LIMIT 1);
