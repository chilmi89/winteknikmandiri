-- Tabel Sosial Media (Kanal media sosial resmi yang tampil di navbar, footer, dan kontak).
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).

CREATE TABLE IF NOT EXISTS sosial_media (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama       VARCHAR(100) NOT NULL,
    link       TEXT         NOT NULL,
    icon       VARCHAR(50)  NOT NULL DEFAULT '',
    sort_order INTEGER      NOT NULL DEFAULT 0,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indeks performa & integritas
CREATE INDEX IF NOT EXISTS idx_sosial_media_active_order ON sosial_media (is_active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_sosial_media_deleted_at ON sosial_media (deleted_at);

-- Seed data awal jika tabel masih kosong
INSERT INTO sosial_media (nama, link, icon, sort_order, is_active)
SELECT seed.nama, seed.link, seed.icon, seed.sort_order, TRUE
FROM (
    VALUES
        ('Instagram', 'https://www.instagram.com/winteknikmandiri?xtok=MWcxbWdteXR5YTNuMQ==', 'instagram', 1),
        ('TikTok', 'https://www.tiktok.com/@winteknikmandiri?_r=1&_t=ZS-9AmW2KKxbPB', 'tiktok', 2),
        ('Facebook', 'https://www.facebook.com/share/1By3XGtpVT/', 'facebook', 3)
) AS seed(nama, link, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM sosial_media LIMIT 1);
