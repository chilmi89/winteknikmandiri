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

> Port host Docker dipisah ke `5433` lewat `DB_HOST_PORT` di `.env` agar tidak bentrok dengan PostgreSQL native. Di VPS variabel itu tidak diisi, sehingga tetap `5432`.

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

