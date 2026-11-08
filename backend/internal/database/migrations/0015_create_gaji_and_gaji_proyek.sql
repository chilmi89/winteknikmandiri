-- Tabel Gaji Tim & Gaji Proyek CV Win Teknik Mandiri
-- Terhubung langsung dengan tabel team_members (Tim) dan tabel orders (Proyek/Layanan).
-- Nama proyek diambil langsung dari relasi order_id.

CREATE TABLE IF NOT EXISTS gaji (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_gaji      VARCHAR(50)  NOT NULL,
    team_id        UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    total_gaji     VARCHAR(50)  NOT NULL DEFAULT 'Rp 0',
    status         VARCHAR(50)  NOT NULL DEFAULT 'draft', -- 'draft', 'dibayar'
    catatan        TEXT         NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gaji_kode ON gaji (kode_gaji) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gaji_team_id ON gaji (team_id, status);
CREATE INDEX IF NOT EXISTS idx_gaji_deleted_at ON gaji (deleted_at);

CREATE TABLE IF NOT EXISTS gaji_proyek (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gaji_id        UUID NOT NULL REFERENCES gaji(id) ON DELETE CASCADE,
    order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    nominal        VARCHAR(50)  NOT NULL DEFAULT 'Rp 0',
    keterangan     TEXT         NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gaji_proyek_gaji_id ON gaji_proyek (gaji_id);
CREATE INDEX IF NOT EXISTS idx_gaji_proyek_order_id ON gaji_proyek (order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gaji_proyek_unique_order ON gaji_proyek (gaji_id, order_id);
