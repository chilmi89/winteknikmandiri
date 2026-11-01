// Package model berisi representasi tabel faqs di database.
package model

import "time"

// FAQ adalah satu pasangan pertanyaan-jawaban yang tampil di landing page.
type FAQ struct {
	ID        int64      `json:"id"`
	Question  string     `json:"question"`
	Answer    string     `json:"answer"`
	Category  string     `json:"category"`
	SortOrder int        `json:"sort_order"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-"`
}
