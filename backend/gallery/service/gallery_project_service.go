package service

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/gallery/dto"
	"winteknikmandiri-backend/gallery/model"
	"winteknikmandiri-backend/gallery/repository"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/imaging"
	"winteknikmandiri-backend/internal/storage"
)

// GalleryProjectService mengelola logika bisnis portofolio galeri.
type GalleryProjectService struct {
	repo *repository.GalleryProjectRepository
}

// NewGalleryProjectService membuat instance service baru.
func NewGalleryProjectService(repo *repository.GalleryProjectRepository) *GalleryProjectService {
	return &GalleryProjectService{repo: repo}
}

// GetBundle mengambil bundle galeri lengkap (total, kategori unik + counter, dan items).
func (s *GalleryProjectService) GetBundle(ctx context.Context, category string, includeInactive bool) (*dto.GalleryBundleResponse, error) {
	itemsModel, err := s.repo.List(ctx, category, includeInactive)
	if err != nil {
		return nil, err
	}

	catCountsModel, err := s.repo.GetCategoriesWithCount(ctx, includeInactive)
	if err != nil {
		return nil, err
	}

	itemsDTO := make([]dto.GalleryProjectResponse, len(itemsModel))
	for i, it := range itemsModel {
		itemsDTO[i] = toDTO(&it)
	}

	catDTO := make([]dto.CategoryCountResponse, len(catCountsModel))
	total := 0
	for i, c := range catCountsModel {
		catDTO[i] = dto.CategoryCountResponse{
			Category: c.Category,
			Count:    c.Count,
		}
		total += c.Count
	}

	return &dto.GalleryBundleResponse{
		Total:      total,
		Categories: catDTO,
		Items:      itemsDTO,
	}, nil
}

// GetByID mengambil detail satu proyek.
func (s *GalleryProjectService) GetByID(ctx context.Context, idStr string) (*dto.GalleryProjectResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Proyek galeri tidak ditemukan")
	}
	res := toDTO(it)
	return &res, nil
}

// Create membuat proyek baru.
func (s *GalleryProjectService) Create(ctx context.Context, req dto.CreateGalleryProjectRequest) (*dto.GalleryProjectResponse, error) {
	it, err := s.repo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	res := toDTO(it)
	return &res, nil
}

// Update memperbarui data proyek.
func (s *GalleryProjectService) Update(ctx context.Context, idStr string, req dto.UpdateGalleryProjectRequest) (*dto.GalleryProjectResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Proyek galeri tidak ditemukan")
	}

	// Jika foto diganti, hapus foto lama dari MinIO secara aman
	if req.ImageURL != nil && *req.ImageURL != "" && *req.ImageURL != current.ImageURL {
		if storage.S3Client != nil {
			_ = storage.S3Client.DeleteIfManaged(ctx, current.ImageURL)
		}
	}

	updated, err := s.repo.Update(ctx, current, req)
	if err != nil {
		return nil, err
	}
	res := toDTO(updated)
	return &res, nil
}

// Delete menghapus proyek (soft delete) dan membersihkan foto MinIO.
func (s *GalleryProjectService) Delete(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return apperr.NotFound("Proyek galeri tidak ditemukan")
	}

	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Proyek galeri tidak ditemukan")
	}

	if storage.S3Client != nil && current.ImageURL != "" {
		_ = storage.S3Client.DeleteIfManaged(ctx, current.ImageURL)
	}

	return nil
}

// UploadPhoto menerima file gambar asli (JPG, PNG, WEBP), mengonversinya ke WebP dengan kompresi,
// lalu menyimpannya langsung ke MinIO folder gallery/.
func (s *GalleryProjectService) UploadPhoto(ctx context.Context, originalFilename string, r io.Reader) (*dto.UploadGalleryPhotoResponse, error) {
	if storage.S3Client == nil {
		return nil, fmt.Errorf("layanan MinIO belum terhubung atau non-aktif")
	}

	ext := strings.ToLower(path.Ext(originalFilename))
	allowed := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
	}
	if !allowed[ext] {
		return nil, apperr.Validation("Format gambar tidak didukung", "Format yang diizinkan: JPG, JPEG, PNG, WEBP, GIF")
	}

	imgReader, size, isWebP, err := imaging.ConvertToWebP(r, 82)
	if err != nil {
		return nil, fmt.Errorf("pemrosesan gambar gagal: %w", err)
	}

	objKey, pubURL, err := storage.S3Client.UploadGalleryPhoto(ctx, originalFilename, imgReader, size, isWebP)
	if err != nil {
		return nil, fmt.Errorf("unggah ke MinIO gagal: %w", err)
	}

	format := "image/webp"
	if !isWebP {
		format = ext
	}

	return &dto.UploadGalleryPhotoResponse{
		ImageURL:     pubURL,
		ImageKey:     objKey,
		OriginalName: originalFilename,
		Format:       format,
		Size:         size,
	}, nil
}

func toDTO(m *model.GalleryProject) dto.GalleryProjectResponse {
	return dto.GalleryProjectResponse{
		ID:        m.ID.String(),
		Title:     m.Title,
		Category:  m.Category,
		Client:    m.Client,
		Scope:     m.Scope,
		Location:  m.Location,
		ImageURL:  m.ImageURL,
		ImageKey:  m.ImageKey,
		SortOrder: m.SortOrder,
		IsActive:  m.IsActive,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
