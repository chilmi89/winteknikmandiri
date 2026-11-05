package dto

import "time"

// PilarLayananResponse merepresentasikan data JSON pilar layanan untuk klien.
type PilarLayananResponse struct {
	ID          string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Code        string    `json:"code" example:"01"`
	Title       string    `json:"title" example:"Supply & pengadaan AC"`
	Description string    `json:"description" example:"Split, cassette, floor standing, hingga VRF/VRV dari berbagai merk."`
	LinkURL     string    `json:"link_url" example:"/layanan"`
	IsFeatured  bool      `json:"is_featured" example:"false"`
	CTAText     string    `json:"cta_text" example:"Konsultasi"`
	SortOrder   int       `json:"sort_order" example:"1"`
	IsActive    bool      `json:"is_active" example:"true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreatePilarLayananRequest merepresentasikan payload pembuatan pilar layanan baru.
type CreatePilarLayananRequest struct {
	Code        string `json:"code" binding:"max=10" example:"01"`
	Title       string `json:"title" binding:"required,min=2,max=200" example:"Supply & pengadaan AC"`
	Description string `json:"description" example:"Keterangan singkat..."`
	LinkURL     string `json:"link_url" example:"/layanan"`
	IsFeatured  *bool  `json:"is_featured"`
	CTAText     string `json:"cta_text" example:"Konsultasi"`
	SortOrder   *int   `json:"sort_order"`
	IsActive    *bool  `json:"is_active"`
}

// UpdatePilarLayananRequest merepresentasikan payload perubahan pilar layanan.
type UpdatePilarLayananRequest struct {
	Code        *string `json:"code" binding:"omitempty,max=10"`
	Title       *string `json:"title" binding:"omitempty,min=2,max=200"`
	Description *string `json:"description"`
	LinkURL     *string `json:"link_url"`
	IsFeatured  *bool   `json:"is_featured"`
	CTAText     *string `json:"cta_text"`
	SortOrder   *int    `json:"sort_order"`
	IsActive    *bool   `json:"is_active"`
}

// ListPilarLayananQuery menampung filter query parameter untuk pencarian / listing.
type ListPilarLayananQuery struct {
	IncludeInactive bool
}

// PilarLayananEnvelope membungkus satu pilar layanan dengan pesan response.
type PilarLayananEnvelope struct {
	Message string               `json:"message,omitempty"`
	Data    PilarLayananResponse `json:"data"`
}

// ListPilarLayananEnvelope membungkus list pilar layanan dengan pesan response.
type ListPilarLayananEnvelope struct {
	Message string                 `json:"message,omitempty"`
	Data    []PilarLayananResponse `json:"data"`
}

// PilarLayananMessageResponse merepresentasikan pesan sukses sederhana.
type PilarLayananMessageResponse struct {
	Message string `json:"message"`
}
