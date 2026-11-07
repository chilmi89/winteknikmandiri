package model

import (
	"time"

	"github.com/google/uuid"
)

// TeamMember merepresentasikan entitas anggota tim pada database PostgreSQL.
// Super minimalis: nama, skill, dan foto WebP.
type TeamMember struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Skill     string     `json:"skill"`
	ImageURL  string     `json:"image_url"`
	ImageKey  string     `json:"image_key"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}
