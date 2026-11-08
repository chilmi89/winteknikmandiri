package model

import (
	"time"

	"github.com/google/uuid"
)

// Gaji merepresentasikan slip gaji untuk tim teknisi tertentu.
type Gaji struct {
	ID        uuid.UUID    `json:"id"`
	KodeGaji  string       `json:"kode_gaji"`
	TeamID    uuid.UUID    `json:"team_id"`
	TeamName  string       `json:"team_name,omitempty"`
	TeamSkill string       `json:"team_skill,omitempty"`
	TotalGaji string       `json:"total_gaji"`
	Status    string       `json:"status"`
	Catatan   string       `json:"catatan"`
	Proyek    []GajiProyek `json:"proyek,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	DeletedAt *time.Time   `json:"deleted_at,omitempty"`
}

// GajiProyek merepresentasikan rincian proyek yang ditempelkan ke slip gaji.
// Nama proyek diambil langsung dari relasi order_id.
type GajiProyek struct {
	ID           uuid.UUID `json:"id"`
	GajiID       uuid.UUID `json:"gaji_id"`
	OrderID      uuid.UUID `json:"order_id"`
	InvoiceNo    string    `json:"invoice_no,omitempty"`
	NamaLayanan  string    `json:"nama_layanan,omitempty"`
	NamaCustomer string    `json:"nama_customer,omitempty"`
	Nominal      string    `json:"nominal"`
	Keterangan   string    `json:"keterangan"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
