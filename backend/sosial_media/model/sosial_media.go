package model

import (
	"time"

	"github.com/google/uuid"
)

// SosialMedia merepresentasikan entitas sosial media di database PostgreSQL.
type SosialMedia struct {
	ID        uuid.UUID  `json:"id"`
	Nama      string     `json:"nama"`
	Link      string     `json:"link"`
	Icon      string     `json:"icon"`
	SortOrder int        `json:"sort_order"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}
