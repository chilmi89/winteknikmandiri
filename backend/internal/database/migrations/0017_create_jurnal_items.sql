-- Migrasi 0017: Rombak Jurnal Keuangan menjadi Arsitektur Nota Kas Multi-Baris (Header - Items)
-- Menghubungkan header jurnal (JRN-XXXX) dengan tabel baris transaksi jurnal_items.

-- 1. Penyesuaian kolom di tabel jurnal_keuangan (Header Nota)
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS waktu_transaksi TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS cabang VARCHAR(100) NOT NULL DEFAULT 'Workshop Pusat Kediri';
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS total_pemasukan VARCHAR(50) NOT NULL DEFAULT 'Rp 0';
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS total_pengeluaran VARCHAR(50) NOT NULL DEFAULT 'Rp 0';
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS saldo_bersih VARCHAR(50) NOT NULL DEFAULT 'Rp 0';
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS numeric_pemasukan BIGINT NOT NULL DEFAULT 0;
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS numeric_pengeluaran BIGINT NOT NULL DEFAULT 0;
ALTER TABLE jurnal_keuangan ADD COLUMN IF NOT EXISTS numeric_saldo BIGINT NOT NULL DEFAULT 0;

ALTER TABLE jurnal_keuangan ALTER COLUMN tipe DROP NOT NULL;
ALTER TABLE jurnal_keuangan ALTER COLUMN tipe SET DEFAULT 'multi';
ALTER TABLE jurnal_keuangan ALTER COLUMN nominal DROP NOT NULL;
ALTER TABLE jurnal_keuangan ALTER COLUMN nominal SET DEFAULT 'Rp 0';
ALTER TABLE jurnal_keuangan ALTER COLUMN amount_numeric DROP NOT NULL;
ALTER TABLE jurnal_keuangan ALTER COLUMN amount_numeric SET DEFAULT 0;
ALTER TABLE jurnal_keuangan ALTER COLUMN tanggal DROP NOT NULL;
ALTER TABLE jurnal_keuangan ALTER COLUMN tanggal SET DEFAULT CURRENT_DATE;
ALTER TABLE jurnal_keuangan ALTER COLUMN sumber DROP NOT NULL;
ALTER TABLE jurnal_keuangan ALTER COLUMN sumber SET DEFAULT 'multi';
ALTER TABLE jurnal_keuangan ALTER COLUMN status SET DEFAULT 'draft';

-- Bersihkan duplikasi kategori_keuangan jika ada dan buat unique constraint
DELETE FROM kategori_keuangan WHERE id NOT IN (
    SELECT (MIN(id::text))::uuid FROM kategori_keuangan WHERE deleted_at IS NULL GROUP BY nama_kategori, tipe
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_kategori_keuangan_unique_nama ON kategori_keuangan (nama_kategori, tipe) WHERE deleted_at IS NULL;

-- 2. Buat tabel jurnal_items (Rincian Baris Transaksi di Dalam Nota)
CREATE TABLE IF NOT EXISTS jurnal_items (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jurnal_id          UUID NOT NULL REFERENCES jurnal_keuangan(id) ON DELETE CASCADE,
    tipe               VARCHAR(30)  NOT NULL, -- 'pemasukan' atau 'pengeluaran'
    deskripsi          VARCHAR(250) NOT NULL,
    kategori_id        UUID REFERENCES kategori_keuangan(id) ON DELETE SET NULL,
    metode_pembayaran  VARCHAR(30)  NOT NULL DEFAULT 'transfer', -- 'cash', 'transfer', 'kasbon', 'qris'
    nominal            VARCHAR(50)  NOT NULL DEFAULT 'Rp 0',
    amount_numeric     BIGINT       NOT NULL DEFAULT 0,
    sumber             VARCHAR(30)  NOT NULL DEFAULT 'manual', -- 'manual', 'proyek', 'gaji'
    order_id           UUID REFERENCES orders(id) ON DELETE SET NULL,
    gaji_id            UUID REFERENCES gaji(id) ON DELETE SET NULL,
    catatan            TEXT         NOT NULL DEFAULT '',
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_items_jurnal_id ON jurnal_items (jurnal_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_items_order_id ON jurnal_items (order_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_items_gaji_id ON jurnal_items (gaji_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_waktu_transaksi ON jurnal_keuangan (waktu_transaksi DESC);
