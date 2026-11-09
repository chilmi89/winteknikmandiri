package dto

import "time"

// CompanyStatResponse representasi JSON data statistik pencapaian.
type CompanyStatResponse struct {
	ID           string    `json:"id"`
	Label        string    `json:"label"`
	Value        string    `json:"value"`
	TargetNumber int       `json:"target_number"`
	HasPlus      bool      `json:"has_plus"`
	Keterangan   string    `json:"keterangan"`
	SortOrder    int       `json:"sort_order"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CreateCompanyStatRequest payload untuk menambah statistik baru.
type CreateCompanyStatRequest struct {
	Label        string `json:"label" binding:"required"`
	Value        string `json:"value" binding:"required"`
	TargetNumber int    `json:"target_number"`
	HasPlus      bool   `json:"has_plus"`
	Keterangan   string `json:"keterangan"`
	SortOrder    int    `json:"sort_order"`
	IsActive     *bool  `json:"is_active"`
}

// UpdateCompanyStatRequest payload untuk memperbarui data statistik.
type UpdateCompanyStatRequest struct {
	Label        *string `json:"label"`
	Value        *string `json:"value"`
	TargetNumber *int    `json:"target_number"`
	HasPlus      *bool   `json:"has_plus"`
	Keterangan   *string `json:"keterangan"`
	SortOrder    *int    `json:"sort_order"`
	IsActive     *bool   `json:"is_active"`
}

// Envelopes
type ListCompanyStatEnvelope struct {
	Message string                `json:"message,omitempty"`
	Data    []CompanyStatResponse `json:"data"`
}

type CompanyStatEnvelope struct {
	Message string              `json:"message,omitempty"`
	Data    CompanyStatResponse `json:"data"`
}

type CompanyStatMessageResponse struct {
	Message string `json:"message"`
}
