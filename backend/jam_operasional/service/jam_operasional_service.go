package service

import (
	"context"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/jam_operasional/dto"
	"winteknikmandiri-backend/jam_operasional/model"
	"winteknikmandiri-backend/jam_operasional/repository"
)

// JamOperasionalService menangani logika bisnis jam operasional.
type JamOperasionalService struct {
	repo *repository.JamOperasionalRepository
}

// NewJamOperasionalService menginisialisasi service baru.
func NewJamOperasionalService(repo *repository.JamOperasionalRepository) *JamOperasionalService {
	return &JamOperasionalService{repo: repo}
}

// GetBundle mengambil bundle setting + items untuk frontend & dashboard.
func (s *JamOperasionalService) GetBundle(ctx context.Context, includeInactive bool) (*dto.JamOperasionalBundleResponse, error) {
	settingModel, err := s.repo.GetSetting(ctx)
	if err != nil {
		return nil, err
	}

	itemsModel, err := s.repo.List(ctx, includeInactive)
	if err != nil {
		return nil, err
	}

	itemsDTO := make([]dto.JamOperasionalItemResponse, len(itemsModel))
	for i, it := range itemsModel {
		itemsDTO[i] = toItemDTO(&it)
	}

	return &dto.JamOperasionalBundleResponse{
		Setting: toSettingDTO(settingModel),
		Items:   itemsDTO,
	}, nil
}

// GetByID mengambil satu item jadwal.
func (s *JamOperasionalService) GetByID(ctx context.Context, idStr string) (*dto.JamOperasionalItemResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Jam operasional tidak ditemukan")
	}
	res := toItemDTO(it)
	return &res, nil
}

// Create membuat baris jadwal baru.
func (s *JamOperasionalService) Create(ctx context.Context, req dto.CreateJamOperasionalRequest) (*dto.JamOperasionalItemResponse, error) {
	it, err := s.repo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	res := toItemDTO(it)
	return &res, nil
}

// Update memperbarui baris jadwal.
func (s *JamOperasionalService) Update(ctx context.Context, idStr string, req dto.UpdateJamOperasionalRequest) (*dto.JamOperasionalItemResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Jam operasional tidak ditemukan")
	}
	updated, err := s.repo.Update(ctx, current, req)
	if err != nil {
		return nil, err
	}
	res := toItemDTO(updated)
	return &res, nil
}

// Delete menghapus baris jadwal (soft delete).
func (s *JamOperasionalService) Delete(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Jam operasional tidak ditemukan")
	}
	return nil
}

// UpdateSetting memperbarui pengaturan kartu.
func (s *JamOperasionalService) UpdateSetting(ctx context.Context, req dto.UpdateJamOperasionalSettingRequest) (*dto.JamOperasionalSettingResponse, error) {
	current, err := s.repo.GetSetting(ctx)
	if err != nil {
		return nil, err
	}
	updated, err := s.repo.UpdateSetting(ctx, current, req)
	if err != nil {
		return nil, err
	}
	res := toSettingDTO(updated)
	return &res, nil
}

func toItemDTO(m *model.JamOperasional) dto.JamOperasionalItemResponse {
	return dto.JamOperasionalItemResponse{
		ID:        m.ID.String(),
		DayLabel:  m.DayLabel,
		Hours:     m.Hours,
		IsClosed:  m.IsClosed,
		SortOrder: m.SortOrder,
		IsActive:  m.IsActive,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

func toSettingDTO(s *model.JamOperasionalSetting) dto.JamOperasionalSettingResponse {
	return dto.JamOperasionalSettingResponse{
		BadgeText: s.BadgeText,
		Title:     s.Title,
		Note:      s.Note,
		UpdatedAt: s.UpdatedAt,
	}
}
