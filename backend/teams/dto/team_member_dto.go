package dto

import "time"

// TeamMemberResponse merepresentasikan data JSON anggota tim untuk klien.
type TeamMemberResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Name      string    `json:"name" example:"Team Wahyu"`
	Skill     string    `json:"skill" example:"Spesialis VRF & Unit Komersial"`
	ImageURL  string    `json:"image_url" example:"/media/wtm-media/teams/20261107-wahyu.webp"`
	ImageKey  string    `json:"image_key" example:"teams/20261107-wahyu.webp"`
	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateTeamMemberRequest payload penambahan tim baru.
type CreateTeamMemberRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=150" example:"Team Wahyu"`
	Skill    string `json:"skill" binding:"required,min=2,max=250" example:"Spesialis VRF & Unit Komersial"`
	ImageURL string `json:"image_url" example:"/media/wtm-media/teams/..."`
	ImageKey string `json:"image_key" example:"teams/..."`
	IsActive *bool  `json:"is_active"`
}

// UpdateTeamMemberRequest payload edit tim.
type UpdateTeamMemberRequest struct {
	Name     *string `json:"name" binding:"omitempty,min=2,max=150"`
	Skill    *string `json:"skill" binding:"omitempty,min=2,max=250"`
	ImageURL *string `json:"image_url"`
	ImageKey *string `json:"image_key"`
	IsActive *bool   `json:"is_active"`
}

// TeamMemberEnvelope membungkus satu item respons.
type TeamMemberEnvelope struct {
	Message string             `json:"message,omitempty"`
	Data    TeamMemberResponse `json:"data"`
}

// ListTeamMemberEnvelope membungkus daftar tim.
type ListTeamMemberEnvelope struct {
	Message string               `json:"message,omitempty"`
	Data    []TeamMemberResponse `json:"data"`
}

// TeamMemberMessageResponse respons sukses operasi sederhana.
type TeamMemberMessageResponse struct {
	Message string `json:"message"`
}

// UploadTeamPhotoResponse adalah hasil upload foto setelah auto-kompresi ke WebP.
type UploadTeamPhotoResponse struct {
	ImageURL     string `json:"image_url" example:"/media/wtm-media/teams/20261107-abc.webp"`
	ImageKey     string `json:"image_key" example:"teams/20261107-abc.webp"`
	OriginalName string `json:"original_name" example:"foto-tim.jpg"`
	Format       string `json:"format" example:"image/webp"`
	Size         int64  `json:"size" example:"142500"`
}
