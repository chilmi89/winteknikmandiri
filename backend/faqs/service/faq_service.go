// Package service berisi logika bisnis fitur FAQ.
package service

import (
	"context"
	"errors"

	"winteknikmandiri-backend/faqs/dto"
	"winteknikmandiri-backend/faqs/model"
	"winteknikmandiri-backend/faqs/repository"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/database"
)

const (
	defaultLimit = 20
	maxLimit     = 100
)

// FAQService mengorkestrasi repository FAQ dan aturan bisnisnya.
type FAQService struct {
	repo repository.FAQRepository
}

// NewFAQService membuat service FAQ.
func NewFAQService(repo repository.FAQRepository) *FAQService {
	return &FAQService{repo: repo}
}

// Create menyimpan FAQ baru. FAQ aktif secara default bila is_active tidak dikirim.
func (s *FAQService) Create(ctx context.Context, req dto.CreateFAQRequest) (dto.FAQResponse, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	faq := &model.FAQ{
		Question:  req.Question,
		Answer:    req.Answer,
		Category:  req.Category,
		SortOrder: req.SortOrder,
		IsActive:  isActive,
	}

	if err := s.repo.Create(ctx, faq); err != nil {
		return dto.FAQResponse{}, mapRepoError(err)
	}
	return dto.NewFAQResponse(*faq), nil
}

// Get mengambil satu FAQ berdasarkan ID.
func (s *FAQService) Get(ctx context.Context, id int64) (dto.FAQResponse, error) {
	faq, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return dto.FAQResponse{}, mapRepoError(err)
	}
	return dto.NewFAQResponse(*faq), nil
}

// List mengembalikan daftar FAQ dengan filter dan pagination.
func (s *FAQService) List(ctx context.Context, q dto.ListFAQQuery) (dto.ListFAQResponse, error) {
	limit, offset := normalizePagination(q.Limit, q.Offset)

	rows, total, err := s.repo.List(ctx, repository.ListFilter{
		Category:   q.Category,
		Search:     q.Search,
		OnlyActive: !q.IncludeInactive,
		Limit:      limit,
		Offset:     offset,
	})
	if err != nil {
		return dto.ListFAQResponse{}, mapRepoError(err)
	}

	data := make([]dto.FAQResponse, 0, len(rows))
	for _, row := range rows {
		data = append(data, dto.NewFAQResponse(row))
	}

	return dto.ListFAQResponse{
		Total:  total,
		Limit:  limit,
		Offset: offset,
		Data:   data,
	}, nil
}

// Update memperbarui FAQ. Field opsional yang tidak dikirim mempertahankan
// nilai sebelumnya.
func (s *FAQService) Update(ctx context.Context, id int64, req dto.UpdateFAQRequest) (dto.FAQResponse, error) {
	faq, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return dto.FAQResponse{}, mapRepoError(err)
	}

	faq.Question = req.Question
	faq.Answer = req.Answer
	if req.Category != nil {
		faq.Category = *req.Category
	}
	if req.SortOrder != nil {
		faq.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		faq.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, faq); err != nil {
		return dto.FAQResponse{}, mapRepoError(err)
	}
	return dto.NewFAQResponse(*faq), nil
}

// Delete melakukan soft delete pada FAQ.
func (s *FAQService) Delete(ctx context.Context, id int64) error {
	if err := s.repo.SoftDelete(ctx, id); err != nil {
		return mapRepoError(err)
	}
	return nil
}

func normalizePagination(limit, offset int) (int, int) {
	if limit <= 0 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	if offset < 0 {
		offset = 0
	}
	return limit, offset
}

func mapRepoError(err error) error {
	switch {
	case errors.Is(err, database.ErrUnavailable):
		return apperr.Unavailable("Database tidak terhubung")
	case errors.Is(err, repository.ErrNotFound):
		return apperr.NotFound("FAQ tidak ditemukan")
	default:
		return apperr.Internal(err)
	}
}
