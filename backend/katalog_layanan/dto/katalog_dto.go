package dto

import "time"

// ServiceCategoryResponse representasi JSON kategori layanan.
type ServiceCategoryResponse struct {
	ID        string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	Code      string    `json:"code" example:"01"`
	Name      string    `json:"name" example:"Perawatan & Cuci AC"`
	IsActive  bool      `json:"is_active" example:"true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateCategoryRequest payload pembuatan kategori.
type CreateCategoryRequest struct {
	Code     string `json:"code" binding:"required,max=10" example:"01"`
	Name     string `json:"name" binding:"required,min=2,max=100" example:"Perawatan & Cuci AC"`
	IsActive *bool  `json:"is_active"`
}

// UpdateCategoryRequest payload pembaruan kategori.
type UpdateCategoryRequest struct {
	Code     *string `json:"code" binding:"omitempty,max=10"`
	Name     *string `json:"name" binding:"omitempty,min=2,max=100"`
	IsActive *bool   `json:"is_active"`
}

// CategoryEnvelope membungkus satu kategori.
type CategoryEnvelope struct {
	Message string                  `json:"message,omitempty"`
	Data    ServiceCategoryResponse `json:"data"`
}

// ListCategoryEnvelope membungkus daftar kategori.
type ListCategoryEnvelope struct {
	Message string                    `json:"message,omitempty"`
	Data    []ServiceCategoryResponse `json:"data"`
}

// ServiceItemResponse representasi JSON kartu layanan.
type ServiceItemResponse struct {
	ID           string    `json:"id" example:"0f8fad5b-d9cb-469f-a165-70867728950e"`
	CategoryID   string    `json:"category_id" example:"c1111111-1111-1111-1111-111111111111"`
	CategoryName string    `json:"category_name,omitempty" example:"Perawatan & Cuci AC"`
	CategoryCode string    `json:"category_code,omitempty" example:"01"`
	Title        string    `json:"title" example:"Cuci AC & Deep Cleaning Higienis"`
	Description  string    `json:"description" example:"Bersih menyeluruh, bebas becek, garansi 7 hari."`
	Highlights   []string  `json:"highlights" example:"['Tanpa becek','Cek freon gratis']"`
	PricePrefix  string    `json:"price_prefix" example:"Mulai dari"`
	Price        string    `json:"price" example:"Rp 65.000"`
	Unit         string    `json:"unit" example:"/ unit"`
	PriceNote    string    `json:"price_note" example:"1,5–2 PK Rp 85.000..."`
	ImageURL     string    `json:"image_url" example:"/images/ac-split-clean.jpg"`
	ImageKey     string    `json:"image_key" example:"services/..."`
	SortOrder    int       `json:"sort_order" example:"1"`
	IsActive     bool      `json:"is_active" example:"true"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CreateItemRequest payload pembuatan layanan baru.
type CreateItemRequest struct {
	CategoryID  string   `json:"category_id" binding:"required" example:"c1111111-1111-1111-1111-111111111111"`
	Title       string   `json:"title" binding:"required,min=2,max=200" example:"Cuci AC & Deep Cleaning Higienis"`
	Description string   `json:"description" example:"Keterangan..."`
	Highlights  []string `json:"highlights"`
	PricePrefix string   `json:"price_prefix" example:"Mulai dari"`
	Price       string   `json:"price" example:"Rp 65.000"`
	Unit        string   `json:"unit" example:"/ unit"`
	PriceNote   string   `json:"price_note"`
	ImageURL    string   `json:"image_url"`
	ImageKey    string   `json:"image_key"`
	SortOrder   *int     `json:"sort_order"`
	IsActive    *bool    `json:"is_active"`
}

// UpdateItemRequest payload edit layanan.
type UpdateItemRequest struct {
	CategoryID  *string   `json:"category_id"`
	Title       *string   `json:"title" binding:"omitempty,min=2,max=200"`
	Description *string   `json:"description"`
	Highlights  *[]string `json:"highlights"`
	PricePrefix *string   `json:"price_prefix"`
	Price       *string   `json:"price"`
	Unit        *string   `json:"unit"`
	PriceNote   *string   `json:"price_note"`
	ImageURL    *string   `json:"image_url"`
	ImageKey    *string   `json:"image_key"`
	SortOrder   *int      `json:"sort_order"`
	IsActive    *bool     `json:"is_active"`
}

// ItemEnvelope membungkus satu item layanan.
type ItemEnvelope struct {
	Message string              `json:"message,omitempty"`
	Data    ServiceItemResponse `json:"data"`
}

// ListItemEnvelope membungkus list layanan.
type ListItemEnvelope struct {
	Message string                `json:"message,omitempty"`
	Data    []ServiceItemResponse `json:"data"`
}

// KatalogMessageResponse pesan sukses sederhana.
type KatalogMessageResponse struct {
	Message string `json:"message"`
}

// UploadServicePhotoResponse hasil upload foto WebP ke MinIO.
type UploadServicePhotoResponse struct {
	ImageURL     string `json:"image_url" example:"/media/wtm-media/services/20261107-abc.webp"`
	ImageKey     string `json:"image_key" example:"services/20261107-abc.webp"`
	OriginalName string `json:"original_name" example:"foto.jpg"`
	Format       string `json:"format" example:"image/webp"`
	Size         int64  `json:"size" example:"125000"`
}
