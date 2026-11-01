-- Tabel permohonan konsultasi dari formulir website.
-- Disusun kompatibel dengan PostgreSQL 16 (versi di server) dan 18 (lokal).
-- IF NOT EXISTS membuat migrasi aman dijalankan pada database yang tabelnya
-- sudah pernah dibuat oleh GORM AutoMigrate.

CREATE TABLE IF NOT EXISTS inquiries (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    phone      VARCHAR(50)  NOT NULL,
    service    VARCHAR(100) NOT NULL,
    address    VARCHAR(255) NOT NULL DEFAULT '',
    notes      TEXT         NOT NULL,
    status     VARCHAR(30)  NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inquiries_deleted_at ON inquiries (deleted_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
