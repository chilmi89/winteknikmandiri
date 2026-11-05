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
└── backend/                 # REST API: Go (Golang) + Gin + PostgreSQL native (pgx)
    ├── Dockerfile           # Multi-stage image: golang:alpine -> alpine
    ├── main.go              # Server entrypoint: connect DB, migrate, serve
    ├── internal/
    │   ├── database/        # Pool database/sql + pgx, migrasi SQL embedded
    │   ├── apperr/          # Error aplikasi (validation/not found/internal)
    │   └── httpx/           # Helper respons JSON yang konsisten
    ├── inquiries/           # Fitur permohonan konsultasi
    │   ├── controller/  dto/  model/  repository/  router/  service/
    ├── faqs/                # Fitur FAQ
    │   ├── controller/  dto/  model/  repository/  router/  service/
    ├── health/              # Health check
    │   ├── controller/  router/
    └── routes/              # Perakitan router & CORS (tipis, tanpa query)
```

---

## 🌐 Arsitektur Container & Network (Production Ready)

```
Pengunjung (Internet)
         │
         ▼  (Port 80 HTTP / Port 443 HTTPS dengan Auto-SSL)
┌───────────────────────────────────────────────────────────┐
│                    CADDY REVERSE PROXY                    │
└───────┬──────────────────────┬────────────────────┬───────┘
        │ /                    │ /api/*             │ /media/*
        │                      │ /health            │
        ▼                      ▼                    ▼
  ┌───────────┐          ┌───────────┐        ┌───────────┐
  │ Frontend  │          │  Backend  │        │   MinIO   │
  │ (Next.js) │          │ (Go Gin)  ├───────►│  Storage  │
  │ Port 3000 │          │ Port 8080 │ (S3)   │ Port 9000 │
  └───────────┘          └─────┬─────┘        └───────────┘
                               │ (Internal DB)      ▲
                               ▼                    │
                         ┌───────────┐              │ (Auto-init)
                         │ PostgreSQL│        ┌─────┴───────┐
                         │ Port 5432 │        │  MinIO Init │
                         └───────────┘        │   (mc cli)  │
                                              └─────────────┘
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

Akses layanan di browser (semua lewat Caddy, port 80/443):
- 🌐 **Website**: [http://localhost](http://localhost) / [https://localhost](https://localhost)
- ⚡ **Backend API via Caddy**: [http://localhost/health](http://localhost/health)
- 🗄️ **PostgreSQL Database**: hanya terikat ke `127.0.0.1:5433` (`wtm_user` / `Wtm_S3cur3#P0stgr3s!2026` / `wtm_db`).
  Port internal container tetap `5432`. Di VPS, port host tetap `5432` karena `DB_HOST_PORT` tidak diisi.
  Jika PostgreSQL native sudah memakai `5432`, Docker otomatis memakai `5433` sesuai `.env` lokal.
- 🪣 **MinIO Web Console**: [http://localhost:9001](http://localhost:9001) (`wtm_admin` / `Wtm_M1n10#S3cur3!2026`).
  Bucket `wtm-media` dan folder `services/` dibuat otomatis oleh container `wtm-minio-init`.
- 🖼️ **Akses Media Publik**: [http://localhost/media/wtm-media/services/...](http://localhost/media/wtm-media/services/...) (diteruskan Caddy ke MinIO).

> Backend (`8080`) dan frontend (`3000`) **tidak dipublikasikan ke host** — hanya Caddy yang punya port host.
> Jadi akses langsung ke `http://localhost:8080` hanya berlaku saat memakai `npm run dev:backend` (Go native),
> bukan saat mode Docker. Lihat bagian [Keamanan Port](#-keamanan-port-production).

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
npm run dev:backend   # migrasi SQL otomatis dijalankan saat backend start
npm run dev           # frontend di :3000
```

**4. Uji per fitur dengan database terpisah (opsional):**
```sql
CREATE DATABASE wtm_feat_proyek OWNER wtm_user;
```
Lalu ganti `DB_NAME=wtm_feat_proyek` di `backend/.env` dan restart backend. Migrasi SQL di `internal/database/migrations/` dijalankan otomatis saat start; DB bisa dihapus dan dibuat ulang kapan saja tanpa risiko.

**5. Akses lewat DBeaver:**

| Mode | Host | Port | Database | User |
|---|---|---|---|---|
| Lokal native | `localhost` | `5432` | `wtm_db_local` | `wtm_user` |
| Docker (jika Docker Desktop jalan) | `localhost` | `5433` | `wtm_db` | `wtm_user` |
| VPS (via SSH tunnel) | `localhost` | `5432` | `wtm_db` | `wtm_user` |

> Port host Docker dipisah ke `5433` lewat `DB_HOST_PORT` di `.env` agar tidak bentrok dengan PostgreSQL native. Di VPS variabel itu tidak diisi, sehingga tetap `5432`. Port di-bind ke `127.0.0.1` saja, jadi **tidak bisa diakses langsung dari internet** — gunakan SSH tunnel (`ssh -L 5432:localhost:5432 user@vps`).

**6. Naik ke database server setelah fitur lolos uji:**
```bash
# Struktur tabel: cukup deploy backend, migrasi SQL menambah tabel/kolom baru
ssh user@vps "cd ~/win-teknik-mandiri && git pull && docker compose up -d --build backend"

# Data seed tertentu saja (tanpa menimpa data produksi)
& "D:\PostgreSQL\bin\pg_dump.exe" -h localhost -p 5432 -U wtm_user -d wtm_db_local `
  --data-only --table=inquiries --inserts --on-conflict-do-nothing -f seed_inquiries.sql
scp seed_inquiries.sql user@vps:/tmp/
ssh user@vps "docker exec -i wtm-postgres psql -U wtm_user -d wtm_db < /tmp/seed_inquiries.sql"
```

---

## 🔐 Keamanan Port (Production)

Hanya Caddy yang membuka port ke publik. Service lain hanya bisa diakses di dalam network Docker.

| Service | Port host | Akses dari internet |
|---|---|---|
| `caddy` | `80`, `443` (TCP) + `443` (UDP) | publik — pintu masuk satu-satunya |
| `backend` | tidak ada (hanya `expose: 8080`) | tidak bisa; lewat Caddy `/api/*` dan `/health` |
| `frontend` | tidak ada (hanya `expose: 3000`) | tidak bisa; lewat Caddy `/` |
| `postgres` | `127.0.0.1:5432` | tidak bisa; lewat SSH tunnel |
| `minio` (API) | `127.0.0.1:9000` | tidak bisa langsung; foto publik lewat Caddy `/media/*` |
| `minio` (Console) | `127.0.0.1:9001` | tidak bisa; di VPS lewat SSH tunnel (`ssh -L 9001:localhost:9001 user@vps`) |

Verifikasi di server:

```bash
docker compose ps
# harapan: backend & frontend tanpa kolom PORTS, postgres 127.0.0.1:5432->5432

ss -tlnp | grep -E ':(5432|8080|3000)\b'
# harapan: hanya 127.0.0.1:5432

curl -s -o /dev/null -w 'web=%{http_code}\n'    https://domain-anda.com/
curl -s -o /dev/null -w 'api=%{http_code}\n'    https://domain-anda.com/api/v1/faqs
```

Dari komputer lain (bukan server), port berikut harus **timeout/gagal**:

```powershell
Test-NetConnection <IP-VPS> -Port 5432
Test-NetConnection <IP-VPS> -Port 8080
Test-NetConnection <IP-VPS> -Port 3000
```

> ⚠️ **UFW tidak menutup port yang di-publish Docker**, karena Docker menulis rule langsung ke chain
> `DOCKER` (melewati UFW). Karena itu port di-bind ke `127.0.0.1` atau dihapus dari `docker-compose.yml`,
> bukan sekadar diblokir firewall. Untuk lapisan kedua, tutup juga `3000`/`8080`/`5432` di
> security group cloud provider dan sisakan `22`, `80`, `443`.

Akses database dari laptop tetap bisa lewat SSH tunnel:

```bash
ssh -L 5432:localhost:5432 user@vps
# lalu hubungkan DBeaver ke localhost:5432
```

---

## 📡 Daftar Endpoint API Backend (Go Gin)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Cek status server Go & koneksi database PostgreSQL |
| `POST` | `/api/v1/inquiries` | Simpan data formulir konsultasi pelanggan dari web |
| `GET` | `/api/v1/inquiries` | Tampilkan daftar riwayat konsultasi (dengan pagination) |
| `GET` | `/api/v1/faqs` | Daftar FAQ aktif (`?category=&search=&include_inactive=&limit=&offset=`) |
| `GET` | `/api/v1/faqs/:id` | Detail satu FAQ |
| `POST` | `/api/v1/faqs` | Buat FAQ baru (belum ber-auth, lihat `TODO(auth)`) |
| `PUT` | `/api/v1/faqs/:id` | Perbarui FAQ (field opsional dipertahankan bila tidak dikirim) |
| `DELETE` | `/api/v1/faqs/:id` | Soft delete FAQ |

> Semua query memakai SQL native (`database/sql` + `pgx v5`), tanpa ORM.
> Skema database dikelola lewat migrasi SQL di `backend/internal/database/migrations/`
> dan dijalankan otomatis setiap backend start (idempoten, tercatat di tabel `schema_migrations`).
> Parameter `:id` pada endpoint FAQ adalah **UUID** (contoh: `0f8fad5b-d9cb-469f-a165-70867728950e`), bukan angka.

---

## 🧬 Konvensi Skema Database (UUID)

Semua tabel domain memakai UUID v4 sebagai primary key. `gen_random_uuid()` sudah
bawaan PostgreSQL 13+ sehingga tidak perlu extension `pgcrypto`, dan aman dipakai
di PostgreSQL 16 (VPS) maupun 18 (lokal).

Template wajib untuk tabel baru:

```sql
CREATE TABLE IF NOT EXISTS contoh (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- kolom domain ...
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);
```

Aturan relasi antar tabel:

```sql
-- kolom relasi juga UUID, jangan INTEGER/BIGINT
inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE
```

- Beri index pada setiap kolom foreign key (`CREATE INDEX ... ON tabel (kolom_id)`).
- Soft delete: cukup isi `deleted_at`, semua query baca menambahkan `WHERE deleted_at IS NULL`.
- Urutan data tidak boleh bergantung pada `id` (UUID acak). Pakai kolom bisnis seperti
  `sort_order` lalu `created_at` sebagai tie-breaker.
- Tabel baru = file migrasi baru bernomor urut (`0004_...`). **Jangan** mengedit migrasi
  yang sudah tercatat di `schema_migrations`; perubahan skema harus lewat migrasi baru.
- Di Go, `model` memakai `uuid.UUID`; `dto` memakai `string` agar JSON dan Swagger tetap
  terbaca sebagai string. Query `WHERE id = $1::uuid` (pgx v5 tidak menerima string mentah
  untuk kolom UUID).

---

## 📘 Dokumentasi API (Swagger / OpenAPI)

Dokumentasi digenerate dari anotasi di handler (swaggo), lalu disajikan langsung oleh Gin.

| URL | Isi |
|---|---|
| `/swagger/index.html` | Swagger UI interaktif (bisa "Try it out") |
| `/swagger/doc.json` | Spesifikasi OpenAPI 2.0 dalam JSON |

Lokal: <http://localhost:8080/swagger/index.html>

### Kapan aktif

| Environment | `SWAGGER_ENABLED` | Hasil |
|---|---|---|
| Lokal (`backend/.env`) | `true` | UI aktif |
| VPS (`docker-compose.yml`) | `${SWAGGER_ENABLED:-false}` | mati secara default, route tidak didaftarkan |
| VPS (dibuka sengaja) | `true` di `.env` VPS | aktif, lalu `docker compose up -d backend` |

Kalau UI perlu dibuka di VPS tapi tidak untuk publik, tambahkan basic auth di `Caddyfile`:

```
handle /swagger/* {
    basic_auth {
        admin $2a$14$HASH_BCRYPT_ANDA
    }
    reverse_proxy backend:8080
}
```
Buat hash dengan `caddy hash-password --plaintext 'passwordAnda'`.

### Regenerate dokumentasi

Tidak perlu install CLI — script memakai `go run` dengan versi `swag` yang sudah dipin:

```bash
npm run docs:swagger
# ekuivalen dengan:
cd backend && go run github.com/swaggo/swag/cmd/swag@v1.16.4 init -g main.go -o docs --parseInternal
# atau dari folder backend:
go generate ./...
```

Kalau ingin memakai perintah `swag` langsung, install sekali per mesin:
`go install github.com/swaggo/swag/cmd/swag@latest` (pastikan `$(go env GOPATH)/bin` ada di `PATH`).

Hasil generate (`backend/docs/docs.go`, `swagger.json`, `swagger.yaml`) **ikut di-commit** supaya
`docker compose up -d --build backend` tetap jalan tanpa `swag` CLI dan tanpa network tambahan.

### Menambah dokumentasi endpoint baru

Anotasi diletakkan tepat di atas fungsi handler, contoh:

```go
// @Summary     Daftar FAQ
// @Tags        faqs
// @Produce     json
// @Param       limit query int false "Jumlah data" default(20)
// @Success     200 {object} dto.ListFAQResponse
// @Failure     503 {object} httpx.ErrorResponse
// @Router      /api/v1/faqs [get]
func (h *FAQController) List(c *gin.Context) { ... }
```

Gunakan path lengkap di `@Router` (termasuk `/api/v1/...`) karena `@BasePath` diset `/`
agar endpoint `/health` yang berada di luar `/api/v1` tetap terdokumentasi dengan benar.

