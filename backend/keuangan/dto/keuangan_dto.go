package dto

import "time"

// KategoriResponse representasi JSON data kategori keuangan.
type KategoriResponse struct {
	ID           string    `json:"id"`
	NamaKategori string    `json:"nama_kategori"`
	Tipe         string    `json:"tipe"`
	Deskripsi    string    `json:"deskripsi"`
	IsSystem     bool      `json:"is_system"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CreateKategoriRequest payload untuk membuat kategori baru.
type CreateKategoriRequest struct {
	NamaKategori string `json:"nama_kategori" binding:"required"`
	Tipe         string `json:"tipe" binding:"required"` // 'pemasukan' atau 'pengeluaran'
	Deskripsi    string `json:"deskripsi"`
}

// UpdateKategoriRequest payload untuk mengedit kategori.
type UpdateKategoriRequest struct {
	NamaKategori *string `json:"nama_kategori"`
	Tipe         *string `json:"tipe"`
	Deskripsi    *string `json:"deskripsi"`
}

// JurnalItemResponse data satu baris rincian transaksi di dalam nota kas.
type JurnalItemResponse struct {
	ID               string    `json:"id"`
	JurnalID         string    `json:"jurnal_id"`
	Tipe             string    `json:"tipe"` // 'pemasukan' atau 'pengeluaran'
	Deskripsi        string    `json:"deskripsi"`
	KategoriID       *string   `json:"kategori_id,omitempty"`
	NamaKategori     string    `json:"nama_kategori"`
	MetodePembayaran string    `json:"metode_pembayaran"` // 'transfer', 'cash', 'kasbon', 'qris'
	Nominal          string    `json:"nominal"`
	AmountNumeric    int64     `json:"amount_numeric"`
	Sumber           string    `json:"sumber"` // 'manual', 'proyek', 'gaji'
	OrderID          *string   `json:"order_id,omitempty"`
	InvoiceNo        string    `json:"invoice_no,omitempty"`
	GajiID           *string   `json:"gaji_id,omitempty"`
	KodeGaji         string    `json:"kode_gaji,omitempty"`
	Catatan          string    `json:"catatan"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// JurnalResponse representasi JSON nota kas / jurnal keuangan lengkap.
type JurnalResponse struct {
	ID                 string               `json:"id"`
	KodeJurnal         string               `json:"kode_jurnal"`
	Judul              string               `json:"judul"`
	WaktuTransaksi     time.Time            `json:"waktu_transaksi"`
	Cabang             string               `json:"cabang"`
	Status             string               `json:"status"` // 'draft', 'lunas', 'batal'
	TotalPemasukan     string               `json:"total_pemasukan"`
	TotalPengeluaran   string               `json:"total_pengeluaran"`
	SaldoBersih        string               `json:"saldo_bersih"`
	NumericPemasukan   int64                `json:"numeric_pemasukan"`
	NumericPengeluaran int64                `json:"numeric_pengeluaran"`
	NumericSaldo       int64                `json:"numeric_saldo"`
	Catatan            string               `json:"catatan"`
	Items              []JurnalItemResponse `json:"items"`
	CreatedAt          time.Time            `json:"created_at"`
	UpdatedAt          time.Time            `json:"updated_at"`
}

// CreateJurnalItemRequest payload untuk baris rincian transaksi.
type CreateJurnalItemRequest struct {
	Tipe             string  `json:"tipe" binding:"required"` // 'pemasukan' atau 'pengeluaran'
	Deskripsi        string  `json:"deskripsi" binding:"required"`
	KategoriID       *string `json:"kategori_id"`
	MetodePembayaran string  `json:"metode_pembayaran"` // 'transfer', 'cash', 'kasbon', 'qris'
	Nominal          string  `json:"nominal" binding:"required"`
	Sumber           string  `json:"sumber"` // 'manual', 'proyek', 'gaji'
	OrderID          *string `json:"order_id"`
	GajiID           *string `json:"gaji_id"`
	Catatan          string  `json:"catatan"`
}

// CreateJurnalRequest payload pembuatan nota kas baru beserta rinciannya.
type CreateJurnalRequest struct {
	Judul          string                    `json:"judul"`
	WaktuTransaksi *string                   `json:"waktu_transaksi"`
	Cabang         string                    `json:"cabang"`
	Status         string                    `json:"status"` // 'draft', 'lunas'
	Catatan        string                    `json:"catatan"`
	Items          []CreateJurnalItemRequest `json:"items"`
}

// UpdateJurnalRequest payload pembaruan nota kas dan rinciannya.
type UpdateJurnalRequest struct {
	Judul          *string                    `json:"judul"`
	WaktuTransaksi *string                    `json:"waktu_transaksi"`
	Cabang         *string                    `json:"cabang"`
	Status         *string                    `json:"status"`
	Catatan        *string                    `json:"catatan"`
	Items          *[]CreateJurnalItemRequest `json:"items"`
}

// KeuanganSummary ringkasan metrik arus kas global / filter.
type KeuanganSummary struct {
	TotalPemasukan     string `json:"total_pemasukan"`
	TotalPengeluaran   string `json:"total_pengeluaran"`
	SisaSaldoKas       string `json:"sisa_saldo_kas"`
	NumericPemasukan   int64  `json:"numeric_pemasukan"`
	NumericPengeluaran int64  `json:"numeric_pengeluaran"`
	NumericSaldo       int64  `json:"numeric_saldo"`
	TotalTransaksi     int64  `json:"total_transaksi"`
}

// ListJurnalResponse respon daftar jurnal kas dengan summary & pagination.
type ListJurnalResponse struct {
	Summary    KeuanganSummary  `json:"summary"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	TotalPages int              `json:"total_pages"`
	Data       []JurnalResponse `json:"data"`
}

// Envelopes
type ListJurnalEnvelope struct {
	Message string             `json:"message,omitempty"`
	Data    ListJurnalResponse `json:"data"`
}

type JurnalEnvelope struct {
	Message string         `json:"message,omitempty"`
	Data    JurnalResponse `json:"data"`
}

type ListKategoriEnvelope struct {
	Message string             `json:"message,omitempty"`
	Data    []KategoriResponse `json:"data"`
}

type KategoriEnvelope struct {
	Message string           `json:"message,omitempty"`
	Data    KategoriResponse `json:"data"`
}

type KeuanganMessageResponse struct {
	Message string `json:"message"`
}

// ---------- DTO LAPORAN & ANALITIK KEUANGAN (4 PERIODE) ----------

type LaporanSummary struct {
	TotalPemasukan     string  `json:"total_pemasukan"`
	TotalPengeluaran   string  `json:"total_pengeluaran"`
	SaldoBersih        string  `json:"saldo_bersih"`
	NumericPemasukan   int64   `json:"numeric_pemasukan"`
	NumericPengeluaran int64   `json:"numeric_pengeluaran"`
	NumericSaldo       int64   `json:"numeric_saldo"`
	ProfitMarginPct    float64 `json:"profit_margin_pct"`
	TotalTransaksi     int64   `json:"total_transaksi"`
}

type ChartBarPoint struct {
	Label          string `json:"label"`
	Pemasukan      int64  `json:"pemasukan"`
	Pengeluaran    int64  `json:"pengeluaran"`
	Saldo          int64  `json:"saldo"`
	PemasukanStr   string `json:"pemasukan_str"`
	PengeluaranStr string `json:"pengeluaran_str"`
	SaldoStr       string `json:"saldo_str"`
}

type KategoriBreakdown struct {
	Kategori      string  `json:"kategori"`
	Tipe          string  `json:"tipe"`
	Total         string  `json:"total"`
	AmountNumeric int64   `json:"amount_numeric"`
	Percentage    float64 `json:"percentage"`
}

type LaporanItemRow struct {
	ID               string    `json:"id"`
	JurnalID         string    `json:"jurnal_id"`
	KodeJurnal       string    `json:"kode_jurnal"`
	WaktuTransaksi   time.Time `json:"waktu_transaksi"`
	Tipe             string    `json:"tipe"`
	Deskripsi        string    `json:"deskripsi"`
	NamaKategori     string    `json:"nama_kategori"`
	MetodePembayaran string    `json:"metode_pembayaran"`
	Nominal          string    `json:"nominal"`
	AmountNumeric    int64     `json:"amount_numeric"`
	Sumber           string    `json:"sumber"`
	InvoiceNo        string    `json:"invoice_no,omitempty"`
	KodeGaji         string    `json:"kode_gaji,omitempty"`
}

type LaporanResponse struct {
	Periode           string              `json:"periode"`
	PeriodeLabel      string              `json:"periode_label"`
	Summary           LaporanSummary      `json:"summary"`
	Chart             []ChartBarPoint     `json:"chart"`
	KategoriBreakdown []KategoriBreakdown `json:"kategori_breakdown"`
	Total             int64               `json:"total"`
	Page              int                 `json:"page"`
	Limit             int                 `json:"limit"`
	TotalPages        int                 `json:"total_pages"`
	Items             []LaporanItemRow    `json:"items"`
}

type LaporanEnvelope struct {
	Message string          `json:"message,omitempty"`
	Data    LaporanResponse `json:"data"`
}
