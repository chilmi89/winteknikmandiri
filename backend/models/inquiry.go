package models

import (
	"time"

	"gorm.io/gorm"
)

// Inquiry represents customer service/consultation requests submitted from website
type Inquiry struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:150;not null" json:"name" binding:"required"`
	Phone     string         `gorm:"size:50;not null" json:"phone" binding:"required"`
	Service   string         `gorm:"size:100;not null" json:"service" binding:"required"`
	Address   string         `gorm:"size:255" json:"address"`
	Notes     string         `gorm:"type:text;not null" json:"notes" binding:"required"`
	Status    string         `gorm:"size:30;default:'pending'" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
