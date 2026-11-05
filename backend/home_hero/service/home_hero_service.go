package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"

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
		MediaURL:            "/hero-section/video_hero_ac.mp4",
		ThumbnailURL:        "/images/wtm-pemasangan.jpg",
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
			if strings.HasPrefix(existing.MediaURL, "/uploads/hero/") {
				localPath := filepath.Join("..", "frontend", "public", strings.TrimPrefix(existing.MediaURL, "/"))
				_ = os.Remove(localPath)
			}
		}
		if req.ThumbnailURL != "" && req.ThumbnailURL != existing.ThumbnailURL {
			if storage.S3Client != nil {
				_ = storage.S3Client.DeleteIfManaged(ctx, existing.ThumbnailURL)
			}
			if strings.HasPrefix(existing.ThumbnailURL, "/uploads/hero/") {
				localPath := filepath.Join("..", "frontend", "public", strings.TrimPrefix(existing.ThumbnailURL, "/"))
				_ = os.Remove(localPath)
			}
		}
	}

	return s.repo.Save(ctx, req)
}

// UploadMedia mengunggah file video/foto banner ke MinIO (folder hero/) atau disk lokal.
func (s *HomeHeroService) UploadMedia(ctx context.Context, filename string, reader io.Reader, size int64, contentType string) (string, error) {
	if storage.S3Client != nil {
		_, publicURL, err := storage.S3Client.UploadHeroMedia(ctx, filename, reader, size, contentType)
		if err == nil {
			return publicURL, nil
		}
		log.Printf("[STORAGE WARNING] Upload ke MinIO gagal, beralih ke penyimpanan lokal: %v", err)
	}

	// Fallback ke penyimpanan lokal disk
	uploadDir := filepath.Join("..", "frontend", "public", "uploads", "hero")
	_ = os.MkdirAll(uploadDir, 0755)

	ext := strings.ToLower(filepath.Ext(filename))
	uniqueName := fmt.Sprintf("%s-%s%s", time.Now().Format("20060102"), uuid.New().String()[:8], ext)
	dstPath := filepath.Join(uploadDir, uniqueName)

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", fmt.Errorf("membuat file lokal: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, reader); err != nil {
		return "", fmt.Errorf("menyimpan file lokal: %w", err)
	}

	return fmt.Sprintf("/uploads/hero/%s", uniqueName), nil
}
