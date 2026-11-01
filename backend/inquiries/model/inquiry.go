// Package model berisi representasi tabel inquiries di database.
package model

import (
	"time"

	"github.com/google/uuid"
)

// Status valid untuk sebuah inquiry.
const (
	StatusPending = "pending"
	StatusProses  = "proses"
	StatusSelesai = "selesai"
	StatusBatal   = "batal"
)

// Inquiry adalah permohonan konsultasi/pengerjaan dari pelanggan.
type Inquiry struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Service   string     `json:"service"`
	Address   string     `json:"address"`
	Notes     string     `json:"notes"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-"`
}
