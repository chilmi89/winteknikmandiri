package dto

import "winteknikmandiri-backend/home_hero/model"

// UpdateHomeHeroRequest adalah payload JSON untuk memperbarui data hero.
type UpdateHomeHeroRequest struct {
	BadgeText           string            `json:"badge_text"`
	BadgeColors         map[string]string `json:"badge_colors"`
	Title               string            `json:"title" binding:"required"`
	TitleColor          string            `json:"title_color"`
	TitleHighlightColor string            `json:"title_highlight_color"`
	TitleColors         map[string]string `json:"title_colors"`
	Slogan              string            `json:"slogan"`
	SloganColors        map[string]string `json:"slogan_colors"`
	Description         string            `json:"description"`
	DescriptionColors   map[string]string `json:"description_colors"`
	MediaType           string            `json:"media_type" binding:"required,oneof=image video"`
	MediaURL            string            `json:"media_url" binding:"required"`
	ThumbnailURL        string            `json:"thumbnail_url"`
	CtaPrimaryText      string            `json:"cta_primary_text"`
	CtaPrimaryURL       string            `json:"cta_primary_url"`
	CtaSecondaryText    string            `json:"cta_secondary_text"`
	CtaSecondaryURL     string            `json:"cta_secondary_url"`
	IsActive            *bool             `json:"is_active"`
}

// HomeHeroEnvelope membungkus respons hero dengan pesan.
type HomeHeroEnvelope struct {
	Message string         `json:"message,omitempty"`
	Data    model.HomeHero `json:"data"`
}
