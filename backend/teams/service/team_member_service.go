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
	"winteknikmandiri-backend/teams/dto"
	"winteknikmandiri-backend/teams/model"
	"winteknikmandiri-backend/teams/repository"
)

// TeamMemberService mengelola logika bisnis tim teknisi.
type TeamMemberService struct {
	repo *repository.TeamMemberRepository
}

// NewTeamMemberService membuat instance service baru.
func NewTeamMemberService(repo *repository.TeamMemberRepository) *TeamMemberService {
	return &TeamMemberService{repo: repo}
}

// List mengambil seluruh data tim teknisi.
func (s *TeamMemberService) List(ctx context.Context, includeInactive bool) ([]dto.TeamMemberResponse, error) {
	items, err := s.repo.List(ctx, includeInactive)
	if err != nil {
		return nil, err
	}
	res := make([]dto.TeamMemberResponse, len(items))
	for i, it := range items {
		res[i] = toDTO(&it)
	}
	return res, nil
}

// GetByID mengambil detail satu anggota tim.
func (s *TeamMemberService) GetByID(ctx context.Context, idStr string) (*dto.TeamMemberResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Anggota tim tidak ditemukan")
	}
	res := toDTO(it)
	return &res, nil
}

// Create menambahkan anggota tim baru.
func (s *TeamMemberService) Create(ctx context.Context, req dto.CreateTeamMemberRequest) (*dto.TeamMemberResponse, error) {
	it, err := s.repo.Create(ctx, req)
	if err != nil {
		return nil, err
	}
	res := toDTO(it)
	return &res, nil
}

// Update memperbarui anggota tim.
func (s *TeamMemberService) Update(ctx context.Context, idStr string, req dto.UpdateTeamMemberRequest) (*dto.TeamMemberResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Anggota tim tidak ditemukan")
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

// Delete menghapus anggota tim (soft delete) dan membersihkan foto MinIO.
func (s *TeamMemberService) Delete(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid (harus UUID)", err.Error())
	}
	current, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return apperr.NotFound("Anggota tim tidak ditemukan")
	}

	deleted, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Anggota tim tidak ditemukan")
	}

	// Hapus foto dari MinIO bila ada
	if storage.S3Client != nil && current.ImageURL != "" {
		_ = storage.S3Client.DeleteIfManaged(ctx, current.ImageURL)
	}

	return nil
}

// UploadPhoto menerima file gambar asli (JPG, PNG, WEBP), mengonversinya ke WebP dengan kompresi,
// lalu menyimpannya langsung ke MinIO folder teams/.
func (s *TeamMemberService) UploadPhoto(ctx context.Context, originalFilename string, r io.Reader) (*dto.UploadTeamPhotoResponse, error) {
	if storage.S3Client == nil {
		return nil, fmt.Errorf("layanan MinIO belum terhubung atau non-aktif")
	}

	// Validasi ekstensi
	ext := strings.ToLower(path.Ext(originalFilename))
	allowed := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
	}
	if !allowed[ext] {
		return nil, apperr.Validation("Format gambar tidak didukung", "Format yang diizinkan: JPG, JPEG, PNG, WEBP, GIF")
	}

	// Konversi & kompres otomatis ke WebP kualitas 82 (sangat tajam & hemat ruang).
	// Jika cwebp belum terpasang, otomatis fallback menyimpan format gambar asli tanpa error.
	imgReader, size, isWebP, err := imaging.ConvertToWebP(r, 82)
	if err != nil {
		return nil, fmt.Errorf("pemrosesan gambar gagal: %w", err)
	}

	// Upload ke MinIO folder teams/
	objKey, pubURL, err := storage.S3Client.UploadTeamPhoto(ctx, originalFilename, imgReader, size, isWebP)
	if err != nil {
		return nil, fmt.Errorf("unggah ke MinIO gagal: %w", err)
	}

	format := "image/webp"
	if !isWebP {
		format = ext
	}

	return &dto.UploadTeamPhotoResponse{
		ImageURL:     pubURL,
		ImageKey:     objKey,
		OriginalName: originalFilename,
		Format:       format,
		Size:         size,
	}, nil
}

func toDTO(m *model.TeamMember) dto.TeamMemberResponse {
	return dto.TeamMemberResponse{
		ID:        m.ID.String(),
		Name:      m.Name,
		Skill:     m.Skill,
		ImageURL:  m.ImageURL,
		ImageKey:  m.ImageKey,
		IsActive:  m.IsActive,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
