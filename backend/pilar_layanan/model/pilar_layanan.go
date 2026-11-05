package model

import (
	"time"

	"github.com/google/uuid"
)

// PilarLayanan merepresentasikan entitas pilar layanan di database PostgreSQL.
type PilarLayanan struct {
	ID          uuid.UUID  `json:"id"`
	Code        string     `json:"code"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	LinkURL     string     `json:"link_url"`
	IsFeatured  bool       `json:"is_featured"`
	CTAText     string     `json:"cta_text"`
	SortOrder   int        `json:"sort_order"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}
