package dto

import "time"

// VisiSettingResponse merepresentasikan response JSON untuk visi perusahaan.
type VisiSettingResponse struct {
	VisiEyebrow string    `json:"visi_eyebrow" example:"Visi Perusahaan"`
	VisiText    string    `json:"visi_text" example:"Menghadirkan layanan tata udara..."`
	UpdatedAt   time.Time `json:"updated_at"`
}

// MisiResponse merepresentasikan response JSON untuk satu butir kartu misi.
type MisiResponse struct {
	ID          string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Code        string    `json:"code" example:"01"`
	Title       string    `json:"title" example:"Layanan Prima"`
	Tagline     string    `json:"tagline" example:"Presisi & Tepat Waktu"`
	Description string    `json:"description" example:"Menghadirkan pengerjaan..."`
	SortOrder   int       `json:"sort_order" example:"1"`
	IsActive    bool      `json:"is_active" example:"true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// VisiMisiBundleResponse menggabungkan visi dan seluruh misi untuk konsumsi halaman web.
type VisiMisiBundleResponse struct {
	Visi VisiSettingResponse `json:"visi"`
	Misi []MisiResponse      `json:"misi"`
}

// VisiMisiBundleEnvelope membungkus bundle visi misi.
type VisiMisiBundleEnvelope struct {
	Message string                 `json:"message,omitempty"`
	Data    VisiMisiBundleResponse `json:"data"`
}

// UpdateVisiRequest merepresentasikan payload update teks visi.
type UpdateVisiRequest struct {
	VisiEyebrow *string `json:"visi_eyebrow" binding:"omitempty,max=100"`
	VisiText    string  `json:"visi_text" binding:"required,min=5"`
}

// CreateMisiRequest merepresentasikan payload pembuatan butir misi baru.
type CreateMisiRequest struct {
	Code        string `json:"code" binding:"max=10" example:"01"`
	Title       string `json:"title" binding:"required,min=2,max=150" example:"Layanan Prima"`
	Tagline     string `json:"tagline" binding:"max=150" example:"Presisi & Tepat Waktu"`
	Description string `json:"description" binding:"required,min=5"`
	SortOrder   *int   `json:"sort_order"`
	IsActive    *bool  `json:"is_active"`
}

// UpdateMisiRequest merepresentasikan payload perubahan butir misi.
type UpdateMisiRequest struct {
	Code        *string `json:"code" binding:"omitempty,max=10"`
	Title       *string `json:"title" binding:"omitempty,min=2,max=150"`
	Tagline     *string `json:"tagline" binding:"omitempty,max=150"`
	Description *string `json:"description"`
	SortOrder   *int    `json:"sort_order"`
	IsActive    *bool   `json:"is_active"`
}

// MisiEnvelope membungkus satu response misi.
type MisiEnvelope struct {
	Message string       `json:"message,omitempty"`
	Data    MisiResponse `json:"data"`
}

// VisiEnvelope membungkus setting visi.
type VisiEnvelope struct {
	Message string              `json:"message,omitempty"`
	Data    VisiSettingResponse `json:"data"`
}

// VisiMisiMessageResponse merepresentasikan pesan sukses.
type VisiMisiMessageResponse struct {
	Message string `json:"message"`
}
