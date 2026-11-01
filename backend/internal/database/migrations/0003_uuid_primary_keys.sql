-- Konversi primary key seluruh tabel domain dari BIGSERIAL (bigint) ke UUID v4.
--
-- Latar belakang: lingkungan yang sudah berjalan (VPS) mencatat 0001 dan 0002 di
-- schema_migrations, sehingga mengubah kedua file itu tidak akan berefek apa pun.
-- Karena itu konversi dilakukan lewat migrasi baru yang idempoten terhadap data:
-- tipe kolom id diubah, setiap baris mendapat UUID acak dari gen_random_uuid()
-- (bawaan PostgreSQL 13+, tanpa extension), dan sequence lama dibuang.
--
-- Konvensi ke depan: tabel baru WAJIB memakai
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- dan kolom relasi memakai tipe UUID juga.

-- inquiries ---------------------------------------------------------------
ALTER TABLE inquiries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE inquiries ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE inquiries ALTER COLUMN id SET DEFAULT gen_random_uuid();
DROP SEQUENCE IF EXISTS inquiries_id_seq;

-- faqs -------------------------------------------------------------------
ALTER TABLE faqs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE faqs ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE faqs ALTER COLUMN id SET DEFAULT gen_random_uuid();
DROP SEQUENCE IF EXISTS faqs_id_seq;
