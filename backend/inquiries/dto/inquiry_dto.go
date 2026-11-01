// Package dto berisi kontrak request/response HTTP untuk fitur inquiries.
// Struct di sini sengaja dipisah dari model agar perubahan skema database
// tidak otomatis mengubah kontrak API.
package dto

import (
	"time"

	"winteknikmandiri-backend/inquiries/model"
)

// CreateInquiryRequest adalah body untuk POST /api/v1/inquiries.
type CreateInquiryRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=150"`
	Phone   string `json:"phone" binding:"required,min=6,max=50"`
	Service string `json:"service" binding:"required,max=100"`
	Address string `json:"address" binding:"omitempty,max=255"`
	Notes   string `json:"notes" binding:"required"`
}

// ListInquiryQuery adalah query string untuk GET /api/v1/inquiries.
type ListInquiryQuery struct {
	Limit  int `form:"limit"`
	Offset int `form:"offset"`
}

// InquiryResponse adalah representasi satu inquiry di response API.
// ID bertipe string agar kontrak JSON dan Swagger tetap sederhana ("id": "uuid").
type InquiryResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Service   string    `json:"service"`
	Address   string    `json:"address"`
	Notes     string    `json:"notes"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ListInquiryResponse menjaga kontrak lama: {total, limit, data}.
type ListInquiryResponse struct {
	Total  int64             `json:"total"`
	Limit  int               `json:"limit"`
	Data   []InquiryResponse `json:"data"`
	Offset int               `json:"offset,omitempty"`
}

// CreateInquiryResponse adalah envelope respons POST /api/v1/inquiries.
type CreateInquiryResponse struct {
	Message string          `json:"message" example:"Permohonan konsultasi berhasil disimpan"`
	Data    InquiryResponse `json:"data"`
}

// NewInquiryResponse memetakan model database ke DTO response.
func NewInquiryResponse(m model.Inquiry) InquiryResponse {
	return InquiryResponse{
		ID:        m.ID.String(),
		Name:      m.Name,
		Phone:     m.Phone,
		Service:   m.Service,
		Address:   m.Address,
		Notes:     m.Notes,
		Status:    m.Status,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
