package model

import (
	"time"

	"github.com/google/uuid"
)

// KategoriKeuangan merepresentasikan master kategori pemasukan dan pengeluaran.
type KategoriKeuangan struct {
	ID        uuid.UUID  `json:"id"`
	NamaKategori string `json:"nama_kategori"`
	Tipe      string     `json:"tipe"` // 'pemasukan' atau 'pengeluaran'
	Deskripsi string     `json:"deskripsi"`
	IsSystem  bool       `json:"is_system"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// JurnalKeuangan merepresentasikan satu entri transaksi buku kas / jurnal keuangan.
type JurnalKeuangan struct {
	ID               uuid.UUID  `json:"id"`
	KodeJurnal       string     `json:"kode_jurnal"`
	Tipe             string     `json:"tipe"` // 'pemasukan' atau 'pengeluaran'
	Judul            string     `json:"judul"`
	KategoriID       *uuid.UUID `json:"kategori_id,omitempty"`
	NamaKategori     string     `json:"nama_kategori,omitempty"`
	MetodePembayaran string     `json:"metode_pembayaran"` // 'cash', 'transfer', 'kasbon'
	Nominal          string     `json:"nominal"`
	AmountNumeric    int64      `json:"amount_numeric"`
	Status           string     `json:"status"` // 'lunas', 'pending', 'batal'
	Tanggal          string     `json:"tanggal"` // YYYY-MM-DD
	Sumber           string     `json:"sumber"`  // 'manual', 'proyek', 'gaji'
	OrderID          *uuid.UUID `json:"order_id,omitempty"`
	InvoiceNo        string     `json:"invoice_no,omitempty"`
	GajiID           *uuid.UUID `json:"gaji_id,omitempty"`
	KodeGaji         string     `json:"kode_gaji,omitempty"`
	Catatan          string     `json:"catatan"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty"`
}
