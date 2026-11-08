-- Menambahkan kolom maps_url untuk menyimpan link shareloc Google Maps dari WhatsApp.
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS maps_url TEXT;
