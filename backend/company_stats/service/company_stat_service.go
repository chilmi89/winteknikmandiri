package service

import (
	"context"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/company_stats/dto"
	"winteknikmandiri-backend/company_stats/model"
	"winteknikmandiri-backend/company_stats/repository"
	"winteknikmandiri-backend/internal/apperr"
)

// CompanyStatService mengelola logika bisnis statistik pencapaian perusahaan.
type CompanyStatService struct {
	repo *repository.CompanyStatRepository
}

// NewCompanyStatService membuat instance service baru.
func NewCompanyStatService(repo *repository.CompanyStatRepository) *CompanyStatService {
	return &CompanyStatService{repo: repo}
}

func (s *CompanyStatService) ListPublic(ctx context.Context) ([]dto.CompanyStatResponse, error) {
	items, err := s.repo.ListPublic(ctx)
	if err != nil {
		return nil, err
	}
	res := make([]dto.CompanyStatResponse, len(items))
	for i, it := range items {
		res[i] = toStatDTO(&it)
	}
	return res, nil
}

func (s *CompanyStatService) ListAdmin(ctx context.Context) ([]dto.CompanyStatResponse, error) {
	items, err := s.repo.ListAdmin(ctx)
	if err != nil {
		return nil, err
	}
	res := make([]dto.CompanyStatResponse, len(items))
	for i, it := range items {
		res[i] = toStatDTO(&it)
	}
	return res, nil
}

func (s *CompanyStatService) GetByID(ctx context.Context, idStr string) (*dto.CompanyStatResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Data statistik tidak ditemukan")
	}
	res := toStatDTO(it)
	return &res, nil
}

func (s *CompanyStatService) Create(ctx context.Context, req dto.CreateCompanyStatRequest) (*dto.CompanyStatResponse, error) {
	label := strings.TrimSpace(req.Label)
	if label == "" {
		return nil, apperr.Validation("Label statistik wajib diisi", "")
	}
	val := strings.TrimSpace(req.Value)
	if val == "" {
		return nil, apperr.Validation("Nilai statistik wajib diisi", "")
	}

	req.Label = label
	req.Value = val

	it, err := s.repo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	res := toStatDTO(it)
	return &res, nil
}

func (s *CompanyStatService) Update(ctx context.Context, idStr string, req dto.UpdateCompanyStatRequest) (*dto.CompanyStatResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Data statistik tidak ditemukan")
	}

	if req.Label != nil {
		l := strings.TrimSpace(*req.Label)
		if l == "" {
			return nil, apperr.Validation("Label statistik tidak boleh kosong", "")
		}
		req.Label = &l
	}
	if req.Value != nil {
		v := strings.TrimSpace(*req.Value)
		if v == "" {
			return nil, apperr.Validation("Nilai statistik tidak boleh kosong", "")
		}
		req.Value = &v
	}

	it, err := s.repo.Update(ctx, current, req)
	if err != nil {
		return nil, err
	}
	res := toStatDTO(it)
	return &res, nil
}

func (s *CompanyStatService) ToggleActive(ctx context.Context, idStr string) (*dto.CompanyStatResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	it, err := s.repo.ToggleActive(ctx, id)
	if err != nil {
		return nil, err
	}
	res := toStatDTO(it)
	return &res, nil
}

func (s *CompanyStatService) Delete(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid", err.Error())
	}
	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Data statistik tidak ditemukan")
	}
	return nil
}

func toStatDTO(s *model.CompanyStat) dto.CompanyStatResponse {
	return dto.CompanyStatResponse{
		ID:           s.ID.String(),
		Label:        s.Label,
		Value:        s.Value,
		TargetNumber: s.TargetNumber,
		HasPlus:      s.HasPlus,
		Keterangan:   s.Keterangan,
		SortOrder:    s.SortOrder,
		IsActive:     s.IsActive,
		CreatedAt:    s.CreatedAt,
		UpdatedAt:    s.UpdatedAt,
	}
}
