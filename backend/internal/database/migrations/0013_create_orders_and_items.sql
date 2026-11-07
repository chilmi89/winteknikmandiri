-- Tabel Orders & Order Items untuk Alur Order via WhatsApp & Negosiasi Invoice Fleksibel.
-- Menggunakan UUID v4 sebagai primary key dan soft delete (deleted_at).
-- Seluruh kolom identitas pelanggan dibuat NULLABLE / fleksibel (diisi saat nego di WA).

CREATE TABLE IF NOT EXISTS orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no       VARCHAR(50)  NOT NULL,                 -- Format: 'INV-2611-001'
    initial_category VARCHAR(100) NOT NULL DEFAULT '',     -- Kategori yang diklik di web
    initial_service  VARCHAR(200) NOT NULL DEFAULT '',     -- Nama layanan yang diklik di web
    initial_price    VARCHAR(50)  NOT NULL DEFAULT '',     -- Estimasi harga awal di web
    customer_name    VARCHAR(150),                          -- Boleh NULL
    customer_phone   VARCHAR(50),                           -- Boleh NULL
    address          TEXT,                                  -- Boleh NULL
    notes            TEXT,                                  -- Boleh NULL (catatan nego/kendala)
    total_amount     VARCHAR(50)  NOT NULL DEFAULT '',      -- Total nominal deal fiks
    status           VARCHAR(50)  NOT NULL DEFAULT 'belum_diproses', 
    -- Pilihan status: 'belum_diproses', 'negosiasi', 'deal', 'dikerjakan', 'selesai', 'batal'
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_invoice_no ON orders (invoice_no) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id  UUID REFERENCES service_items(id) ON DELETE SET NULL, -- Relasi katalog (bisa NULL jika custom)
    item_name   VARCHAR(200) NOT NULL,                 -- Nama layanan (katalog atau custom)
    price       VARCHAR(50)  NOT NULL DEFAULT '',      -- Harga fiks / hasil nego
    qty         INTEGER      NOT NULL DEFAULT 1,       -- Jumlah
    unit        VARCHAR(50)  NOT NULL DEFAULT '/ unit',-- Satuan
    subtotal    VARCHAR(50)  NOT NULL DEFAULT '',      -- Subtotal baris
    notes       TEXT,                                  -- Catatan tambahan per baris
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
