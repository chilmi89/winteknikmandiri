package dto

import "time"

// JamOperasionalItemResponse adalah respons per baris jadwal.
type JamOperasionalItemResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	DayLabel  string    `json:"day_label" example:"Senin – Jumat"`
	Hours     string    `json:"hours" example:"08.00 – 16.00"`
	IsClosed  bool      `json:"is_closed" example:"false"`
	SortOrder int       `json:"sort_order" example:"1"`
	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// JamOperasionalSettingResponse adalah respons pengaturan kartu jadwal.
type JamOperasionalSettingResponse struct {
	BadgeText string    `json:"badge_text" example:"Buka Hari Kerja"`
	Title     string    `json:"title" example:"Jam Operasional"`
	Note      string    `json:"note" example:"* Untuk mitra kontrak..."`
	UpdatedAt time.Time `json:"updated_at"`
}

// JamOperasionalBundleResponse membungkus jadwal dan setting untuk halaman web.
type JamOperasionalBundleResponse struct {
	Setting JamOperasionalSettingResponse `json:"setting"`
	Items   []JamOperasionalItemResponse  `json:"items"`
}

// JamOperasionalBundleEnvelope membungkus respons bundle dengan pesan sukses.
type JamOperasionalBundleEnvelope struct {
	Message string                       `json:"message,omitempty"`
	Data    JamOperasionalBundleResponse `json:"data"`
}

// CreateJamOperasionalRequest adalah payload penambahan baris jadwal baru.
type CreateJamOperasionalRequest struct {
	DayLabel  string `json:"day_label" binding:"required,min=2,max=100" example:"Senin – Jumat"`
	Hours     string `json:"hours" binding:"required,min=2,max=100" example:"08.00 – 16.00"`
	IsClosed  *bool  `json:"is_closed"`
	SortOrder *int   `json:"sort_order"`
	IsActive  *bool  `json:"is_active"`
}

// UpdateJamOperasionalRequest adalah payload perubahan baris jadwal.
type UpdateJamOperasionalRequest struct {
	DayLabel  *string `json:"day_label" binding:"omitempty,min=2,max=100"`
	Hours     *string `json:"hours" binding:"omitempty,min=2,max=100"`
	IsClosed  *bool   `json:"is_closed"`
	SortOrder *int    `json:"sort_order"`
	IsActive  *bool   `json:"is_active"`
}

// UpdateJamOperasionalSettingRequest adalah payload perubahan setting kartu jadwal.
type UpdateJamOperasionalSettingRequest struct {
	BadgeText *string `json:"badge_text" binding:"omitempty,max=100"`
	Title     *string `json:"title" binding:"omitempty,max=100"`
	Note      *string `json:"note"`
}

// JamOperasionalItemEnvelope membungkus satu item jadwal.
type JamOperasionalItemEnvelope struct {
	Message string                     `json:"message,omitempty"`
	Data    JamOperasionalItemResponse `json:"data"`
}

// JamOperasionalSettingEnvelope membungkus respons setting.
type JamOperasionalSettingEnvelope struct {
	Message string                        `json:"message,omitempty"`
	Data    JamOperasionalSettingResponse `json:"data"`
}

// JamOperasionalMessageResponse respons sukses operasi.
type JamOperasionalMessageResponse struct {
	Message string `json:"message"`
}
