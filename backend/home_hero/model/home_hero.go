package model

import (
	"time"
)

// HomeHero merepresentasikan baris konfigurasi hero banner pada tabel home_hero.
type HomeHero struct {
	ID                  int               `json:"id"`
	BadgeText           string            `json:"badge_text"`
	BadgeColors         map[string]string `json:"badge_colors"`
	Title               string            `json:"title"`
	TitleColor          string            `json:"title_color"`
	TitleHighlightColor string            `json:"title_highlight_color"`
	TitleColors         map[string]string `json:"title_colors"`
	Slogan              string            `json:"slogan"`
	SloganColors        map[string]string `json:"slogan_colors"`
	Description         string            `json:"description"`
	DescriptionColors   map[string]string `json:"description_colors"`
	MediaType           string            `json:"media_type"`
	MediaURL            string            `json:"media_url"`
	ThumbnailURL        string            `json:"thumbnail_url"`
	CtaPrimaryText      string            `json:"cta_primary_text"`
	CtaPrimaryURL       string            `json:"cta_primary_url"`
	CtaSecondaryText    string            `json:"cta_secondary_text"`
	CtaSecondaryURL     string            `json:"cta_secondary_url"`
	IsActive            bool              `json:"is_active"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           time.Time         `json:"updated_at"`
}
