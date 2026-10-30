# CV WIN TEKNIK MANDIRI — Fullstack Monorepo

Website resmi & REST API **CV WIN TEKNIK MANDIRI** — Kontraktor AC, instalasi sistem VRF, fabrikasi ducting BJLS, dan pemeliharaan gedung komersial/industri di Kediri Raya.

---

## 🏛️ Arsitektur Monorepo

```
win-teknik-mandiri/
├── docker-compose.yml       # Orkestrasi 3 container service (Frontend, Backend, PostgreSQL)
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

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Docker Compose (Satu Perintah untuk Semua)

Pastikan Docker Desktop sudah terpasang dan berjalan, lalu jalankan:

```bash
# Salin konfigurasi environment (jika belum ada)
cp .env.example .env

# Jalankan seluruh service (Frontend, Backend, PostgreSQL)
docker compose up -d
```

Akses layanan di browser:
- 🌐 **Frontend (Next.js + Bun)**: [http://localhost:3000](http://localhost:3000)
- ⚡ **Backend API (Go Gin)**: [http://localhost:8080](http://localhost:8080)
  - Health Check: `GET http://localhost:8080/health`
  - Inquiries API: `GET & POST http://localhost:8080/api/v1/inquiries`
- 🗄️ **PostgreSQL Database**: Port `5432` (`wtm_user` / `wtm_password_secret` / `wtm_db`)

---

### Opsi 2: Menjalankan Secara Lokal (Non-Docker)

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

## 📡 Daftar Endpoint API Backend (Go Gin)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Cek status server Go & koneksi database PostgreSQL |
| `POST` | `/api/v1/inquiries` | Simpan data formulir konsultasi pelanggan dari web |
| `GET` | `/api/v1/inquiries` | Tampilkan daftar riwayat konsultasi (dengan pagination) |
