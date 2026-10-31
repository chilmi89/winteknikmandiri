# CV WIN TEKNIK MANDIRI — Fullstack Monorepo

Website resmi & REST API **CV WIN TEKNIK MANDIRI** — Kontraktor AC, instalasi sistem VRF, fabrikasi ducting BJLS, dan pemeliharaan gedung komersial/industri di Kediri Raya.

---

## 🏛️ Arsitektur Monorepo

```
win-teknik-mandiri/
├── Caddyfile                # Reverse Proxy & Auto HTTPS (SSL Let's Encrypt)
├── docker-compose.yml       # Orkestrasi 4 container service
├── .env.example             # Template variabel lingkungan
│
├── frontend/                # Next.js 16 + Tailwind v4 + TypeScript (Berbasis Bun)
│   ├── Dockerfile           # Multi-stage image: oven/bun:alpine
│   ├── app/                 # Halaman: /, /layanan, /tentang-kami, /galeri, /kontak
│   └── ...
│
└── backend/                 # REST API: Go (Golang) + Gin Framework + GORM
    ├── Dockerfile           # Multi-stage image: golang:alpine -> alpine
    ├── main.go              # Server entrypoint & auto-migration
    ├── config/              # Koneksi PostgreSQL & pool
    ├── controllers/         # Handler API
    ├── models/              # Schema database GORM
    └── routes/              # Routing & CORS
```

---

## 🌐 Arsitektur Container & Network (Production Ready)

```
Pengunjung (Internet)
         │
         ▼  (Port 80 HTTP / Port 443 HTTPS dengan Auto-SSL)
┌──────────────────────────────────────────────┐
│             CADDY REVERSE PROXY              │
└───────────────┬──────────────────────────────┘
                │ (Internal Docker Network: wtm-network)
      ┌─────────┴─────────┐
      ▼                   ▼
┌───────────┐       ┌───────────┐
│ Frontend  │       │  Backend  │
│ (Next.js) │       │ (Go Gin)  │
│ Port 3000 │       │ Port 8080 │
└───────────┘       └─────┬─────┘
                          │ (Internal DB Connection)
                          ▼
                    ┌───────────┐
                    │ PostgreSQL│
                    │ Port 5432 │
                    └───────────┘
```

---

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Docker Compose (Satu Perintah untuk Semua)

Pastikan Docker Desktop sudah terpasang dan berjalan, lalu jalankan:

```bash
# Salin konfigurasi environment (jika belum ada)
cp .env.example .env

# Jalankan seluruh service (Caddy, Frontend, Backend, PostgreSQL)
docker compose up -d
```

Akses layanan di browser:
- 🌐 **Website via Caddy (Auto HTTPS)**: [https://localhost](https://localhost) atau [http://localhost](http://localhost)
- ⚡ **Backend API via Caddy**: [https://localhost/health](https://localhost/health)
- 🗄️ **PostgreSQL Database**: Port host `5433` (`wtm_user` / `Wtm_S3cur3#P0stgr3s!2026` / `wtm_db`).
  Port internal container tetap `5432`. Di VPS, port host tetap `5432` karena `DB_HOST_PORT` tidak diisi.
  Jika PostgreSQL native sudah memakai `5432`, Docker otomatis memakai `5433` sesuai `.env` lokal.

---

### Opsi 2: Deploy ke VPS (Production Live)

1. **Arahkan DNS Domain**:
   Arahkan DNS Record `A` domain Anda (misal: `winteknikmandiri.com`) ke IP Publik VPS Anda.

2. **Clone Repository di VPS**:
   ```bash
   git clone https://github.com/chilmi89/winteknikmandiri.git
   cd winteknikmandiri
   ```

3. **Atur Variabel Lingkungan (`.env`)**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Ubah variabel domain dan email:
   ```env
   DOMAIN=winteknikmandiri.com
   CADDY_EMAIL=cswinteknikmandiri@gmail.com
   ```

4. **Nyalakan dengan Satu Perintah**:
   ```bash
   docker compose up -d --build
   ```
   *Caddy akan otomatis mendaftarkan dan menerbitkan sertifikat SSL resmi (Let's Encrypt) untuk domain Anda. Website langsung LIVE dengan HTTPS tanpa konfigurasi tambahan!*

---

### Opsi 3: Menjalankan Secara Lokal (Non-Docker)

#### 1. Frontend (Next.js via Bun / Node)
```bash
# Dari root
npm run dev

# Atau dari folder frontend
cd frontend
bun run dev    # atau: npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

#### 2. Backend (Go Gin)
```bash
# Dari root
npm run dev:backend

# Atau dari folder backend
cd backend
go run main.go
```

API akan berjalan di port `8080` ([http://localhost:8080/health](http://localhost:8080/health)).

---

### Opsi 4: Database Lokal (PostgreSQL Native) untuk Development per Fitur

Dipakai saat ingin menguji fitur tanpa menyentuh database Docker maupun database VPS.
Semua data uji tersimpan di PostgreSQL yang terpasang langsung di laptop.

**1. Siapkan role & database lokal (sekali saja):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-local-db.ps1
```
Skrip ini membuat user `wtm_user` dan database `wtm_db_local` di `localhost:5432`, lalu memverifikasi koneksinya. Anda akan diminta password superuser `postgres`.

**2. Konfigurasi backend:**
File `backend/.env` (tidak ikut ter-commit) sudah disiapkan untuk mode lokal:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=wtm_user
DB_PASSWORD=Wtm_S3cur3#P0stgr3s!2026
DB_NAME=wtm_db_local
```

**3. Jalankan:**
```bash
npm run dev:backend   # GORM AutoMigrate membuat tabel otomatis
npm run dev           # frontend di :3000
```

**4. Uji per fitur dengan database terpisah (opsional):**
```sql
CREATE DATABASE wtm_feat_proyek OWNER wtm_user;
```
Lalu ganti `DB_NAME=wtm_feat_proyek` di `backend/.env` dan restart backend. Tabel dibuat otomatis; DB bisa dihapus dan dibuat ulang kapan saja tanpa risiko.

**5. Akses lewat DBeaver:**

| Mode | Host | Port | Database | User |
|---|---|---|---|---|
| Lokal native | `localhost` | `5432` | `wtm_db_local` | `wtm_user` |
| Docker (jika Docker Desktop jalan) | `localhost` | `5433` | `wtm_db` | `wtm_user` |
| VPS (via SSH tunnel) | `localhost` | `5432` | `wtm_db` | `wtm_user` |

> Port host Docker dipisah ke `5433` lewat `DB_HOST_PORT` di `.env` agar tidak bentrok dengan PostgreSQL native. Di VPS variabel itu tidak diisi, sehingga tetap `5432`.

**6. Naik ke database server setelah fitur lolos uji:**
```bash
# Struktur tabel: cukup deploy backend, AutoMigrate menambah tabel/kolom baru
ssh user@vps "cd ~/win-teknik-mandiri && git pull && docker compose up -d --build backend"

# Data seed tertentu saja (tanpa menimpa data produksi)
& "D:\PostgreSQL\bin\pg_dump.exe" -h localhost -p 5432 -U wtm_user -d wtm_db_local `
  --data-only --table=inquiries --inserts --on-conflict-do-nothing -f seed_inquiries.sql
scp seed_inquiries.sql user@vps:/tmp/
ssh user@vps "docker exec -i wtm-postgres psql -U wtm_user -d wtm_db < /tmp/seed_inquiries.sql"
```

---

## 📡 Daftar Endpoint API Backend (Go Gin)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Cek status server Go & koneksi database PostgreSQL |
| `POST` | `/api/v1/inquiries` | Simpan data formulir konsultasi pelanggan dari web |
| `GET` | `/api/v1/inquiries` | Tampilkan daftar riwayat konsultasi (dengan pagination) |
