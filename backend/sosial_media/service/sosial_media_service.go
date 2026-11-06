package service

import (
	"context"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/sosial_media/dto"
	"winteknikmandiri-backend/sosial_media/model"
	"winteknikmandiri-backend/sosial_media/repository"
)

// SosialMediaService mengelola logika bisnis sosial media.
type SosialMediaService struct {
	repo *repository.SosialMediaRepository
}

// NewSosialMediaService menginisialisasi service baru.
func NewSosialMediaService(repo *repository.SosialMediaRepository) *SosialMediaService {
	return &SosialMediaService{repo: repo}
}

// List mengembalikan daftar sosial media yang sudah diformat ke DTO.
func (s *SosialMediaService) List(ctx context.Context, q dto.ListSosialMediaQuery) ([]dto.SosialMediaResponse, error) {
	items, err := s.repo.List(ctx, q)
	if err != nil {
		return nil, err
	}
	res := make([]dto.SosialMediaResponse, len(items))
	for i, it := range items {
		res[i] = toDTO(&it)
	}
	return res, nil
}

// GetByID mengambil detail satu sosial media berdasarkan ID UUID.
func (s *SosialMediaService) GetByID(ctx context.Context, idStr string) (*dto.SosialMediaResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Sosial media tidak ditemukan")
	}
	dtoRes := toDTO(it)
	return &dtoRes, nil
}

// Create membuat sosial media baru.
func (s *SosialMediaService) Create(ctx context.Context, req dto.CreateSosialMediaRequest) (*dto.SosialMediaResponse, error) {
	it, err := s.repo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	dtoRes := toDTO(it)
	return &dtoRes, nil
}

// Update memperbarui data sosial media yang ada.
func (s *SosialMediaService) Update(ctx context.Context, idStr string, req dto.UpdateSosialMediaRequest) (*dto.SosialMediaResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Sosial media tidak ditemukan")
	}

	it, err := s.repo.Update(ctx, id, req, current)
	if err != nil {
		return nil, err
	}
	dtoRes := toDTO(it)
	return &dtoRes, nil
}

// Delete melakukan soft-delete sosial media.
func (s *SosialMediaService) Delete(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return apperr.NotFound("Sosial media tidak ditemukan")
	}
	return s.repo.Delete(ctx, id)
}

func toDTO(it *model.SosialMedia) dto.SosialMediaResponse {
	return dto.SosialMediaResponse{
		ID:        it.ID.String(),
		Nama:      it.Nama,
		Link:      it.Link,
		Icon:      it.Icon,
		SortOrder: it.SortOrder,
		IsActive:  it.IsActive,
		CreatedAt: it.CreatedAt,
		UpdatedAt: it.UpdatedAt,
	}
}
