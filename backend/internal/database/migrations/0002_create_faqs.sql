-- Tabel FAQ yang tampil di landing page dan bisa dikelola dari dashboard.
-- Migrasi ini idempoten dan aman untuk database yang sudah punya tabel
-- `faqs` versi lama (tanpa kolom category/sort_order).

CREATE TABLE IF NOT EXISTS faqs (
    id         BIGSERIAL PRIMARY KEY,
    question   TEXT         NOT NULL,
    answer     TEXT         NOT NULL,
    category   VARCHAR(100) NOT NULL DEFAULT '',
    sort_order INTEGER      NOT NULL DEFAULT 0,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Normalisasi tabel lama: tambahkan kolom yang belum ada tanpa menyentuh data.
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS question   TEXT;
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS answer     TEXT;
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS category   VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS sort_order INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS is_active  BOOLEAN      NOT NULL DEFAULT TRUE;
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW();
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW();
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

UPDATE faqs SET question   = '' WHERE question   IS NULL;
UPDATE faqs SET answer     = '' WHERE answer     IS NULL;
UPDATE faqs SET created_at = NOW() WHERE created_at IS NULL;
UPDATE faqs SET updated_at = NOW() WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_faqs_active_order ON faqs (is_active, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_faqs_deleted_at ON faqs (deleted_at);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs (category);

-- Seed konten awal, hanya bila tabel masih kosong (tidak menimpa data produksi).
INSERT INTO faqs (question, answer, category, sort_order)
SELECT seed.question, seed.answer, seed.category, seed.sort_order
FROM (VALUES
    (
        'Area mana saja yang dilayani oleh CV Win Teknik Mandiri?',
        'Kami melayani seluruh wilayah Kota dan Kabupaten Kediri, termasuk Ngadiluwih, Kras, Kandat, Pare, Wates, Gurah, Mojo, dan sekitarnya, serta siap menangani proyek komersial dan industri di Jawa Timur.',
        'Layanan',
        1
    ),
    (
        'Berapa lama jaminan garansi pengerjaan yang diberikan?',
        'Seluruh pengerjaan instalasi dan reparasi dilindungi garansi tertulis 30 hari. Untuk pergantian sparepart, masa garansi mengikuti ketentuan resmi dari pabrikan.',
        'Garansi',
        2
    ),
    (
        'Apakah melayani proyek perusahaan, sekolah, dan gedung komersial?',
        'Ya. Kami menangani pengadaan unit, pemasangan AC VRF/VRV, fabrikasi ducting BJLS, hingga kontrak maintenance berkala dengan kelengkapan invoice dan faktur resmi.',
        'Proyek',
        3
    ),
    (
        'Berapa biaya pengecekan awal untuk AC rusak atau tidak dingin?',
        'Biaya cek dan diagnosa kerusakan adalah Rp 75.000, dan biaya pengecekan ini gratis bila Anda melanjutkan pengerjaan perbaikan unit bersama tim kami.',
        'Biaya',
        4
    ),
    (
        'Apakah setiap pemasangan AC baru sudah termasuk proses vakum?',
        'Pasti. Seluruh pemasangan unit AC baru maupun bekas wajib mengikuti SOP vakum mesin minimal 15-20 menit untuk menguras uap air dari pipa dan menjaga kompresor tetap awet.',
        'Teknis',
        5
    ),
    (
        'Bagaimana cara melakukan booking teknisi atau survei proyek?',
        'Cukup hubungi WhatsApp resmi kami di 0812-1662-2840 atau kirim pesan melalui halaman Kontak. Tim kami siap merespons cepat dan menjadwalkan survei ke lokasi Anda.',
        'Pemesanan',
        6
    )
) AS seed(question, answer, category, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs);
