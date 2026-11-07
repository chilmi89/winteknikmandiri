-- Tabel Anggota Tim (Team Members) untuk section tim teknisi CV Win Teknik Mandiri.
-- Super minimalis: nama tim, skill / spesialisasi, dan foto (auto WebP).
-- Tanpa kolom urutan kartu (sort_order), diurutkan berdasarkan waktu pembuatan (created_at).

CREATE TABLE IF NOT EXISTS team_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    skill       VARCHAR(250) NOT NULL,
    image_url   TEXT         NOT NULL DEFAULT '',
    image_key   TEXT         NOT NULL DEFAULT '',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- Indeks performa & integritas
CREATE INDEX IF NOT EXISTS idx_team_members_active_created ON team_members (is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_deleted_at ON team_members (deleted_at);

-- Seed awal data jika tabel masih kosong
INSERT INTO team_members (name, skill, image_url, is_active)
SELECT seed.name, seed.skill, seed.image_url, TRUE
FROM (
    VALUES
        ('Team Wahyu', 'Spesialis VRF & Unit Komersial', '/gallery/Foto%20TIM/Team%20Wahyu.png'),
        ('Team Sobirin', 'Spesialis Fabrikasi & Ducting', '/gallery/Foto%20TIM/Team%20Sobirin.png'),
        ('Team Junaid', 'Supervisor Proyek & Maintenance', '/gallery/Foto%20TIM/Team%20Junaid.png'),
        ('Team Asep', 'Teknisi Senior Refrigerant & Electrical', '/gallery/Foto%20TIM/Team%20Asep.png')
) AS seed(name, skill, image_url)
WHERE NOT EXISTS (SELECT 1 FROM team_members LIMIT 1);
