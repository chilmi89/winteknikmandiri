package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"winteknikmandiri-backend/visi_misi/dto"
	"winteknikmandiri-backend/visi_misi/model"
)

// VisiMisiRepository menangani operasi database PostgreSQL untuk visi_setting dan misi.
type VisiMisiRepository struct {
	db *sql.DB
}

// NewVisiMisiRepository menginisialisasi repository baru.
func NewVisiMisiRepository(db *sql.DB) *VisiMisiRepository {
	return &VisiMisiRepository{db: db}
}

// GetVisi mengambil pengaturan visi perusahaan.
func (r *VisiMisiRepository) GetVisi(ctx context.Context) (*model.VisiSetting, error) {
	query := `
		SELECT id, visi_eyebrow, visi_text, updated_at
		FROM visi_setting
		WHERE id = 1
	`
	var v model.VisiSetting
	err := r.db.QueryRowContext(ctx, query).Scan(&v.ID, &v.VisiEyebrow, &v.VisiText, &v.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		// Fallback jika belum ada baris
		return &model.VisiSetting{
			ID:          1,
			VisiEyebrow: "Visi Perusahaan",
			VisiText:    "Menghadirkan layanan tata udara yang terpercaya, efisien, dan inovatif untuk memenuhi kebutuhan sektor hunian, komersial, hingga industri.",
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query visi_setting: %w", err)
	}
	return &v, nil
}

// UpdateVisi memperbarui teks visi perusahaan.
func (r *VisiMisiRepository) UpdateVisi(ctx context.Context, req dto.UpdateVisiRequest) (*model.VisiSetting, error) {
	eyebrow := "Visi Perusahaan"
	if req.VisiEyebrow != nil && *req.VisiEyebrow != "" {
		eyebrow = *req.VisiEyebrow
	}

	query := `
		INSERT INTO visi_setting (id, visi_eyebrow, visi_text, updated_at)
		VALUES (1, $1, $2, NOW())
		ON CONFLICT (id) DO UPDATE SET
			visi_eyebrow = EXCLUDED.visi_eyebrow,
			visi_text = EXCLUDED.visi_text,
			updated_at = NOW()
		RETURNING id, visi_eyebrow, visi_text, updated_at
	`
	var v model.VisiSetting
	err := r.db.QueryRowContext(ctx, query, eyebrow, req.VisiText).Scan(
		&v.ID, &v.VisiEyebrow, &v.VisiText, &v.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update visi_setting: %w", err)
	}
	return &v, nil
}

// ListMisi mengambil daftar butir misi yang belum dihapus.
func (r *VisiMisiRepository) ListMisi(ctx context.Context, includeInactive bool) ([]model.Misi, error) {
	query := `
		SELECT
			id, code, title, tagline, description,
			sort_order, is_active, created_at, updated_at
		FROM misi
		WHERE deleted_at IS NULL
	`
	if !includeInactive {
		query += " AND is_active = TRUE"
	}
	query += " ORDER BY sort_order ASC, created_at ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query misi: %w", err)
	}
	defer rows.Close()

	items := make([]model.Misi, 0)
	for rows.Next() {
		var it model.Misi
		if err := rows.Scan(
			&it.ID,
			&it.Code,
			&it.Title,
			&it.Tagline,
			&it.Description,
			&it.SortOrder,
			&it.IsActive,
			&it.CreatedAt,
			&it.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan misi: %w", err)
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

// GetMisiByID mengambil satu butir misi berdasarkan UUID.
func (r *VisiMisiRepository) GetMisiByID(ctx context.Context, id uuid.UUID) (*model.Misi, error) {
	query := `
		SELECT
			id, code, title, tagline, description,
			sort_order, is_active, created_at, updated_at
		FROM misi
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.Misi
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID,
		&it.Code,
		&it.Title,
		&it.Tagline,
		&it.Description,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query misi by id: %w", err)
	}
	return &it, nil
}

// CreateMisi menyisipkan butir misi baru.
func (r *VisiMisiRepository) CreateMisi(ctx context.Context, req dto.CreateMisiRequest) (*model.Misi, error) {
	query := `
		INSERT INTO misi (
			code, title, tagline, description, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING
			id, code, title, tagline, description,
			sort_order, is_active, created_at, updated_at
	`
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	code := req.Code
	if code == "" {
		code = "01"
	}

	var it model.Misi
	err := r.db.QueryRowContext(
		ctx,
		query,
		code,
		req.Title,
		req.Tagline,
		req.Description,
		sortOrder,
		isActive,
	).Scan(
		&it.ID,
		&it.Code,
		&it.Title,
		&it.Tagline,
		&it.Description,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal insert misi: %w", err)
	}
	return &it, nil
}

// UpdateMisi memperbarui butir misi yang ada.
func (r *VisiMisiRepository) UpdateMisi(ctx context.Context, id uuid.UUID, req dto.UpdateMisiRequest, current *model.Misi) (*model.Misi, error) {
	code := current.Code
	if req.Code != nil {
		code = *req.Code
	}
	title := current.Title
	if req.Title != nil {
		title = *req.Title
	}
	tagline := current.Tagline
	if req.Tagline != nil {
		tagline = *req.Tagline
	}
	description := current.Description
	if req.Description != nil {
		description = *req.Description
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
		UPDATE misi
		SET
			code = $1,
			title = $2,
			tagline = $3,
			description = $4,
			sort_order = $5,
			is_active = $6,
			updated_at = NOW()
		WHERE id = $7::uuid AND deleted_at IS NULL
		RETURNING
			id, code, title, tagline, description,
			sort_order, is_active, created_at, updated_at
	`
	var it model.Misi
	err := r.db.QueryRowContext(
		ctx,
		query,
		code,
		title,
		tagline,
		description,
		sortOrder,
		isActive,
		id,
	).Scan(
		&it.ID,
		&it.Code,
		&it.Title,
		&it.Tagline,
		&it.Description,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update misi: %w", err)
	}
	return &it, nil
}

// DeleteMisi melakukan soft-delete dengan menandai deleted_at = NOW().
func (r *VisiMisiRepository) DeleteMisi(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE misi
		SET deleted_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete misi: %w", err)
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal cek baris terhapus: %w", err)
	}
	if rows == 0 {
		return errors.New("data misi tidak ditemukan atau sudah dihapus")
	}
	return nil
}
