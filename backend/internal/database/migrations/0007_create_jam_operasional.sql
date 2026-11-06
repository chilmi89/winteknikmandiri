-- Tabel Jam Operasional (Jadwal Kerja Resmi yang tampil di halaman /kontak & footer situs).
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).

CREATE TABLE IF NOT EXISTS jam_operasional (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_label  VARCHAR(100) NOT NULL,
    hours      VARCHAR(100) NOT NULL,
    is_closed  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indeks performa & integritas
CREATE INDEX IF NOT EXISTS idx_jam_operasional_active_order ON jam_operasional (is_active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_jam_operasional_deleted_at ON jam_operasional (deleted_at);

-- Tabel konfigurasi judul, badge status, dan catatan kaki
CREATE TABLE IF NOT EXISTS jam_operasional_setting (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    badge_text  VARCHAR(100) NOT NULL DEFAULT 'Buka Hari Kerja',
    title       VARCHAR(100) NOT NULL DEFAULT 'Jam Operasional',
    note        TEXT         NOT NULL DEFAULT '* Untuk mitra kontrak pemeliharaan gedung & darurat komersial, tim standby melayani penanganan terjadwal di luar jam kantor.',
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row_jam_setting CHECK (id = 1)
);

-- Seed awal baris jadwal jika masih kosong
INSERT INTO jam_operasional (day_label, hours, is_closed, sort_order, is_active)
SELECT seed.day_label, seed.hours, seed.is_closed, seed.sort_order, TRUE
FROM (
    VALUES
        ('Senin – Jumat', '08.00 – 16.00', FALSE, 1),
        ('Sabtu', '08.00 – 12.00', FALSE, 2),
        ('Minggu & tanggal merah', 'Libur', TRUE, 3)
) AS seed(day_label, hours, is_closed, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM jam_operasional LIMIT 1);

-- Seed setting jika belum ada
INSERT INTO jam_operasional_setting (id, badge_text, title, note)
VALUES (1, 'Buka Hari Kerja', 'Jam Operasional', '* Untuk mitra kontrak pemeliharaan gedung & darurat komersial, tim standby melayani penanganan terjadwal di luar jam kantor.')
ON CONFLICT (id) DO NOTHING;
