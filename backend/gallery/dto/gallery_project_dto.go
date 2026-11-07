package dto

import "time"

// GalleryProjectResponse merepresentasikan satu item dokumentasi proyek.
type GalleryProjectResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Title     string    `json:"title" example:"Instalasi AHU Mall Galeria Bali"`
	Category  string    `json:"category" example:"Mall & Retail"`
	Client    string    `json:"client" example:"Mall Galeria Bali"`
	Scope     string    `json:"scope" example:"Air Handling Unit & Ducting"`
	Location  string    `json:"location" example:"Kuta, Bali"`
	ImageURL  string    `json:"image_url" example:"/media/wtm-media/gallery/20261107-abc.webp"`
	ImageKey  string    `json:"image_key" example:"gallery/20261107-abc.webp"`
	SortOrder int       `json:"sort_order" example:"1"`
	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CategoryCountResponse adalah informasi counter jumlah proyek per kategori untuk tab filter.
type CategoryCountResponse struct {
	Category string `json:"category" example:"Mall & Retail"`
	Count    int    `json:"count" example:"6"`
}

// GalleryBundleResponse membungkus daftar proyek dan filter tab kategori.
type GalleryBundleResponse struct {
	Total      int                      `json:"total" example:"18"`
	Categories []CategoryCountResponse  `json:"categories"`
	Items      []GalleryProjectResponse `json:"items"`
}

// GalleryBundleEnvelope membungkus respons bundle dengan pesan sukses.
type GalleryBundleEnvelope struct {
	Message string                `json:"message,omitempty"`
	Data    GalleryBundleResponse `json:"data"`
}

// GalleryProjectEnvelope membungkus satu respons proyek.
type GalleryProjectEnvelope struct {
	Message string                 `json:"message,omitempty"`
	Data    GalleryProjectResponse `json:"data"`
}

// CreateGalleryProjectRequest adalah payload penambahan dokumentasi proyek baru.
type CreateGalleryProjectRequest struct {
	Title     string `json:"title" binding:"required,min=2,max=200" example:"Instalasi AHU Mall Galeria Bali"`
	Category  string `json:"category" binding:"required,min=2,max=100" example:"Mall & Retail"`
	Client    string `json:"client" example:"Mall Galeria Bali"`
	Scope     string `json:"scope" example:"Air Handling Unit & Ducting"`
	Location  string `json:"location" example:"Kuta, Bali"`
	ImageURL  string `json:"image_url" example:"/media/wtm-media/gallery/..."`
	ImageKey  string `json:"image_key" example:"gallery/..."`
	SortOrder *int   `json:"sort_order"`
	IsActive  *bool  `json:"is_active"`
}

// UpdateGalleryProjectRequest adalah payload perubahan dokumentasi proyek.
type UpdateGalleryProjectRequest struct {
	Title     *string `json:"title" binding:"omitempty,min=2,max=200"`
	Category  *string `json:"category" binding:"omitempty,min=2,max=100"`
	Client    *string `json:"client"`
	Scope     *string `json:"scope"`
	Location  *string `json:"location"`
	ImageURL  *string `json:"image_url"`
	ImageKey  *string `json:"image_key"`
	SortOrder *int    `json:"sort_order"`
	IsActive  *bool   `json:"is_active"`
}

// GalleryMessageResponse respons sukses operasi sederhana.
type GalleryMessageResponse struct {
	Message string `json:"message"`
}

// UploadGalleryPhotoResponse hasil upload foto ke MinIO setelah auto WebP.
type UploadGalleryPhotoResponse struct {
	ImageURL     string `json:"image_url" example:"/media/wtm-media/gallery/20261107-abc.webp"`
	ImageKey     string `json:"image_key" example:"gallery/20261107-abc.webp"`
	OriginalName string `json:"original_name" example:"proyek.jpg"`
	Format       string `json:"format" example:"image/webp"`
	Size         int64  `json:"size" example:"142500"`
}
