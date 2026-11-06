package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"winteknikmandiri-backend/jam_operasional/dto"
	"winteknikmandiri-backend/jam_operasional/model"
)

// JamOperasionalRepository mengelola query PostgreSQL untuk jam operasional.
type JamOperasionalRepository struct {
	db *sql.DB
}

// NewJamOperasionalRepository membuat instance repository baru.
func NewJamOperasionalRepository(db *sql.DB) *JamOperasionalRepository {
	return &JamOperasionalRepository{db: db}
}

// List mengambil daftar jam operasional.
func (r *JamOperasionalRepository) List(ctx context.Context, includeInactive bool) ([]model.JamOperasional, error) {
	query := `
		SELECT
			id, day_label, hours, is_closed, sort_order, is_active,
			created_at, updated_at
		FROM jam_operasional
		WHERE deleted_at IS NULL
	`
	if !includeInactive {
		query += " AND is_active = TRUE"
	}
	query += " ORDER BY sort_order ASC, created_at ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query jam_operasional: %w", err)
	}
	defer rows.Close()

	items := make([]model.JamOperasional, 0)
	for rows.Next() {
		var it model.JamOperasional
		if err := rows.Scan(
			&it.ID,
			&it.DayLabel,
			&it.Hours,
			&it.IsClosed,
			&it.SortOrder,
			&it.IsActive,
			&it.CreatedAt,
			&it.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan jam_operasional: %w", err)
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

// GetByID mengambil satu baris jam operasional.
func (r *JamOperasionalRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.JamOperasional, error) {
	query := `
		SELECT
			id, day_label, hours, is_closed, sort_order, is_active,
			created_at, updated_at
		FROM jam_operasional
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.JamOperasional
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID,
		&it.DayLabel,
		&it.Hours,
		&it.IsClosed,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query jam_operasional by id: %w", err)
	}
	return &it, nil
}

// Create menyisipkan baris jam operasional baru.
func (r *JamOperasionalRepository) Create(ctx context.Context, req dto.CreateJamOperasionalRequest) (*model.JamOperasional, error) {
	query := `
		INSERT INTO jam_operasional (
			day_label, hours, is_closed, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING
			id, day_label, hours, is_closed, sort_order, is_active,
			created_at, updated_at
	`
	isClosed := false
	if req.IsClosed != nil {
		isClosed = *req.IsClosed
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var it model.JamOperasional
	err := r.db.QueryRowContext(
		ctx,
		query,
		req.DayLabel,
		req.Hours,
		isClosed,
		sortOrder,
		isActive,
	).Scan(
		&it.ID,
		&it.DayLabel,
		&it.Hours,
		&it.IsClosed,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal insert jam_operasional: %w", err)
	}
	return &it, nil
}

// Update memperbarui data baris jam operasional.
func (r *JamOperasionalRepository) Update(ctx context.Context, current *model.JamOperasional, req dto.UpdateJamOperasionalRequest) (*model.JamOperasional, error) {
	dayLabel := current.DayLabel
	if req.DayLabel != nil {
		dayLabel = *req.DayLabel
	}
	hours := current.Hours
	if req.Hours != nil {
		hours = *req.Hours
	}
	isClosed := current.IsClosed
	if req.IsClosed != nil {
		isClosed = *req.IsClosed
	}
	sortOrder := current.SortOrder
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	isActive := current.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	query := `
		UPDATE jam_operasional
		SET
			day_label = $1,
			hours = $2,
			is_closed = $3,
			sort_order = $4,
			is_active = $5,
			updated_at = NOW()
		WHERE id = $6::uuid AND deleted_at IS NULL
		RETURNING
			id, day_label, hours, is_closed, sort_order, is_active,
			created_at, updated_at
	`
	var it model.JamOperasional
	err := r.db.QueryRowContext(
		ctx,
		query,
		dayLabel,
		hours,
		isClosed,
		sortOrder,
		isActive,
		current.ID,
	).Scan(
		&it.ID,
		&it.DayLabel,
		&it.Hours,
		&it.IsClosed,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update jam_operasional: %w", err)
	}
	return &it, nil
}

// Delete melakukan soft delete baris jam operasional.
func (r *JamOperasionalRepository) Delete(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `
		UPDATE jam_operasional
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, fmt.Errorf("gagal soft delete jam_operasional: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

// GetSetting mengambil pengaturan kartu jam operasional.
func (r *JamOperasionalRepository) GetSetting(ctx context.Context) (*model.JamOperasionalSetting, error) {
	query := `
		SELECT id, badge_text, title, note, updated_at
		FROM jam_operasional_setting
		WHERE id = 1
	`
	var s model.JamOperasionalSetting
	err := r.db.QueryRowContext(ctx, query).Scan(
		&s.ID,
		&s.BadgeText,
		&s.Title,
		&s.Note,
		&s.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		// Fallback jika belum ter-seed
		return &model.JamOperasionalSetting{
			ID:        1,
			BadgeText: "Buka Hari Kerja",
			Title:     "Jam Operasional",
			Note:      "* Untuk mitra kontrak pemeliharaan gedung & darurat komersial, tim standby melayani penanganan terjadwal di luar jam kantor.",
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query jam_operasional_setting: %w", err)
	}
	return &s, nil
}

// UpdateSetting memperbarui pengaturan kartu jam operasional.
func (r *JamOperasionalRepository) UpdateSetting(ctx context.Context, current *model.JamOperasionalSetting, req dto.UpdateJamOperasionalSettingRequest) (*model.JamOperasionalSetting, error) {
	badgeText := current.BadgeText
	if req.BadgeText != nil {
		badgeText = *req.BadgeText
	}
	title := current.Title
	if req.Title != nil {
		title = *req.Title
	}
	note := current.Note
	if req.Note != nil {
		note = *req.Note
	}

	query := `
		INSERT INTO jam_operasional_setting (id, badge_text, title, note, updated_at)
		VALUES (1, $1, $2, $3, NOW())
		ON CONFLICT (id) DO UPDATE
		SET
			badge_text = EXCLUDED.badge_text,
			title = EXCLUDED.title,
			note = EXCLUDED.note,
			updated_at = NOW()
		RETURNING id, badge_text, title, note, updated_at
	`
	var s model.JamOperasionalSetting
	err := r.db.QueryRowContext(ctx, query, badgeText, title, note).Scan(
		&s.ID,
		&s.BadgeText,
		&s.Title,
		&s.Note,
		&s.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update jam_operasional_setting: %w", err)
	}
	return &s, nil
}
