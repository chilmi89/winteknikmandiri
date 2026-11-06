package dto

import "time"

// SosialMediaResponse merepresentasikan data JSON sosial media untuk klien.
type SosialMediaResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Nama      string    `json:"nama" example:"Instagram"`
	Link      string    `json:"link" example:"https://www.instagram.com/winteknikmandiri"`
	Icon      string    `json:"icon" example:"instagram"`
	SortOrder int       `json:"sort_order" example:"1"`
	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateSosialMediaRequest merepresentasikan payload pembuatan sosial media baru.
type CreateSosialMediaRequest struct {
	Nama      string `json:"nama" binding:"required,min=2,max=100" example:"Instagram"`
	Link      string `json:"link" binding:"required,min=2" example:"https://www.instagram.com/winteknikmandiri"`
	Icon      string `json:"icon" binding:"max=50" example:"instagram"`
	SortOrder *int   `json:"sort_order"`
	IsActive  *bool  `json:"is_active"`
}

// UpdateSosialMediaRequest merepresentasikan payload perubahan data sosial media.
type UpdateSosialMediaRequest struct {
	Nama      *string `json:"nama" binding:"omitempty,min=2,max=100"`
	Link      *string `json:"link" binding:"omitempty,min=2"`
	Icon      *string `json:"icon" binding:"omitempty,max=50"`
	SortOrder *int    `json:"sort_order"`
	IsActive  *bool   `json:"is_active"`
}

// ListSosialMediaQuery menampung filter query parameter untuk pencarian / listing.
type ListSosialMediaQuery struct {
	IncludeInactive bool
}

// SosialMediaEnvelope membungkus satu sosial media dengan pesan response.
type SosialMediaEnvelope struct {
	Message string              `json:"message,omitempty"`
	Data    SosialMediaResponse `json:"data"`
}

// ListSosialMediaEnvelope membungkus list sosial media dengan pesan response.
type ListSosialMediaEnvelope struct {
	Message string                `json:"message,omitempty"`
	Data    []SosialMediaResponse `json:"data"`
}

// SosialMediaMessageResponse merepresentasikan pesan sukses sederhana.
type SosialMediaMessageResponse struct {
	Message string `json:"message"`
}
