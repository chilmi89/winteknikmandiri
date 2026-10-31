# ============================================================
# Setup database lokal (PostgreSQL native) untuk development WTM
# ------------------------------------------------------------
# Membuat role `wtm_user` + database `wtm_db_local` di PostgreSQL
# yang berjalan di localhost:5432 (mis. PostgreSQL 18 native),
# tanpa mengganggu database Docker (`wtm_db`).
#
# Pemakaian:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-local-db.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$PgHost = "localhost"
$PgPort = "5432"
$SuperUser = "postgres"
$SqlFile = Join-Path $PSScriptRoot "setup-local-db.sql"

function Find-Psql {
    $candidates = @(
        "D:\PostgreSQL\bin\psql.exe",
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    )

    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }

    $command = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $found = Get-ChildItem "C:\Program Files\PostgreSQL", "D:\PostgreSQL" -Filter psql.exe -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($found) { return $found.FullName }

    throw "psql.exe tidak ditemukan. Pastikan PostgreSQL sudah terpasang."
}

$psql = Find-Psql
Write-Host "psql      : $psql"
Write-Host "Target    : ${PgHost}:${PgPort} (superuser: $SuperUser)"
Write-Host ""

# Cek port benar-benar melayani PostgreSQL.
$listener = Get-NetTCPConnection -LocalPort $PgPort -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    throw "Tidak ada PostgreSQL yang listen di port $PgPort. Jalankan service postgresql-x64-18 terlebih dahulu."
}

$securePassword = Read-Host "Masukkan password superuser '$SuperUser'" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

if (-not $plainPassword) {
    throw "Password superuser tidak boleh kosong."
}

$env:PGPASSWORD = $plainPassword
try {
    Write-Host "Menjalankan skrip setup database…" -ForegroundColor Cyan
    & $psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -v ON_ERROR_STOP=1 -f $SqlFile
    if ($LASTEXITCODE -ne 0) { throw "psql gagal dengan exit code $LASTEXITCODE." }

    Write-Host ""
    Write-Host "Verifikasi koneksi sebagai wtm_user…" -ForegroundColor Cyan
    $env:PGPASSWORD = "Wtm_S3cur3#P0stgr3s!2026"
    & $psql -h $PgHost -p $PgPort -U wtm_user -d wtm_db_local -c "select current_database() as database, current_user as role;"
    if ($LASTEXITCODE -ne 0) { throw "Koneksi sebagai wtm_user gagal." }

    Write-Host ""
    Write-Host "Selesai. Database lokal siap dipakai." -ForegroundColor Green
    Write-Host "  Host     : $PgHost"
    Write-Host "  Port     : $PgPort"
    Write-Host "  Database : wtm_db_local"
    Write-Host "  User     : wtm_user"
    Write-Host ""
    Write-Host "Jalankan backend: npm run dev:backend"
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
