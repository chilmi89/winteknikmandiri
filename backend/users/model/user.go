package model

import (
	"time"

	"github.com/google/uuid"
)

// User merepresentasikan entitas pengguna / admin sistem pada database PostgreSQL.
type User struct {
	ID           uuid.UUID  `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	Name         string     `json:"name"`
	PasswordHash string     `json:"-"` // Jangan pernah diekspos ke JSON response
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}
