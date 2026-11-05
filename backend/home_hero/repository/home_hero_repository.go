package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"winteknikmandiri-backend/home_hero/dto"
	"winteknikmandiri-backend/home_hero/model"
)

type HomeHeroRepository struct {
	db *sql.DB
}

func NewHomeHeroRepository(db *sql.DB) *HomeHeroRepository {
	return &HomeHeroRepository{db: db}
}

// GetActive mengambil hero section yang berstatus aktif (atau row pertama jika ada).
func (r *HomeHeroRepository) GetActive(ctx context.Context) (*model.HomeHero, error) {
	query := `
		SELECT 
			id, badge_text, badge_colors,
			title, title_color, title_highlight_color, title_colors,
			slogan, slogan_colors,
			description, description_colors,
			media_type, media_url, COALESCE(thumbnail_url, ''),
			COALESCE(cta_primary_text, ''), COALESCE(cta_primary_url, ''),
			COALESCE(cta_secondary_text, ''), COALESCE(cta_secondary_url, ''),
			is_active, created_at, updated_at
		FROM home_hero
		WHERE is_active = TRUE
		ORDER BY id ASC
		LIMIT 1`

	var hero model.HomeHero
	var badgeColorsRaw, titleColorsRaw, sloganColorsRaw, descColorsRaw []byte

	err := r.db.QueryRowContext(ctx, query).Scan(
		&hero.ID, &hero.BadgeText, &badgeColorsRaw,
		&hero.Title, &hero.TitleColor, &hero.TitleHighlightColor, &titleColorsRaw,
		&hero.Slogan, &sloganColorsRaw,
		&hero.Description, &descColorsRaw,
		&hero.MediaType, &hero.MediaURL, &hero.ThumbnailURL,
		&hero.CtaPrimaryText, &hero.CtaPrimaryURL,
		&hero.CtaSecondaryText, &hero.CtaSecondaryURL,
		&hero.IsActive, &hero.CreatedAt, &hero.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("query active hero: %w", err)
	}

	hero.BadgeColors = unmarshalColors(badgeColorsRaw)
	hero.TitleColors = unmarshalColors(titleColorsRaw)
	hero.SloganColors = unmarshalColors(sloganColorsRaw)
	hero.DescriptionColors = unmarshalColors(descColorsRaw)

	return &hero, nil
}

// Save menyimpan atau memperbarui data hero aktif.
func (r *HomeHeroRepository) Save(ctx context.Context, req dto.UpdateHomeHeroRequest) (*model.HomeHero, error) {
	badgeColorsJSON, _ := json.Marshal(defaultMap(req.BadgeColors))
	titleColorsJSON, _ := json.Marshal(defaultMap(req.TitleColors))
	sloganColorsJSON, _ := json.Marshal(defaultMap(req.SloganColors))
	descColorsJSON, _ := json.Marshal(defaultMap(req.DescriptionColors))

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var existingID int
	err := r.db.QueryRowContext(ctx, `SELECT id FROM home_hero ORDER BY id ASC LIMIT 1`).Scan(&existingID)

	var hero model.HomeHero
	var badgeColorsRaw, titleColorsRaw, sloganColorsRaw, descColorsRaw []byte

	if err == sql.ErrNoRows {
		// Insert jika belum ada row sama sekali
		insertQuery := `
			INSERT INTO home_hero (
				badge_text, badge_colors,
				title, title_color, title_highlight_color, title_colors,
				slogan, slogan_colors,
				description, description_colors,
				media_type, media_url, thumbnail_url,
				cta_primary_text, cta_primary_url,
				cta_secondary_text, cta_secondary_url,
				is_active, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
				$11, $12, $13, $14, $15, $16, $17, $18, NOW()
			)
			RETURNING 
				id, badge_text, badge_colors,
				title, title_color, title_highlight_color, title_colors,
				slogan, slogan_colors,
				description, description_colors,
				media_type, media_url, COALESCE(thumbnail_url, ''),
				COALESCE(cta_primary_text, ''), COALESCE(cta_primary_url, ''),
				COALESCE(cta_secondary_text, ''), COALESCE(cta_secondary_url, ''),
				is_active, created_at, updated_at`

		err = r.db.QueryRowContext(ctx, insertQuery,
			req.BadgeText, badgeColorsJSON,
			req.Title, req.TitleColor, req.TitleHighlightColor, titleColorsJSON,
			req.Slogan, sloganColorsJSON,
			req.Description, descColorsJSON,
			req.MediaType, req.MediaURL, req.ThumbnailURL,
			req.CtaPrimaryText, req.CtaPrimaryURL,
			req.CtaSecondaryText, req.CtaSecondaryURL,
			isActive,
		).Scan(
			&hero.ID, &hero.BadgeText, &badgeColorsRaw,
			&hero.Title, &hero.TitleColor, &hero.TitleHighlightColor, &titleColorsRaw,
			&hero.Slogan, &sloganColorsRaw,
			&hero.Description, &descColorsRaw,
			&hero.MediaType, &hero.MediaURL, &hero.ThumbnailURL,
			&hero.CtaPrimaryText, &hero.CtaPrimaryURL,
			&hero.CtaSecondaryText, &hero.CtaSecondaryURL,
			&hero.IsActive, &hero.CreatedAt, &hero.UpdatedAt,
		)
	} else if err == nil {
		// Update row yang sudah ada
		updateQuery := `
			UPDATE home_hero SET
				badge_text = $1, badge_colors = $2,
				title = $3, title_color = $4, title_highlight_color = $5, title_colors = $6,
				slogan = $7, slogan_colors = $8,
				description = $9, description_colors = $10,
				media_type = $11, media_url = $12, thumbnail_url = $13,
				cta_primary_text = $14, cta_primary_url = $15,
				cta_secondary_text = $16, cta_secondary_url = $17,
				is_active = $18, updated_at = $19
			WHERE id = $20
			RETURNING 
				id, badge_text, badge_colors,
				title, title_color, title_highlight_color, title_colors,
				slogan, slogan_colors,
				description, description_colors,
				media_type, media_url, COALESCE(thumbnail_url, ''),
				COALESCE(cta_primary_text, ''), COALESCE(cta_primary_url, ''),
				COALESCE(cta_secondary_text, ''), COALESCE(cta_secondary_url, ''),
				is_active, created_at, updated_at`

		err = r.db.QueryRowContext(ctx, updateQuery,
			req.BadgeText, badgeColorsJSON,
			req.Title, req.TitleColor, req.TitleHighlightColor, titleColorsJSON,
			req.Slogan, sloganColorsJSON,
			req.Description, descColorsJSON,
			req.MediaType, req.MediaURL, req.ThumbnailURL,
			req.CtaPrimaryText, req.CtaPrimaryURL,
			req.CtaSecondaryText, req.CtaSecondaryURL,
			isActive, time.Now(), existingID,
		).Scan(
			&hero.ID, &hero.BadgeText, &badgeColorsRaw,
			&hero.Title, &hero.TitleColor, &hero.TitleHighlightColor, &titleColorsRaw,
			&hero.Slogan, &sloganColorsRaw,
			&hero.Description, &descColorsRaw,
			&hero.MediaType, &hero.MediaURL, &hero.ThumbnailURL,
			&hero.CtaPrimaryText, &hero.CtaPrimaryURL,
			&hero.CtaSecondaryText, &hero.CtaSecondaryURL,
			&hero.IsActive, &hero.CreatedAt, &hero.UpdatedAt,
		)
	} else {
		return nil, fmt.Errorf("check existing hero: %w", err)
	}

	if err != nil {
		return nil, fmt.Errorf("save hero: %w", err)
	}

	hero.BadgeColors = unmarshalColors(badgeColorsRaw)
	hero.TitleColors = unmarshalColors(titleColorsRaw)
	hero.SloganColors = unmarshalColors(sloganColorsRaw)
	hero.DescriptionColors = unmarshalColors(descColorsRaw)

	return &hero, nil
}

func unmarshalColors(raw []byte) map[string]string {
	res := make(map[string]string)
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &res)
	}
	return res
}

func defaultMap(m map[string]string) map[string]string {
	if m == nil {
		return make(map[string]string)
	}
	return m
}
