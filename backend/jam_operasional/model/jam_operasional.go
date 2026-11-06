package model

import (
	"time"

	"github.com/google/uuid"
)

// JamOperasional merepresentasikan satu baris jadwal kerja (mis. Senin - Jumat).
type JamOperasional struct {
	ID        uuid.UUID  `json:"id"`
	DayLabel  string     `json:"day_label"`
	Hours     string     `json:"hours"`
	IsClosed  bool       `json:"is_closed"`
	SortOrder int        `json:"sort_order"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// JamOperasionalSetting merepresentasikan setting global kartu jadwal.
type JamOperasionalSetting struct {
	ID        int       `json:"id"`
	BadgeText string    `json:"badge_text"`
	Title     string    `json:"title"`
	Note      string    `json:"note"`
	UpdatedAt time.Time `json:"updated_at"`
}
