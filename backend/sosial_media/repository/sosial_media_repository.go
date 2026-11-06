package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"winteknikmandiri-backend/sosial_media/dto"
	"winteknikmandiri-backend/sosial_media/model"
)

// SosialMediaRepository menangani interaksi database PostgreSQL untuk sosial_media.
type SosialMediaRepository struct {
	db *sql.DB
}

// NewSosialMediaRepository menginisialisasi repository baru.
func NewSosialMediaRepository(db *sql.DB) *SosialMediaRepository {
	return &SosialMediaRepository{db: db}
}

// List mengambil seluruh data sosial media yang belum di-soft-delete.
func (r *SosialMediaRepository) List(ctx context.Context, q dto.ListSosialMediaQuery) ([]model.SosialMedia, error) {
	query := `
		SELECT
			id, nama, link, icon,
			sort_order, is_active,
			created_at, updated_at
		FROM sosial_media
		WHERE deleted_at IS NULL
	`
	if !q.IncludeInactive {
		query += " AND is_active = TRUE"
	}
	query += " ORDER BY sort_order ASC, created_at ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query sosial_media: %w", err)
	}
	defer rows.Close()

	items := make([]model.SosialMedia, 0)
	for rows.Next() {
		var it model.SosialMedia
		if err := rows.Scan(
			&it.ID,
			&it.Nama,
			&it.Link,
			&it.Icon,
			&it.SortOrder,
			&it.IsActive,
			&it.CreatedAt,
			&it.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan sosial_media: %w", err)
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

// GetByID mengambil satu sosial media berdasarkan UUID.
func (r *SosialMediaRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.SosialMedia, error) {
	query := `
		SELECT
			id, nama, link, icon,
			sort_order, is_active,
			created_at, updated_at
		FROM sosial_media
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.SosialMedia
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID,
		&it.Nama,
		&it.Link,
		&it.Icon,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query sosial_media by id: %w", err)
	}
	return &it, nil
}

// Create menyisipkan data sosial media baru ke PostgreSQL.
func (r *SosialMediaRepository) Create(ctx context.Context, req dto.CreateSosialMediaRequest) (*model.SosialMedia, error) {
	query := `
		INSERT INTO sosial_media (
			nama, link, icon, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING
			id, nama, link, icon, sort_order, is_active,
			created_at, updated_at
	`
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var it model.SosialMedia
	err := r.db.QueryRowContext(
		ctx,
		query,
		req.Nama,
		req.Link,
		req.Icon,
		sortOrder,
		isActive,
	).Scan(
		&it.ID,
		&it.Nama,
		&it.Link,
		&it.Icon,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal insert sosial_media: %w", err)
	}
	return &it, nil
}

// Update memperbarui data sosial media yang ada.
func (r *SosialMediaRepository) Update(ctx context.Context, id uuid.UUID, req dto.UpdateSosialMediaRequest, current *model.SosialMedia) (*model.SosialMedia, error) {
	nama := current.Nama
	if req.Nama != nil {
		nama = *req.Nama
	}
	link := current.Link
	if req.Link != nil {
		link = *req.Link
	}
	icon := current.Icon
	if req.Icon != nil {
		icon = *req.Icon
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
		UPDATE sosial_media
		SET
			nama = $1,
			link = $2,
			icon = $3,
			sort_order = $4,
			is_active = $5,
			updated_at = NOW()
		WHERE id = $6::uuid AND deleted_at IS NULL
		RETURNING
			id, nama, link, icon, sort_order, is_active,
			created_at, updated_at
	`
	var it model.SosialMedia
	err := r.db.QueryRowContext(
		ctx,
		query,
		nama,
		link,
		icon,
		sortOrder,
		isActive,
		id,
	).Scan(
		&it.ID,
		&it.Nama,
		&it.Link,
		&it.Icon,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update sosial_media: %w", err)
	}
	return &it, nil
}

// Delete melakukan soft-delete dengan menandai deleted_at = NOW().
func (r *SosialMediaRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE sosial_media
		SET deleted_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete sosial_media: %w", err)
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("gagal cek baris terhapus: %w", err)
	}
	if rows == 0 {
		return errors.New("data sosial media tidak ditemukan atau sudah dihapus")
	}
	return nil
}
