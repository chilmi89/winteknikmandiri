package model

import (
	"time"

	"github.com/google/uuid"
)

// GalleryProject merepresentasikan entitas dokumentasi proyek pada database PostgreSQL.
type GalleryProject struct {
	ID        uuid.UUID  `json:"id"`
	Title     string     `json:"title"`
	Category  string     `json:"category"`
	Client    string     `json:"client"`
	Scope     string     `json:"scope"`
	Location  string     `json:"location"`
	ImageURL  string     `json:"image_url"`
	ImageKey  string     `json:"image_key"`
	SortOrder int        `json:"sort_order"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// CategoryCount merepresentasikan jumlah item per kategori proyek.
type CategoryCount struct {
	Category string `json:"category"`
	Count    int    `json:"count"`
}
