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
- 🗄️ **PostgreSQL Database**: Port `5432` (`wtm_user` / `wtm_password_secret` / `wtm_db`)

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

## 📡 Daftar Endpoint API Backend (Go Gin)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Cek status server Go & koneksi database PostgreSQL |
| `POST` | `/api/v1/inquiries` | Simpan data formulir konsultasi pelanggan dari web |
| `GET` | `/api/v1/inquiries` | Tampilkan daftar riwayat konsultasi (dengan pagination) |
