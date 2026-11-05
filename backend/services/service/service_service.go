// Package service mengimplementasikan use case dan logika bisnis untuk Layanan.
package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/database"
	"winteknikmandiri-backend/internal/storage"
	"winteknikmandiri-backend/services/dto"
	"winteknikmandiri-backend/services/model"
	"winteknikmandiri-backend/services/repository"
)

var slugRegex = regexp.MustCompile(`[^a-z0-9]+`)

// ServiceService mengoordinasikan operasi bisnis Layanan dan penyimpanan MinIO.
type ServiceService struct {
	repo    repository.ServiceRepository
	storage *storage.Client
}

// NewServiceService membuat instance baru ServiceService.
func NewServiceService(repo repository.ServiceRepository) *ServiceService {
	return &ServiceService{
		repo:    repo,
		storage: storage.S3Client,
	}
}

// List mengambil daftar layanan dengan filter dan pagination.
func (s *ServiceService) List(ctx context.Context, query dto.ListServiceQuery) (*dto.ListServiceResponse, error) {
	filter := repository.ListFilter{
		Category:   strings.TrimSpace(query.Category),
		Search:     strings.TrimSpace(query.Search),
		OnlyActive: !query.IncludeInactive,
		Limit:      query.Limit,
		Offset:     query.Offset,
	}

	items, total, err := s.repo.List(ctx, filter)
	if err != nil {
		if errors.Is(err, database.ErrUnavailable) {
			return nil, apperr.Unavailable("Database tidak terhubung")
		}
		return nil, fmt.Errorf("service list: %w", err)
	}

	respData := make([]dto.ServiceResponse, len(items))
	for i, item := range items {
		respData[i] = dto.NewServiceResponse(item)
	}

	limit := query.Limit
	if limit <= 0 {
		limit = 20
	}

	return &dto.ListServiceResponse{
		Total:  total,
		Limit:  limit,
		Offset: query.Offset,
		Data:   respData,
	}, nil
}

// Get mengambil detail satu layanan berdasarkan UUID.
func (s *ServiceService) Get(ctx context.Context, id uuid.UUID) (*dto.ServiceResponse, error) {
	item, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, apperr.NotFound("Layanan tidak ditemukan")
		}
		if errors.Is(err, database.ErrUnavailable) {
			return nil, apperr.Unavailable("Database tidak terhubung")
		}
		return nil, fmt.Errorf("service get: %w", err)
	}

	res := dto.NewServiceResponse(*item)
	return &res, nil
}

// GetBySlug mengambil detail layanan berdasarkan slug (untuk halaman publik).
func (s *ServiceService) GetBySlug(ctx context.Context, slug string) (*dto.ServiceResponse, error) {
	item, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, apperr.NotFound("Layanan tidak ditemukan")
		}
		if errors.Is(err, database.ErrUnavailable) {
			return nil, apperr.Unavailable("Database tidak terhubung")
		}
		return nil, fmt.Errorf("service get by slug: %w", err)
	}

	res := dto.NewServiceResponse(*item)
	return &res, nil
}

// Create membuat layanan baru.
func (s *ServiceService) Create(ctx context.Context, req dto.CreateServiceRequest) (*dto.ServiceResponse, error) {
	slug := sanitizeSlug(req.Slug)
	if slug == "" {
		slug = slugify(req.Title)
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	pricePrefix := strings.TrimSpace(req.PricePrefix)
	if pricePrefix == "" {
		pricePrefix = "Mulai dari"
	}

	unit := strings.TrimSpace(req.Unit)
	if unit == "" {
		unit = "/ unit"
	}

	highlights := req.Highlights
	if highlights == nil {
		highlights = []string{}
	}

	item := &model.Service{
		Slug:        slug,
		Title:       strings.TrimSpace(req.Title),
		Category:    strings.TrimSpace(req.Category),
		PricePrefix: pricePrefix,
		Price:       req.Price,
		Unit:        unit,
		PriceNote:   strings.TrimSpace(req.PriceNote),
		ImageURL:    strings.TrimSpace(req.ImageURL),
		ImageKey:    strings.TrimSpace(req.ImageKey),
		Summary:     strings.TrimSpace(req.Summary),
		Highlights:  highlights,
		SortOrder:   req.SortOrder,
		IsActive:    isActive,
	}

	if err := s.repo.Create(ctx, item); err != nil {
		if errors.Is(err, database.ErrUnavailable) {
			return nil, apperr.Unavailable("Database tidak terhubung")
		}
		return nil, fmt.Errorf("service create: %w", err)
	}

	res := dto.NewServiceResponse(*item)
	return &res, nil
}

// Update memperbarui data layanan yang ada.
func (s *ServiceService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateServiceRequest) (*dto.ServiceResponse, error) {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, apperr.NotFound("Layanan tidak ditemukan")
		}
		if errors.Is(err, database.ErrUnavailable) {
			return nil, apperr.Unavailable("Database tidak terhubung")
		}
		return nil, fmt.Errorf("service update find: %w", err)
	}

	existing.Title = strings.TrimSpace(req.Title)

	if req.Slug != nil {
		newSlug := sanitizeSlug(*req.Slug)
		if newSlug != "" {
			existing.Slug = newSlug
		}
	}
	if req.Category != nil {
		existing.Category = strings.TrimSpace(*req.Category)
	}
	if req.PricePrefix != nil {
		existing.PricePrefix = strings.TrimSpace(*req.PricePrefix)
	}
	if req.Price != nil {
		existing.Price = req.Price
	}
	if req.Unit != nil {
		existing.Unit = strings.TrimSpace(*req.Unit)
	}
	if req.PriceNote != nil {
		existing.PriceNote = strings.TrimSpace(*req.PriceNote)
	}
	if req.ImageURL != nil {
		existing.ImageURL = strings.TrimSpace(*req.ImageURL)
	}
	if req.ImageKey != nil {
		existing.ImageKey = strings.TrimSpace(*req.ImageKey)
	}
	if req.Summary != nil {
		existing.Summary = strings.TrimSpace(*req.Summary)
	}
	if req.Highlights != nil {
		existing.Highlights = *req.Highlights
	}
	if req.SortOrder != nil {
		existing.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, existing); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, apperr.NotFound("Layanan tidak ditemukan")
		}
		if errors.Is(err, database.ErrUnavailable) {
			return nil, apperr.Unavailable("Database tidak terhubung")
		}
		return nil, fmt.Errorf("service update save: %w", err)
	}

	res := dto.NewServiceResponse(*existing)
	return &res, nil
}

// Delete melakukan soft-delete layanan.
func (s *ServiceService) Delete(ctx context.Context, id uuid.UUID) error {
	err := s.repo.SoftDelete(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return apperr.NotFound("Layanan tidak ditemukan")
		}
		if errors.Is(err, database.ErrUnavailable) {
			return apperr.Unavailable("Database tidak terhubung")
		}
		return fmt.Errorf("service delete: %w", err)
	}
	return nil
}

// UploadImage mengunggah foto layanan ke MinIO Storage (bucket wtm-media, prefix services/).
func (s *ServiceService) UploadImage(
	ctx context.Context,
	filename string,
	reader io.Reader,
	size int64,
	contentType string,
) (*dto.UploadImageResponse, error) {
	storageClient := s.storage
	if storageClient == nil {
		storageClient = storage.S3Client
	}
	if storageClient == nil {
		return nil, apperr.Unavailable("MinIO Object Storage tidak tersedia")
	}

	objectKey, publicURL, err := storageClient.UploadServicePhoto(ctx, filename, reader, size, contentType)
	if err != nil {
		return nil, fmt.Errorf("gagal upload foto layanan ke storage: %w", err)
	}

	return &dto.UploadImageResponse{
		ImageURL:     publicURL,
		ImageKey:     objectKey,
		OriginalName: filename,
	}, nil
}

func slugify(text string) string {
	lower := strings.ToLower(strings.TrimSpace(text))
	slug := slugRegex.ReplaceAllString(lower, "-")
	return strings.Trim(slug, "-")
}

func sanitizeSlug(text string) string {
	lower := strings.ToLower(strings.TrimSpace(text))
	slug := slugRegex.ReplaceAllString(lower, "-")
	return strings.Trim(slug, "-")
}
