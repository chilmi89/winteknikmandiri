// Package dto berisi kontrak data transfer object (DTO) untuk fitur Layanan.
package dto

import (
	"time"

	"winteknikmandiri-backend/services/model"
)

// CreateServiceRequest menampung payload untuk membuat layanan baru.
type CreateServiceRequest struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title" binding:"required,min=3"`
	Category    string   `json:"category"`
	PricePrefix string   `json:"price_prefix"`
	Price       *string  `json:"price"`
	Unit        string   `json:"unit"`
	PriceNote   string   `json:"price_note"`
	ImageURL    string   `json:"image_url"`
	ImageKey    string   `json:"image_key"`
	Summary     string   `json:"summary"`
	Highlights  []string `json:"highlights"`
	SortOrder   int      `json:"sort_order"`
	IsActive    *bool    `json:"is_active"`
}

// UpdateServiceRequest menampung payload untuk memperbarui layanan yang ada.
type UpdateServiceRequest struct {
	Slug        *string   `json:"slug"`
	Title       string    `json:"title" binding:"required,min=3"`
	Category    *string   `json:"category"`
	PricePrefix *string   `json:"price_prefix"`
	Price       *string   `json:"price"`
	Unit        *string   `json:"unit"`
	PriceNote   *string   `json:"price_note"`
	ImageURL    *string   `json:"image_url"`
	ImageKey    *string   `json:"image_key"`
	Summary     *string   `json:"summary"`
	Highlights  *[]string `json:"highlights"`
	SortOrder   *int      `json:"sort_order"`
	IsActive    *bool     `json:"is_active"`
}

// ListServiceQuery adalah parameter query untuk GET /api/v1/services.
type ListServiceQuery struct {
	Category        string `form:"category"`
	Search          string `form:"search"`
	IncludeInactive bool   `form:"include_inactive"`
	Limit           int    `form:"limit"`
	Offset          int    `form:"offset"`
}

// ServiceResponse adalah representasi satu layanan di response API.
type ServiceResponse struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Title       string    `json:"title"`
	Category    string    `json:"category"`
	PricePrefix string    `json:"price_prefix"`
	Price       *string   `json:"price"`
	Unit        string    `json:"unit"`
	PriceNote   string    `json:"price_note"`
	ImageURL    string    `json:"image_url"`
	ImageKey    string    `json:"image_key"`
	Summary     string    `json:"summary"`
	Highlights  []string  `json:"highlights"`
	SortOrder   int       `json:"sort_order"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ServiceEnvelope membungkus satu respons layanan dengan pesan opsional.
type ServiceEnvelope struct {
	Message string          `json:"message,omitempty"`
	Data    ServiceResponse `json:"data"`
}

// ListServiceResponse membungkus daftar layanan dengan metadata pagination.
type ListServiceResponse struct {
	Total  int64             `json:"total"`
	Limit  int               `json:"limit"`
	Offset int               `json:"offset"`
	Data   []ServiceResponse `json:"data"`
}

// ServiceMessageResponse adalah respons sederhana setelah operasi tertentu (misal: DELETE).
type ServiceMessageResponse struct {
	Message string `json:"message"`
}

// UploadImageResponse adalah balikan saat foto layanan diunggah ke MinIO.
type UploadImageResponse struct {
	ImageURL     string `json:"image_url"`
	ImageKey     string `json:"image_key"`
	OriginalName string `json:"original_name"`
}

// NewServiceResponse mengonversi model.Service ke ServiceResponse DTO.
func NewServiceResponse(m model.Service) ServiceResponse {
	highlights := m.Highlights
	if highlights == nil {
		highlights = []string{}
	}

	return ServiceResponse{
		ID:          m.ID.String(),
		Slug:        m.Slug,
		Title:       m.Title,
		Category:    m.Category,
		PricePrefix: m.PricePrefix,
		Price:       m.Price,
		Unit:        m.Unit,
		PriceNote:   m.PriceNote,
		ImageURL:    m.ImageURL,
		ImageKey:    m.ImageKey,
		Summary:     m.Summary,
		Highlights:  highlights,
		SortOrder:   m.SortOrder,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
