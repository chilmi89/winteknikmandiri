// Package service berisi logika bisnis fitur inquiries.
package service

import (
	"context"
	"errors"

	"winteknikmandiri-backend/inquiries/dto"
	"winteknikmandiri-backend/inquiries/model"
	"winteknikmandiri-backend/inquiries/repository"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/database"
)

const (
	defaultLimit = 20
	maxLimit     = 100
)

// InquiryService mengorkestrasi repository dan aturan bisnis inquiry.
type InquiryService struct {
	repo repository.InquiryRepository
}

// NewInquiryService membuat service inquiry.
func NewInquiryService(repo repository.InquiryRepository) *InquiryService {
	return &InquiryService{repo: repo}
}

// Create menyimpan permohonan baru dengan status awal "pending".
func (s *InquiryService) Create(ctx context.Context, req dto.CreateInquiryRequest) (dto.InquiryResponse, error) {
	in := &model.Inquiry{
		Name:    req.Name,
		Phone:   req.Phone,
		Service: req.Service,
		Address: req.Address,
		Notes:   req.Notes,
		Status:  model.StatusPending,
	}

	if err := s.repo.Create(ctx, in); err != nil {
		return dto.InquiryResponse{}, mapRepoError(err)
	}
	return dto.NewInquiryResponse(*in), nil
}

// List mengembalikan daftar inquiry dengan pagination yang sudah dinormalisasi.
func (s *InquiryService) List(ctx context.Context, q dto.ListInquiryQuery) (dto.ListInquiryResponse, error) {
	limit, offset := normalizePagination(q.Limit, q.Offset)

	total, err := s.repo.Count(ctx)
	if err != nil {
		return dto.ListInquiryResponse{}, mapRepoError(err)
	}

	rows, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return dto.ListInquiryResponse{}, mapRepoError(err)
	}

	data := make([]dto.InquiryResponse, 0, len(rows))
	for _, row := range rows {
		data = append(data, dto.NewInquiryResponse(row))
	}

	return dto.ListInquiryResponse{
		Total:  total,
		Limit:  limit,
		Data:   data,
		Offset: offset,
	}, nil
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
	if errors.Is(err, database.ErrUnavailable) {
		return apperr.Unavailable("Database tidak terhubung")
	}
	return apperr.Internal(err)
}
