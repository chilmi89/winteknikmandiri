package dto

import "time"

// GajiResponse representasi JSON slip gaji lengkap dengan rincian proyek.
type GajiResponse struct {
	ID        string              `json:"id"`
	KodeGaji  string              `json:"kode_gaji"`
	TeamID    string              `json:"team_id"`
	TeamName  string              `json:"team_name"`
	TeamSkill string              `json:"team_skill"`
	TotalGaji string              `json:"total_gaji"`
	Status    string              `json:"status"`
	Catatan   string              `json:"catatan"`
	Proyek    []GajiProyekResponse `json:"proyek"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
}

// GajiProyekResponse representasi rincian proyek pada slip gaji.
type GajiProyekResponse struct {
	ID           string    `json:"id"`
	GajiID       string    `json:"gaji_id"`
	OrderID      string    `json:"order_id"`
	InvoiceNo    string    `json:"invoice_no"`
	NamaLayanan  string    `json:"nama_layanan"`
	NamaCustomer string    `json:"nama_customer"`
	Nominal      string    `json:"nominal"`
	Keterangan   string    `json:"keterangan"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// AttachProyekRequest payload menempelkan proyek ke slip gaji.
type AttachProyekRequest struct {
	OrderID    string `json:"order_id" binding:"required"`
	Nominal    string `json:"nominal" binding:"required"`
	Keterangan string `json:"keterangan"`
}

// CreateGajiRequest payload pembuatan slip gaji baru.
type CreateGajiRequest struct {
	TeamID  string                `json:"team_id" binding:"required"`
	Status  string                `json:"status"`
	Catatan string                `json:"catatan"`
	Proyek  []AttachProyekRequest `json:"proyek"`
}

// UpdateGajiRequest payload edit slip gaji.
type UpdateGajiRequest struct {
	TeamID  *string                `json:"team_id"`
	Status  *string                `json:"status"`
	Catatan *string                `json:"catatan"`
	Proyek  *[]AttachProyekRequest `json:"proyek"`
}

// GajiEnvelope membungkus single response gaji.
type GajiEnvelope struct {
	Message string       `json:"message,omitempty"`
	Data    GajiResponse `json:"data"`
}

// ListGajiResponse respon daftar gaji dengan pagination metadata.
type ListGajiResponse struct {
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
	Data       []GajiResponse `json:"data"`
}

// ListGajiEnvelope membungkus list response gaji.
type ListGajiEnvelope struct {
	Message string           `json:"message,omitempty"`
	Data    ListGajiResponse `json:"data"`
}

// GajiMessageResponse respon pesan sukses sederhana.
type GajiMessageResponse struct {
	Message string `json:"message"`
}

// GajiOrderOptionResponse data proyek yang tersedia untuk penggajian.
type GajiOrderOptionResponse struct {
	ID              string    `json:"id"`
	InvoiceNo       string    `json:"invoice_no"`
	InitialCategory string    `json:"initial_category"`
	InitialService  string    `json:"initial_service"`
	CustomerName    string    `json:"customer_name"`
	TotalAmount     string    `json:"total_amount"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}

// ListAvailableOrdersEnvelope membungkus respon proyek yang tersedia untuk gaji.
type ListAvailableOrdersEnvelope struct {
	Message string                    `json:"message,omitempty"`
	Data    []GajiOrderOptionResponse `json:"data"`
}
