// Package dto berisi kontrak request/response HTTP untuk fitur FAQ.
package dto

import (
	"time"

	"winteknikmandiri-backend/faqs/model"
)

// CreateFAQRequest adalah body untuk POST /api/v1/faqs.
// IsActive memakai pointer agar nilai default TRUE hanya berlaku saat
// field tidak dikirim.
type CreateFAQRequest struct {
	Question  string `json:"question" binding:"required,min=5"`
	Answer    string `json:"answer" binding:"required,min=5"`
	Category  string `json:"category" binding:"omitempty,max=100"`
	SortOrder int    `json:"sort_order"`
	IsActive  *bool  `json:"is_active"`
}

// UpdateFAQRequest adalah body untuk PUT /api/v1/faqs/:id.
// Field opsional memakai pointer agar nilai lama dipertahankan bila kosong.
type UpdateFAQRequest struct {
	Question  string  `json:"question" binding:"required,min=5"`
	Answer    string  `json:"answer" binding:"required,min=5"`
	Category  *string `json:"category" binding:"omitempty,max=100"`
	SortOrder *int    `json:"sort_order"`
	IsActive  *bool   `json:"is_active"`
}

// ListFAQQuery adalah query string untuk GET /api/v1/faqs.
type ListFAQQuery struct {
	Category        string `form:"category"`
	Search          string `form:"search"`
	IncludeInactive bool   `form:"include_inactive"`
	Limit           int    `form:"limit"`
	Offset          int    `form:"offset"`
}

// FAQResponse adalah representasi satu FAQ di response API.
// ID bertipe string agar kontrak JSON dan Swagger tetap sederhana ("id": "uuid").
type FAQResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Question  string    `json:"question"`
	Answer    string    `json:"answer"`
	Category  string    `json:"category"`
	SortOrder int       `json:"sort_order"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ListFAQResponse adalah envelope daftar FAQ.
type ListFAQResponse struct {
	Total  int64         `json:"total"`
	Limit  int           `json:"limit"`
	Offset int           `json:"offset"`
	Data   []FAQResponse `json:"data"`
}

// FAQEnvelope adalah envelope satu FAQ (dipakai GET detail, POST, dan PUT).
type FAQEnvelope struct {
	Message string      `json:"message,omitempty" example:"FAQ berhasil dibuat"`
	Data    FAQResponse `json:"data"`
}

// FAQMessageResponse adalah respons tanpa payload data (DELETE).
type FAQMessageResponse struct {
	Message string `json:"message" example:"FAQ berhasil dihapus"`
}

// NewFAQResponse memetakan model database ke DTO response.
func NewFAQResponse(m model.FAQ) FAQResponse {
	return FAQResponse{
		ID:        m.ID.String(),
		Question:  m.Question,
		Answer:    m.Answer,
		Category:  m.Category,
		SortOrder: m.SortOrder,
		IsActive:  m.IsActive,	
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
