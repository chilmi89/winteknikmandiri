-- Tabel Pilar Layanan (6 kartu yang tampil di section "Pilar Layanan" homepage).
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).

CREATE TABLE IF NOT EXISTS pilar_layanan (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(10)  NOT NULL DEFAULT '',
    title         VARCHAR(200) NOT NULL,
    description   TEXT         NOT NULL DEFAULT '',
    link_url      VARCHAR(255) NOT NULL DEFAULT '/layanan',
    is_featured   BOOLEAN      NOT NULL DEFAULT FALSE,
    cta_text      VARCHAR(100) NOT NULL DEFAULT '',
    sort_order    INTEGER      NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

-- Indeks performa & integritas
CREATE INDEX IF NOT EXISTS idx_pilar_layanan_active_order ON pilar_layanan (is_active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_pilar_layanan_deleted_at ON pilar_layanan (deleted_at);

-- Seed data awal jika tabel masih kosong
INSERT INTO pilar_layanan (
    code,
    title,
    description,
    link_url,
    is_featured,
    cta_text,
    sort_order,
    is_active
)
SELECT
    seed.code,
    seed.title,
    seed.description,
    seed.link_url,
    seed.is_featured,
    seed.cta_text,
    seed.sort_order,
    TRUE
FROM (
    VALUES
        ('01', 'Supply & pengadaan AC', 'Split, cassette, floor standing, hingga VRF/VRV dari berbagai merk.', '/layanan', FALSE, '', 1),
        ('02', 'Instalasi AC konvensional & VRF', 'Pemipaan tembaga presisi, flaring, dan vakum sesuai spesifikasi pabrikan.', '/layanan', FALSE, '', 2),
        ('03', 'Maintenance & services', 'Perawatan berkala, pembersihan kimia, perbaikan PCB, dan kompresor.', '/layanan', FALSE, '', 3),
        ('04', 'Supply & pengadaan ducting', 'Fabrikasi dan pengadaan BJLS, PU duct, serta spiral duct.', '/layanan', FALSE, '', 4),
        ('05', 'Instalasi ducting', 'Sekolah, rumah sakit, perkantoran, tenant mall, dan fasilitas industri.', '/layanan', FALSE, '', 5),
        ('06', 'Butuh kombinasi layanan?', 'Diskusikan kebutuhan proyek Anda dengan tim kami.', 'https://wa.me/6281216622840?text=Halo%20CV%20Win%20Teknik%20Mandiri%2C%20saya%20ingin%20mendiskusikan%20kebutuhan%20AC%20atau%20ducting%20untuk%20proyek%20saya.', TRUE, 'Konsultasi', 6)
) AS seed(code, title, description, link_url, is_featured, cta_text, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM pilar_layanan LIMIT 1);
