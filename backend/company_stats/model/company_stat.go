package model

import (
	"time"

	"github.com/google/uuid"
)

// CompanyStat merepresentasikan satu data angka pencapaian / statistik perusahaan.
type CompanyStat struct {
	ID           uuid.UUID  `json:"id"`
	Label        string     `json:"label"`
	Value        string     `json:"value"`
	TargetNumber int        `json:"target_number"`
	HasPlus      bool       `json:"has_plus"`
	Keterangan   string     `json:"keterangan"`
	SortOrder    int        `json:"sort_order"`
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}
