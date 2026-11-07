package service

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/imaging"
	"winteknikmandiri-backend/internal/storage"
	"winteknikmandiri-backend/katalog_layanan/dto"
	"winteknikmandiri-backend/katalog_layanan/model"
	"winteknikmandiri-backend/katalog_layanan/repository"
)

// KatalogService mengelola logika bisnis kategori dan item layanan.
type KatalogService struct {
	repo *repository.KatalogRepository
}

// NewKatalogService membuat service baru.
func NewKatalogService(repo *repository.KatalogRepository) *KatalogService {
	return &KatalogService{repo: repo}
}

// ---------- CATEGORY SERVICE ----------

func (s *KatalogService) ListCategories(ctx context.Context, includeInactive bool) ([]dto.ServiceCategoryResponse, error) {
	items, err := s.repo.ListCategories(ctx, includeInactive)
	if err != nil {
		return nil, err
	}
	res := make([]dto.ServiceCategoryResponse, len(items))
	for i, it := range items {
		res[i] = dto.ServiceCategoryResponse{
			ID:        it.ID.String(),
			Code:      it.Code,
			Name:      it.Name,
			IsActive:  it.IsActive,
			CreatedAt: it.CreatedAt,
			UpdatedAt: it.UpdatedAt,
		}
	}
	return res, nil
}

func (s *KatalogService) CreateCategory(ctx context.Context, req dto.CreateCategoryRequest) (*dto.ServiceCategoryResponse, error) {
	it, err := s.repo.CreateCategory(ctx, req)
	if err != nil {
		return nil, err
	}
	return &dto.ServiceCategoryResponse{
		ID:        it.ID.String(),
		Code:      it.Code,
		Name:      it.Name,
		IsActive:  it.IsActive,
		CreatedAt: it.CreatedAt,
		UpdatedAt: it.UpdatedAt,
	}, nil
}

func (s *KatalogService) UpdateCategory(ctx context.Context, idStr string, req dto.UpdateCategoryRequest) (*dto.ServiceCategoryResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetCategoryByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Kategori layanan tidak ditemukan")
	}
	it, err := s.repo.UpdateCategory(ctx, current, req)
	if err != nil {
		return nil, err
	}
	return &dto.ServiceCategoryResponse{
		ID:        it.ID.String(),
		Code:      it.Code,
		Name:      it.Name,
		IsActive:  it.IsActive,
		CreatedAt: it.CreatedAt,
		UpdatedAt: it.UpdatedAt,
	}, nil
}

func (s *KatalogService) DeleteCategory(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	deleted, err := s.repo.DeleteCategory(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Kategori layanan tidak ditemukan")
	}
	return nil
}

// ---------- ITEM SERVICE ----------

func (s *KatalogService) ListItems(ctx context.Context, categoryID string, includeInactive bool) ([]dto.ServiceItemResponse, error) {
	items, err := s.repo.ListItems(ctx, categoryID, includeInactive)
	if err != nil {
		return nil, err
	}
	res := make([]dto.ServiceItemResponse, len(items))
	for i, it := range items {
		res[i] = toItemDTO(&it)
	}
	return res, nil
}

func (s *KatalogService) GetItemByID(ctx context.Context, idStr string) (*dto.ServiceItemResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetItemByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Item layanan tidak ditemukan")
	}
	dtoRes := toItemDTO(it)
	return &dtoRes, nil
}

func (s *KatalogService) CreateItem(ctx context.Context, req dto.CreateItemRequest) (*dto.ServiceItemResponse, error) {
	catUUID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return nil, apperr.Validation("Format category_id tidak valid (harus UUID)", err.Error())
	}
	cat, err := s.repo.GetCategoryByID(ctx, catUUID)
	if err != nil {
		return nil, err
	}
	if cat == nil {
		return nil, apperr.NotFound("Kategori layanan yang dipilih tidak ditemukan")
	}

	it, err := s.repo.CreateItem(ctx, catUUID, req)
	if err != nil {
		return nil, err
	}
	it.CategoryName = cat.Name
	it.CategoryCode = cat.Code
	dtoRes := toItemDTO(it)
	return &dtoRes, nil
}

func (s *KatalogService) UpdateItem(ctx context.Context, idStr string, req dto.UpdateItemRequest) (*dto.ServiceItemResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetItemByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Item layanan tidak ditemukan")
	}

	catUUID := current.CategoryID
	if req.CategoryID != nil && *req.CategoryID != "" {
		parsedCat, err := uuid.Parse(*req.CategoryID)
		if err != nil {
			return nil, apperr.Validation("Format category_id tidak valid (harus UUID)", err.Error())
		}
		catUUID = parsedCat
	}

	// Bersihkan foto lama jika ada perubahan foto
	if req.ImageURL != nil && *req.ImageURL != "" && *req.ImageURL != current.ImageURL {
		if storage.S3Client != nil {
			_ = storage.S3Client.DeleteIfManaged(ctx, current.ImageURL)
		}
	}

	it, err := s.repo.UpdateItem(ctx, current, catUUID, req)
	if err != nil {
		return nil, err
	}

	cat, _ := s.repo.GetCategoryByID(ctx, catUUID)
	if cat != nil {
		it.CategoryName = cat.Name
		it.CategoryCode = cat.Code
	}

	dtoRes := toItemDTO(it)
	return &dtoRes, nil
}

func (s *KatalogService) DeleteItem(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetItemByID(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return apperr.NotFound("Item layanan tidak ditemukan")
	}

	deleted, err := s.repo.DeleteItem(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Item layanan tidak ditemukan")
	}

	if storage.S3Client != nil && current.ImageURL != "" {
		_ = storage.S3Client.DeleteIfManaged(ctx, current.ImageURL)
	}

	return nil
}

func (s *KatalogService) UploadPhoto(ctx context.Context, originalFilename string, r io.Reader) (*dto.UploadServicePhotoResponse, error) {
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

	objKey, pubURL, err := storage.S3Client.UploadServicePhoto(ctx, originalFilename, imgReader, size, isWebP)
	if err != nil {
		return nil, fmt.Errorf("unggah ke MinIO gagal: %w", err)
	}

	format := "image/webp"
	if !isWebP {
		format = ext
	}

	return &dto.UploadServicePhotoResponse{
		ImageURL:     pubURL,
		ImageKey:     objKey,
		OriginalName: originalFilename,
		Format:       format,
		Size:         size,
	}, nil
}

func toItemDTO(m *model.ServiceItem) dto.ServiceItemResponse {
	return dto.ServiceItemResponse{
		ID:           m.ID.String(),
		CategoryID:   m.CategoryID.String(),
		CategoryName: m.CategoryName,
		CategoryCode: m.CategoryCode,
		Title:        m.Title,
		Description:  m.Description,
		Highlights:   m.Highlights,
		PricePrefix:  m.PricePrefix,
		Price:        m.Price,
		Unit:         m.Unit,
		PriceNote:    m.PriceNote,
		ImageURL:     m.ImageURL,
		ImageKey:     m.ImageKey,
		SortOrder:    m.SortOrder,
		IsActive:     m.IsActive,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}
