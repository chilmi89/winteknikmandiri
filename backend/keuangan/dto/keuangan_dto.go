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

// JurnalResponse representasi JSON data transaksi jurnal keuangan.
type JurnalResponse struct {
	ID               string    `json:"id"`
	KodeJurnal       string    `json:"kode_jurnal"`
	Tipe             string    `json:"tipe"`
	Judul            string    `json:"judul"`
	KategoriID       *string   `json:"kategori_id,omitempty"`
	NamaKategori     string    `json:"nama_kategori"`
	MetodePembayaran string    `json:"metode_pembayaran"`
	Nominal          string    `json:"nominal"`
	AmountNumeric    int64     `json:"amount_numeric"`
	Status           string    `json:"status"`
	Tanggal          string    `json:"tanggal"`
	Sumber           string    `json:"sumber"`
	OrderID          *string   `json:"order_id,omitempty"`
	InvoiceNo        string    `json:"invoice_no,omitempty"`
	GajiID           *string   `json:"gaji_id,omitempty"`
	KodeGaji         string    `json:"kode_gaji,omitempty"`
	Catatan          string    `json:"catatan"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// CreateJurnalRequest payload pembuatan transaksi jurnal kas baru.
type CreateJurnalRequest struct {
	Tipe             string  `json:"tipe" binding:"required"` // 'pemasukan' atau 'pengeluaran'
	Judul            string  `json:"judul" binding:"required"`
	KategoriID       *string `json:"kategori_id"`
	MetodePembayaran string  `json:"metode_pembayaran"` // 'cash', 'transfer', 'kasbon'
	Nominal          string  `json:"nominal" binding:"required"`
	Status           string  `json:"status"`            // 'lunas', 'pending', 'batal'
	Tanggal          string  `json:"tanggal"`           // YYYY-MM-DD
	Sumber           string  `json:"sumber"`            // 'manual', 'proyek', 'gaji'
	OrderID          *string `json:"order_id"`
	GajiID           *string `json:"gaji_id"`
	Catatan          string  `json:"catatan"`
}

// UpdateJurnalRequest payload pembaruan transaksi jurnal kas.
type UpdateJurnalRequest struct {
	Tipe             *string `json:"tipe"`
	Judul            *string `json:"judul"`
	KategoriID       *string `json:"kategori_id"`
	MetodePembayaran *string `json:"metode_pembayaran"`
	Nominal          *string `json:"nominal"`
	Status           *string `json:"status"`
	Tanggal          *string `json:"tanggal"`
	Sumber           *string `json:"sumber"`
	OrderID          *string `json:"order_id"`
	GajiID           *string `json:"gaji_id"`
	Catatan          *string `json:"catatan"`
}

// KeuanganSummary ringkasan metrik arus kas (cashflow).
type KeuanganSummary struct {
	TotalPemasukan   string `json:"total_pemasukan"`
	TotalPengeluaran string `json:"total_pengeluaran"`
	SisaSaldoKas     string `json:"sisa_saldo_kas"`
	NumericPemasukan int64  `json:"numeric_pemasukan"`
	NumericPengeluaran int64 `json:"numeric_pengeluaran"`
	NumericSaldo     int64  `json:"numeric_saldo"`
	TotalTransaksi   int64  `json:"total_transaksi"`
}

// ListJurnalResponse respon daftar jurnal lengkap dengan pagination & summary kas.
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
