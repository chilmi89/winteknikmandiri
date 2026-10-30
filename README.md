# CV WIN TEKNIK MANDIRI — Fullstack Monorepo

Website resmi & REST API **CV WIN TEKNIK MANDIRI** — Kontraktor AC, instalasi sistem VRF, fabrikasi ducting BJLS, dan pemeliharaan gedung komersial/industri di Kediri Raya.

---

## 🏛️ Arsitektur Monorepo

```
win-teknik-mandiri/
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

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Docker Compose (Satu Perintah untuk Semua)

Pastikan Docker sudah terpasang, lalu jalankan:

```bash
# Salin konfigurasi environment
cp .env.example .env

# Jalankan seluruh service (Frontend, Backend, PostgreSQL, pgAdmin)
docker compose up --build -d
```

Akses layanan di browser:
- 🌐 **Frontend (Next.js + Bun)**: [http://localhost:3000](http://localhost:3000)
- ⚡ **Backend API (Go Gin)**: [http://localhost:8080](http://localhost:8080)
  - Health Check: `GET http://localhost:8080/health`
  - Inquiries API: `GET & POST http://localhost:8080/api/v1/inquiries`
- 🐘 **pgAdmin 4 GUI**: [http://localhost:5050](http://localhost:5050)
  - Email: `admin@winteknikmandiri.com`
  - Password: `admin`
- 🗄️ **PostgreSQL Database**: Port `5432` (`wtm_user` / `wtm_password_secret` / `wtm_db`)

---

### Opsi 2: Menjalankan Secara Lokal (Non-Docker)

#### 1. Frontend (Next.js via Bun / Node)
```bash
cd frontend

# Menggunakan Bun (Direkomendasikan)
bun install
bun run dev

# Atau menggunakan npm
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

#### 2. Backend (Go Gin)
```bash
cd backend

# Jalankan server API
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
