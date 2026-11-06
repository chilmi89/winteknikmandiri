package service

import (
	"context"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/visi_misi/dto"
	"winteknikmandiri-backend/visi_misi/model"
	"winteknikmandiri-backend/visi_misi/repository"
)

// VisiMisiService mengelola logika bisnis visi dan misi perusahaan.
type VisiMisiService struct {
	repo *repository.VisiMisiRepository
}

// NewVisiMisiService menginisialisasi service baru.
func NewVisiMisiService(repo *repository.VisiMisiRepository) *VisiMisiService {
	return &VisiMisiService{repo: repo}
}

// GetBundle mengembalikan visi dan seluruh butir misi dalam satu respons bundle.
func (s *VisiMisiService) GetBundle(ctx context.Context, includeInactive bool) (*dto.VisiMisiBundleResponse, error) {
	visi, err := s.repo.GetVisi(ctx)
	if err != nil {
		return nil, err
	}

	misiList, err := s.repo.ListMisi(ctx, includeInactive)
	if err != nil {
		return nil, err
	}

	misiDTOs := make([]dto.MisiResponse, len(misiList))
	for i, m := range misiList {
		misiDTOs[i] = toMisiDTO(&m)
	}

	return &dto.VisiMisiBundleResponse{
		Visi: dto.VisiSettingResponse{
			VisiEyebrow: visi.VisiEyebrow,
			VisiText:    visi.VisiText,
			UpdatedAt:   visi.UpdatedAt,
		},
		Misi: misiDTOs,
	}, nil
}

// UpdateVisi memperbarui teks visi perusahaan.
func (s *VisiMisiService) UpdateVisi(ctx context.Context, req dto.UpdateVisiRequest) (*dto.VisiSettingResponse, error) {
	v, err := s.repo.UpdateVisi(ctx, req)
	if err != nil {
		return nil, err
	}
	return &dto.VisiSettingResponse{
		VisiEyebrow: v.VisiEyebrow,
		VisiText:    v.VisiText,
		UpdatedAt:   v.UpdatedAt,
	}, nil
}

// GetMisiByID mengambil detail satu butir misi berdasarkan UUID.
func (s *VisiMisiService) GetMisiByID(ctx context.Context, idStr string) (*dto.MisiResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetMisiByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Butir misi tidak ditemukan")
	}
	dtoRes := toMisiDTO(it)
	return &dtoRes, nil
}

// CreateMisi membuat butir misi baru.
func (s *VisiMisiService) CreateMisi(ctx context.Context, req dto.CreateMisiRequest) (*dto.MisiResponse, error) {
	it, err := s.repo.CreateMisi(ctx, req)
	if err != nil {
		return nil, err
	}
	dtoRes := toMisiDTO(it)
	return &dtoRes, nil
}

// UpdateMisi memperbarui data butir misi yang ada.
func (s *VisiMisiService) UpdateMisi(ctx context.Context, idStr string, req dto.UpdateMisiRequest) (*dto.MisiResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetMisiByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Butir misi tidak ditemukan")
	}

	it, err := s.repo.UpdateMisi(ctx, id, req, current)
	if err != nil {
		return nil, err
	}
	dtoRes := toMisiDTO(it)
	return &dtoRes, nil
}

// DeleteMisi melakukan soft-delete butir misi.
func (s *VisiMisiService) DeleteMisi(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetMisiByID(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return apperr.NotFound("Butir misi tidak ditemukan")
	}
	return s.repo.DeleteMisi(ctx, id)
}

func toMisiDTO(m *model.Misi) dto.MisiResponse {
	return dto.MisiResponse{
		ID:          m.ID.String(),
		Code:        m.Code,
		Title:       m.Title,
		Tagline:     m.Tagline,
		Description: m.Description,
		SortOrder:   m.SortOrder,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
