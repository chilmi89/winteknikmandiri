// Package model merepresentasikan entitas layanan pada database.
package model

import (
	"time"

	"github.com/google/uuid"
)

// Service merepresentasikan satu layanan tata udara/AC yang dikelola di dashboard dan tampil di web.
type Service struct {
	ID          uuid.UUID  `json:"id"`
	Slug        string     `json:"slug"`
	Title       string     `json:"title"`
	Category    string     `json:"category"`
	PricePrefix string     `json:"price_prefix"`
	Price       *string    `json:"price"`
	Unit        string     `json:"unit"`
	PriceNote   string     `json:"price_note"`
	ImageURL    string     `json:"image_url"`
	ImageKey    string     `json:"image_key"`
	Summary     string     `json:"summary"`
	Highlights  []string   `json:"highlights"`
	SortOrder   int        `json:"sort_order"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"-"`
}
