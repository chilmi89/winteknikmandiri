package service

import (
	"context"
	"fmt"
	"io"
	"strings"

	"winteknikmandiri-backend/home_hero/dto"
	"winteknikmandiri-backend/home_hero/model"
	"winteknikmandiri-backend/home_hero/repository"
	"winteknikmandiri-backend/internal/storage"
)

type HomeHeroService struct {
	repo *repository.HomeHeroRepository
}

func NewHomeHeroService(repo *repository.HomeHeroRepository) *HomeHeroService {
	return &HomeHeroService{repo: repo}
}

func (s *HomeHeroService) GetActive(ctx context.Context) (*model.HomeHero, error) {
	hero, err := s.repo.GetActive(ctx)
	if err != nil {
		return nil, err
	}
	if hero != nil {
		return hero, nil
	}

	// Fallback jika database belum ada data sama sekali
	return &model.HomeHero{
		ID:                  1,
		BadgeText:           "KONTRAKTOR AC • KEDIRI • SEJAK 2014",
		BadgeColors:         map[string]string{"0": "#FFFFFF", "1": "#FF6B6B", "2": "#8ACFF8", "3": "#FFFFFF", "4": "#8ACFF8", "5": "#FFFFFF", "6": "#F59E0B"},
		Title:               "WIN TEKNIK MANDIRI AC KEDIRI",
		TitleColor:          "#FFFFFF",
		TitleHighlightColor: "#FF6B6B",
		TitleColors:         map[string]string{"0": "#FF6B6B", "1": "#2279CF", "2": "#2279CF", "3": "#FFFFFF", "4": "#FFFFFF"},
		Slogan:              "FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS",
		SloganColors:        map[string]string{"0": "#8ACFF8", "1": "#FFFFFF", "2": "#8ACFF8", "3": "#FFFFFF", "4": "#FFFFFF", "5": "#FF6B6B", "6": "#FFFFFF"},
		Description:         "Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk hunian, komersial, dan industri di Kediri Raya",
		DescriptionColors:   map[string]string{"3": "#8ACFF8", "4": "#FF6B6B", "6": "#2279CF", "11": "#F59E0B"},
		MediaType:           "video",
		MediaURL:            "",
		ThumbnailURL:        "",
		CtaPrimaryText:      "Konsultasi via WhatsApp",
		CtaPrimaryURL:       "https://wa.me/6281216622840",
		CtaSecondaryText:    "Lihat layanan",
		CtaSecondaryURL:     "#layanan",
		IsActive:            true,
	}, nil
}

func (s *HomeHeroService) Update(ctx context.Context, req dto.UpdateHomeHeroRequest) (*model.HomeHero, error) {
	req.Title = strings.TrimSpace(req.Title)
	if req.MediaType == "" {
		req.MediaType = "video"
	}

	// Cek media lama dan hapus otomatis dari MinIO jika diganti dengan yang baru
	existing, _ := s.repo.GetActive(ctx)
	if existing != nil {
		if req.MediaURL != "" && req.MediaURL != existing.MediaURL {
			if storage.S3Client != nil {
				_ = storage.S3Client.DeleteIfManaged(ctx, existing.MediaURL)
			}
		}
		if req.ThumbnailURL != "" && req.ThumbnailURL != existing.ThumbnailURL {
			if storage.S3Client != nil {
				_ = storage.S3Client.DeleteIfManaged(ctx, existing.ThumbnailURL)
			}
		}
	}

	return s.repo.Save(ctx, req)
}

// UploadMedia mengunggah file video/foto banner langsung ke MinIO bucket wtm-media/hero/.
func (s *HomeHeroService) UploadMedia(ctx context.Context, filename string, reader io.Reader, size int64, contentType string) (string, error) {
	if storage.S3Client == nil {
		return "", fmt.Errorf("storage MinIO belum terhubung atau offline, pastikan container wtm-minio aktif")
	}

	_, publicURL, err := storage.S3Client.UploadHeroMedia(ctx, filename, reader, size, contentType)
	if err != nil {
		return "", fmt.Errorf("gagal upload media hero ke MinIO: %w", err)
	}

	return publicURL, nil
}
