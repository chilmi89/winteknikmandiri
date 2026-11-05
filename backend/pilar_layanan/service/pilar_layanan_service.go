package service

import (
	"context"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/pilar_layanan/dto"
	"winteknikmandiri-backend/pilar_layanan/model"
	"winteknikmandiri-backend/pilar_layanan/repository"
)

// PilarLayananService mengelola logika bisnis pilar layanan.
type PilarLayananService struct {
	repo *repository.PilarLayananRepository
}

// NewPilarLayananService menginisialisasi service baru.
func NewPilarLayananService(repo *repository.PilarLayananRepository) *PilarLayananService {
	return &PilarLayananService{repo: repo}
}

// List mengembalikan daftar pilar layanan yang sudah diformat ke DTO.
func (s *PilarLayananService) List(ctx context.Context, q dto.ListPilarLayananQuery) ([]dto.PilarLayananResponse, error) {
	items, err := s.repo.List(ctx, q)
	if err != nil {
		return nil, err
	}
	res := make([]dto.PilarLayananResponse, len(items))
	for i, it := range items {
		res[i] = toDTO(&it)
	}
	return res, nil
}

// GetByID mengambil detail satu pilar layanan berdasarkan ID UUID.
func (s *PilarLayananService) GetByID(ctx context.Context, idStr string) (*dto.PilarLayananResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Pilar layanan tidak ditemukan")
	}
	dtoRes := toDTO(it)
	return &dtoRes, nil
}

// Create membuat pilar layanan baru.
func (s *PilarLayananService) Create(ctx context.Context, req dto.CreatePilarLayananRequest) (*dto.PilarLayananResponse, error) {
	it, err := s.repo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	dtoRes := toDTO(it)
	return &dtoRes, nil
}

// Update memperbarui data pilar layanan yang ada.
func (s *PilarLayananService) Update(ctx context.Context, idStr string, req dto.UpdatePilarLayananRequest) (*dto.PilarLayananResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Pilar layanan tidak ditemukan")
	}
	updated, err := s.repo.Update(ctx, current, req)
	if err != nil {
		return nil, err
	}
	dtoRes := toDTO(updated)
	return &dtoRes, nil
}

// Delete menghapus pilar layanan (soft delete).
func (s *PilarLayananService) Delete(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Pilar layanan tidak ditemukan")
	}
	return nil
}

func toDTO(m *model.PilarLayanan) dto.PilarLayananResponse {
	return dto.PilarLayananResponse{
		ID:          m.ID.String(),
		Code:        m.Code,
		Title:       m.Title,
		Description: m.Description,
		LinkURL:     m.LinkURL,
		IsFeatured:  m.IsFeatured,
		CTAText:     m.CTAText,
		SortOrder:   m.SortOrder,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
