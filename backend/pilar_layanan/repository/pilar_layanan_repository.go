package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"winteknikmandiri-backend/pilar_layanan/dto"
	"winteknikmandiri-backend/pilar_layanan/model"
)

// PilarLayananRepository menangani interaksi database PostgreSQL untuk pilar_layanan.
type PilarLayananRepository struct {
	db *sql.DB
}

// NewPilarLayananRepository menginisialisasi repository baru.
func NewPilarLayananRepository(db *sql.DB) *PilarLayananRepository {
	return &PilarLayananRepository{db: db}
}

// List mengambil seluruh data pilar layanan yang belum di-soft-delete.
func (r *PilarLayananRepository) List(ctx context.Context, q dto.ListPilarLayananQuery) ([]model.PilarLayanan, error) {
	query := `
		SELECT
			id, code, title, description, link_url,
			is_featured, cta_text, sort_order, is_active,
			created_at, updated_at
		FROM pilar_layanan
		WHERE deleted_at IS NULL
	`
	if !q.IncludeInactive {
		query += " AND is_active = TRUE"
	}
	query += " ORDER BY sort_order ASC, created_at ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query pilar_layanan: %w", err)
	}
	defer rows.Close()

	items := make([]model.PilarLayanan, 0)
	for rows.Next() {
		var it model.PilarLayanan
		if err := rows.Scan(
			&it.ID,
			&it.Code,
			&it.Title,
			&it.Description,
			&it.LinkURL,
			&it.IsFeatured,
			&it.CTAText,
			&it.SortOrder,
			&it.IsActive,
			&it.CreatedAt,
			&it.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan pilar_layanan: %w", err)
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

// GetByID mengambil satu pilar layanan berdasarkan UUID.
func (r *PilarLayananRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.PilarLayanan, error) {
	query := `
		SELECT
			id, code, title, description, link_url,
			is_featured, cta_text, sort_order, is_active,
			created_at, updated_at
		FROM pilar_layanan
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.PilarLayanan
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID,
		&it.Code,
		&it.Title,
		&it.Description,
		&it.LinkURL,
		&it.IsFeatured,
		&it.CTAText,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query pilar_layanan by id: %w", err)
	}
	return &it, nil
}

// Create menyisipkan data pilar layanan baru ke PostgreSQL.
func (r *PilarLayananRepository) Create(ctx context.Context, req dto.CreatePilarLayananRequest) (*model.PilarLayanan, error) {
	query := `
		INSERT INTO pilar_layanan (
			code, title, description, link_url,
			is_featured, cta_text, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING
			id, code, title, description, link_url,
			is_featured, cta_text, sort_order, is_active,
			created_at, updated_at
	`
	isFeatured := false
	if req.IsFeatured != nil {
		isFeatured = *req.IsFeatured
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	linkURL := "/layanan"
	if req.LinkURL != "" {
		linkURL = req.LinkURL
	}

	var it model.PilarLayanan
	err := r.db.QueryRowContext(
		ctx,
		query,
		req.Code,
		req.Title,
		req.Description,
		linkURL,
		isFeatured,
		req.CTAText,
		sortOrder,
		isActive,
	).Scan(
		&it.ID,
		&it.Code,
		&it.Title,
		&it.Description,
		&it.LinkURL,
		&it.IsFeatured,
		&it.CTAText,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal insert pilar_layanan: %w", err)
	}
	return &it, nil
}

// Update memperbarui data pilar layanan.
func (r *PilarLayananRepository) Update(ctx context.Context, current *model.PilarLayanan, req dto.UpdatePilarLayananRequest) (*model.PilarLayanan, error) {
	code := current.Code
	if req.Code != nil {
		code = *req.Code
	}
	title := current.Title
	if req.Title != nil {
		title = *req.Title
	}
	desc := current.Description
	if req.Description != nil {
		desc = *req.Description
	}
	linkURL := current.LinkURL
	if req.LinkURL != nil {
		linkURL = *req.LinkURL
	}
	isFeatured := current.IsFeatured
	if req.IsFeatured != nil {
		isFeatured = *req.IsFeatured
	}
	ctaText := current.CTAText
	if req.CTAText != nil {
		ctaText = *req.CTAText
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
		UPDATE pilar_layanan
		SET
			code = $1,
			title = $2,
			description = $3,
			link_url = $4,
			is_featured = $5,
			cta_text = $6,
			sort_order = $7,
			is_active = $8,
			updated_at = NOW()
		WHERE id = $9::uuid AND deleted_at IS NULL
		RETURNING
			id, code, title, description, link_url,
			is_featured, cta_text, sort_order, is_active,
			created_at, updated_at
	`
	var it model.PilarLayanan
	err := r.db.QueryRowContext(
		ctx,
		query,
		code,
		title,
		desc,
		linkURL,
		isFeatured,
		ctaText,
		sortOrder,
		isActive,
		current.ID,
	).Scan(
		&it.ID,
		&it.Code,
		&it.Title,
		&it.Description,
		&it.LinkURL,
		&it.IsFeatured,
		&it.CTAText,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update pilar_layanan: %w", err)
	}
	return &it, nil
}

// Delete melakukan soft delete pilar layanan.
func (r *PilarLayananRepository) Delete(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `
		UPDATE pilar_layanan
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, fmt.Errorf("gagal soft delete pilar_layanan: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
