package model

import (
	"time"

	"github.com/google/uuid"
)

// ServiceCategory merepresentasikan entitas kategori layanan.
type ServiceCategory struct {
	ID        uuid.UUID  `json:"id"`
	Code      string     `json:"code"`
	Name      string     `json:"name"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// ServiceItem merepresentasikan entitas kartu layanan individual.
type ServiceItem struct {
	ID           uuid.UUID  `json:"id"`
	CategoryID   uuid.UUID  `json:"category_id"`
	CategoryName string     `json:"category_name,omitempty"`
	CategoryCode string     `json:"category_code,omitempty"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Highlights   []string   `json:"highlights"`
	PricePrefix  string     `json:"price_prefix"`
	Price        string     `json:"price"`
	Unit         string     `json:"unit"`
	PriceNote    string     `json:"price_note"`
	ImageURL     string     `json:"image_url"`
	ImageKey     string     `json:"image_key"`
	SortOrder    int        `json:"sort_order"`
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}
