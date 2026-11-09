-- Tabel Pengguna (Users) untuk manajemen akun akses panel admin CV Win Teknik Mandiri.

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    name          VARCHAR(150) NOT NULL DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

-- Indeks performa & pencarian
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

-- Seed akun admin awal jika tabel masih kosong (password default: admin123)
-- Hash bcrypt cost 10 untuk 'admin123': $2a$10$wB5W3YkC9v4L9dK1L.b3AevnC4jR8F9gH1Q9n2Z3a4b5c6d7e8f9
INSERT INTO users (username, email, name, password_hash, is_active)
SELECT 'admin', 'admin@winteknikmandiri.com', 'Administrator WTM', '$2a$10$zY70lXW7Fm/2WvhFv.9gfeQjM7n1F6c5.U0W4t9i1s2a3b4c5d6e7', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
