-- Migrasi 0016: Tabel Kategori Keuangan & Jurnal Keuangan CV Win Teknik Mandiri
-- Mengelola arus kas pemasukan & pengeluaran, terintegrasi dengan tabel orders (Proyek) dan gaji (Slip Gaji).

-- 1. Tabel Master Kategori Keuangan
CREATE TABLE IF NOT EXISTS kategori_keuangan (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kategori  VARCHAR(150) NOT NULL,
    tipe           VARCHAR(30)  NOT NULL, -- 'pemasukan' atau 'pengeluaran'
    deskripsi      TEXT         NOT NULL DEFAULT '',
    is_system      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kategori_keuangan_tipe ON kategori_keuangan (tipe) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_kategori_keuangan_deleted ON kategori_keuangan (deleted_at);

-- Seed Kategori Keuangan Standar
INSERT INTO kategori_keuangan (nama_kategori, tipe, deskripsi, is_system) VALUES
('Pendapatan Proyek & Instalasi AC', 'pemasukan', 'Pemasangan unit baru, ducting, dan borongan komersial', TRUE),
('Pendapatan Servis & Cuci AC', 'pemasukan', 'Maintenance berkala perumahan dan kantor', TRUE),
('Penjualan Unit AC & Sparepart', 'pemasukan', 'Penjualan unit AC baru/second dan sparepart', TRUE),
('Pendapatan Lain-lain', 'pemasukan', 'Pendapatan non-operasional lainnya', FALSE),
('Gaji & Upah Borongan Teknisi', 'pengeluaran', 'Pencairan upah borongan dan slip gaji tim teknisi', TRUE),
('Pembelian Material & Freon', 'pengeluaran', 'Pipa tembaga, bracket, freon R32/R410A, kabel', TRUE),
('BBM & Operasional Armada', 'pengeluaran', 'Bensin pikap, servis mobil operasional, tol, parkir', FALSE),
('Kasbon Karyawan', 'pengeluaran', 'Pinjaman dan kasbon teknisi / staf', TRUE),
('Konsumsi & Lembur Tim', 'pengeluaran', 'Makan dan minum lembur proyek teknisi', FALSE),
('Sewa Workshop, Listrik & Air', 'pengeluaran', 'Biaya utilitas dan sewa tempat kerja', FALSE),
('Pengeluaran Lain-lain', 'pengeluaran', 'Biaya tak terduga dan operasional kecil', FALSE)
ON CONFLICT DO NOTHING;

-- 2. Tabel Jurnal Keuangan (Buku Kas & Transaksi)
CREATE TABLE IF NOT EXISTS jurnal_keuangan (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_jurnal        VARCHAR(50)  NOT NULL,                    -- Format: 'JRN-2611-0001'
    tipe               VARCHAR(30)  NOT NULL,                    -- 'pemasukan' atau 'pengeluaran'
    judul              VARCHAR(250) NOT NULL,                    -- Judul transaksi / deskripsi singkat
    kategori_id        UUID REFERENCES kategori_keuangan(id) ON DELETE SET NULL,
    metode_pembayaran  VARCHAR(30)  NOT NULL DEFAULT 'transfer', -- 'cash', 'transfer', 'kasbon'
    
    -- Dual Nominal: Format tampilan string dan bigint untuk komputasi instan
    nominal            VARCHAR(50)  NOT NULL DEFAULT 'Rp 0',
    amount_numeric     BIGINT       NOT NULL DEFAULT 0,
    
    status             VARCHAR(30)  NOT NULL DEFAULT 'lunas',    -- 'lunas', 'pending', 'batal'
    tanggal            DATE         NOT NULL DEFAULT CURRENT_DATE,
    
    -- Sumber Otomatisasi (Bebas Capek Input Dobel)
    sumber             VARCHAR(30)  NOT NULL DEFAULT 'manual',   -- 'manual', 'proyek', 'gaji'
    order_id           UUID REFERENCES orders(id) ON DELETE SET NULL,     -- Terhubung ke Invoice Proyek
    gaji_id            UUID REFERENCES gaji(id) ON DELETE SET NULL,       -- Terhubung ke Slip Gaji
    
    catatan            TEXT         NOT NULL DEFAULT '',
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_jurnal_kode ON jurnal_keuangan (kode_jurnal) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jurnal_tanggal ON jurnal_keuangan (tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_jurnal_tipe_status ON jurnal_keuangan (tipe, status);
CREATE INDEX IF NOT EXISTS idx_jurnal_order_id ON jurnal_keuangan (order_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_gaji_id ON jurnal_keuangan (gaji_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_deleted_at ON jurnal_keuangan (deleted_at);
