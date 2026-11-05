package service

import (
	"context"
	"strings"

	"winteknikmandiri-backend/home_hero/dto"
	"winteknikmandiri-backend/home_hero/model"
	"winteknikmandiri-backend/home_hero/repository"
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
	// Normalisasi
	req.Title = strings.TrimSpace(req.Title)
	if req.MediaType == "" {
		req.MediaType = "video"
	}
	return s.repo.Save(ctx, req)
}
