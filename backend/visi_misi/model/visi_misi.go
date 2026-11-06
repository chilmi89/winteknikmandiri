package model

import (
	"time"

	"github.com/google/uuid"
)

// VisiSetting merepresentasikan pengaturan visi perusahaan tunggal.
type VisiSetting struct {
	ID          int       `json:"id"`
	VisiEyebrow string    `json:"visi_eyebrow"`
	VisiText    string    `json:"visi_text"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Misi merepresentasikan satu kartu butir misi perusahaan.
type Misi struct {
	ID          uuid.UUID  `json:"id"`
	Code        string     `json:"code"`
	Title       string     `json:"title"`
	Tagline     string     `json:"tagline"`
	Description string     `json:"description"`
	SortOrder   int        `json:"sort_order"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}
