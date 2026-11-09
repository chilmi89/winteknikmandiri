-- Migrasi 0018: Tabel Statistik Pencapaian Perusahaan (Company Achievement Stats)
-- Menghubungkan angka pencapaian perusahaan secara dinamis ke Beranda, Tentang Kami, dan Galeri.

CREATE TABLE IF NOT EXISTS company_stats (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label          VARCHAR(150) NOT NULL,               -- Label statistik, misal: "Berdiri Sejak", "Proyek Selesai"
    value          VARCHAR(50)  NOT NULL,               -- Display string, misal: "2.014", "364+"
    target_number  INT          NOT NULL DEFAULT 0,     -- Angka target untuk animasi hitung (2014, 364, 36, 20)
    has_plus       BOOLEAN      NOT NULL DEFAULT FALSE, -- Apakah ada tanda plus (+) merah
    keterangan     TEXT         NOT NULL DEFAULT '',    -- Deskripsi opsional (untuk galeri & tentang kami)
    sort_order     INT          NOT NULL DEFAULT 0,     -- Urutan tampilan
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,  -- Saklar aktif/nonaktif
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_company_stats_active_order ON company_stats (is_active, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_company_stats_deleted ON company_stats (deleted_at);

-- Seed Data Awal Standar CV Win Teknik Mandiri
INSERT INTO company_stats (label, value, target_number, has_plus, sort_order, keterangan) VALUES
('Berdiri Sejak', '2014', 2014, FALSE, 1, 'Melayani jasa instalasi, pengadaan, dan perawatan pendingin udara HVAC terpercaya di Kediri sejak 2014.'),
('Proyek Selesai', '364+', 364, TRUE, 2, 'Penanganan tata udara di sekolahan, retail mall, perkantoran, dan kawasan industri komersial.'),
('Proyek Berjalan', '36+', 36, TRUE, 3, 'Pekerjaan instalasi baru dan kontrak pemeliharaan berkala aktif yang sedang ditangani teknisi.'),
('Mitra Korporasi', '20+', 20, TRUE, 4, 'Kemitraan jangka panjang dengan tenant ritel nasional, pengelola gedung, dan pabrik.')
ON CONFLICT DO NOTHING;
