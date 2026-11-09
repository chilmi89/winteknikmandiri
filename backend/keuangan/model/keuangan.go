package model

import (
	"time"

	"github.com/google/uuid"
)

// KategoriKeuangan merepresentasikan master kategori pemasukan dan pengeluaran.
type KategoriKeuangan struct {
	ID           uuid.UUID  `json:"id"`
	NamaKategori string     `json:"nama_kategori"`
	Tipe         string     `json:"tipe"` // 'pemasukan' atau 'pengeluaran'
	Deskripsi    string     `json:"deskripsi"`
	IsSystem     bool       `json:"is_system"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}

// JurnalKeuangan merepresentasikan satu lembar nota jurnal kas / buku kas operasional.
type JurnalKeuangan struct {
	ID                 uuid.UUID    `json:"id"`
	KodeJurnal         string       `json:"kode_jurnal"`
	Judul              string       `json:"judul"`
	WaktuTransaksi     time.Time    `json:"waktu_transaksi"`
	Cabang             string       `json:"cabang"`
	Status             string       `json:"status"` // 'draft', 'lunas', 'batal'
	TotalPemasukan     string       `json:"total_pemasukan"`
	TotalPengeluaran   string       `json:"total_pengeluaran"`
	SaldoBersih        string       `json:"saldo_bersih"`
	NumericPemasukan   int64        `json:"numeric_pemasukan"`
	NumericPengeluaran int64        `json:"numeric_pengeluaran"`
	NumericSaldo       int64        `json:"numeric_saldo"`
	Catatan            string       `json:"catatan"`
	Items              []JurnalItem `json:"items,omitempty"`
	CreatedAt          time.Time    `json:"created_at"`
	UpdatedAt          time.Time    `json:"updated_at"`
	DeletedAt          *time.Time   `json:"deleted_at,omitempty"`
}

// JurnalItem merepresentasikan satu baris transaksi rincian di dalam lembar jurnal kas.
type JurnalItem struct {
	ID               uuid.UUID  `json:"id"`
	JurnalID         uuid.UUID  `json:"jurnal_id"`
	Tipe             string     `json:"tipe"` // 'pemasukan' atau 'pengeluaran'
	Deskripsi        string     `json:"deskripsi"`
	KategoriID       *uuid.UUID `json:"kategori_id,omitempty"`
	NamaKategori     string     `json:"nama_kategori,omitempty"`
	MetodePembayaran string     `json:"metode_pembayaran"` // 'transfer', 'cash', 'kasbon', 'qris'
	Nominal          string     `json:"nominal"`
	AmountNumeric    int64      `json:"amount_numeric"`
	Sumber           string     `json:"sumber"` // 'manual', 'proyek', 'gaji'
	OrderID          *uuid.UUID `json:"order_id,omitempty"`
	InvoiceNo        string     `json:"invoice_no,omitempty"`
	GajiID           *uuid.UUID `json:"gaji_id,omitempty"`
	KodeGaji         string     `json:"kode_gaji,omitempty"`
	Catatan          string     `json:"catatan"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// KeuanganOrderOption representasi opsi proyek yang tersedia untuk dicatat di kas.
type KeuanganOrderOption struct {
	ID              uuid.UUID `json:"id"`
	InvoiceNo       string    `json:"invoice_no"`
	InitialCategory string    `json:"initial_category"`
	InitialService  string    `json:"initial_service"`
	CustomerName    string    `json:"customer_name"`
	TotalAmount     string    `json:"total_amount"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}

// KeuanganGajiOption representasi opsi slip gaji yang tersedia untuk dicairkan di kas.
type KeuanganGajiOption struct {
	ID        uuid.UUID `json:"id"`
	KodeGaji  string    `json:"kode_gaji"`
	TeamName  string    `json:"team_name"`
	TotalGaji string    `json:"total_gaji"`
	CreatedAt time.Time `json:"created_at"`
}
