-- ============================================================
-- Setup database lokal (PostgreSQL native) untuk development
-- Jalankan lewat: scripts\setup-local-db.ps1
-- atau di DBeaver/psql sebagai superuser `postgres`.
-- ============================================================

-- 1. Role aplikasi (idempoten: buat jika belum ada, reset password jika sudah)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wtm_user') THEN
    CREATE ROLE wtm_user LOGIN PASSWORD 'Wtm_S3cur3#P0stgr3s!2026';
  ELSE
    ALTER ROLE wtm_user WITH LOGIN PASSWORD 'Wtm_S3cur3#P0stgr3s!2026';
  END IF;
END $$;

-- 2. Database development utama
SELECT 'CREATE DATABASE wtm_db_local OWNER wtm_user'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'wtm_db_local')\gexec

-- 3. (Opsional) Database terpisah per fitur.
--    Buka komentar lalu ganti nama databasenya sesuai kebutuhan.
-- SELECT 'CREATE DATABASE wtm_feat_proyek OWNER wtm_user'
-- WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'wtm_feat_proyek')\gexec

-- 4. Hak akses schema public (PostgreSQL 15+ membatasi default privileges)
\connect wtm_db_local
GRANT ALL ON SCHEMA public TO wtm_user;
ALTER SCHEMA public OWNER TO wtm_user;
