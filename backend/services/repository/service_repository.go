// Package repository menangani query SQL native ke tabel services.
package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/database"
	"winteknikmandiri-backend/services/model"
)

// ErrNotFound menandai data layanan tidak ditemukan atau sudah dihapus.
var ErrNotFound = errors.New("layanan tidak ditemukan")

// ListFilter menampung parameter pencarian dan penyaringan layanan.
type ListFilter struct {
	Category   string
	Search     string
	OnlyActive bool
	Limit      int
	Offset     int
}

// ServiceRepository mendefinisikan kontrak akses database untuk layanan.
type ServiceRepository interface {
	Create(ctx context.Context, s *model.Service) error
	FindByID(ctx context.Context, id uuid.UUID) (*model.Service, error)
	FindBySlug(ctx context.Context, slug string) (*model.Service, error)
	List(ctx context.Context, filter ListFilter) ([]model.Service, int64, error)
	Update(ctx context.Context, s *model.Service) error
	SoftDelete(ctx context.Context, id uuid.UUID) error
}

type serviceRepository struct {
	db *sql.DB
}

// NewServiceRepository membuat instance baru ServiceRepository.
func NewServiceRepository(db *sql.DB) ServiceRepository {
	return &serviceRepository{db: db}
}

const serviceColumns = `id, slug, title, COALESCE(category, '') AS category,
	COALESCE(price_prefix, 'Mulai dari') AS price_prefix, price,
	COALESCE(unit, '/ unit') AS unit, COALESCE(price_note, '') AS price_note,
	COALESCE(image_url, '') AS image_url, COALESCE(image_key, '') AS image_key,
	COALESCE(summary, '') AS summary, COALESCE(highlights, '{}') AS highlights,
	COALESCE(sort_order, 0) AS sort_order, COALESCE(is_active, TRUE) AS is_active,
	COALESCE(created_at, NOW()) AS created_at, COALESCE(updated_at, NOW()) AS updated_at`

func (r *serviceRepository) Create(ctx context.Context, s *model.Service) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	const query = `
		INSERT INTO services (
			slug, title, category, price_prefix, price, unit, price_note,
			image_url, image_key, summary, highlights, sort_order, is_active,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
		)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(
		ctx,
		query,
		s.Slug,
		s.Title,
		s.Category,
		s.PricePrefix,
		s.Price,
		s.Unit,
		s.PriceNote,
		s.ImageURL,
		s.ImageKey,
		s.Summary,
		s.Highlights,
		s.SortOrder,
		s.IsActive,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return fmt.Errorf("menyimpan layanan: %w", err)
	}
	return nil
}

func (r *serviceRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.Service, error) {
	if r.db == nil {
		return nil, database.ErrUnavailable
	}

	query := fmt.Sprintf(`SELECT %s FROM services WHERE id = $1 AND deleted_at IS NULL`, serviceColumns)
	row := r.db.QueryRowContext(ctx, query, id)

	s, err := scanService(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("mengambil layanan by id: %w", err)
	}
	return s, nil
}

func (r *serviceRepository) FindBySlug(ctx context.Context, slug string) (*model.Service, error) {
	if r.db == nil {
		return nil, database.ErrUnavailable
	}

	query := fmt.Sprintf(`SELECT %s FROM services WHERE slug = $1 AND deleted_at IS NULL`, serviceColumns)
	row := r.db.QueryRowContext(ctx, query, slug)

	s, err := scanService(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("mengambil layanan by slug: %w", err)
	}
	return s, nil
}

func (r *serviceRepository) List(ctx context.Context, filter ListFilter) ([]model.Service, int64, error) {
	if r.db == nil {
		return nil, 0, database.ErrUnavailable
	}

	conditions := []string{"deleted_at IS NULL"}
	args := make([]any, 0, 4)

	if filter.OnlyActive {
		conditions = append(conditions, "is_active = TRUE")
	}

	if filter.Category != "" {
		args = append(args, filter.Category)
		conditions = append(conditions, fmt.Sprintf("category = $%d", len(args)))
	}

	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(filter.Search)+"%")
		idx := len(args)
		conditions = append(conditions, fmt.Sprintf(
			"(LOWER(title) LIKE $%d OR LOWER(summary) LIKE $%d OR LOWER(category) LIKE $%d)",
			idx, idx, idx,
		))
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	countQuery := "SELECT COUNT(*) FROM services " + whereClause
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("menghitung total layanan: %w", err)
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	offset := filter.Offset
	if offset < 0 {
		offset = 0
	}

	args = append(args, limit, offset)
	dataQuery := fmt.Sprintf(
		"SELECT %s FROM services %s ORDER BY sort_order ASC, created_at DESC LIMIT $%d OFFSET $%d",
		serviceColumns, whereClause, len(args)-1, len(args),
	)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("mengambil daftar layanan: %w", err)
	}
	defer rows.Close()

	items := make([]model.Service, 0, limit)
	for rows.Next() {
		s, err := scanService(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("scan baris layanan: %w", err)
		}
		items = append(items, *s)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterasi layanan: %w", err)
	}

	return items, total, nil
}

func (r *serviceRepository) Update(ctx context.Context, s *model.Service) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	const query = `
		UPDATE services SET
			slug = $2,
			title = $3,
			category = $4,
			price_prefix = $5,
			price = $6,
			unit = $7,
			price_note = $8,
			image_url = $9,
			image_key = $10,
			summary = $11,
			highlights = $12,
			sort_order = $13,
			is_active = $14,
			updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING updated_at`

	err := r.db.QueryRowContext(
		ctx,
		query,
		s.ID,
		s.Slug,
		s.Title,
		s.Category,
		s.PricePrefix,
		s.Price,
		s.Unit,
		s.PriceNote,
		s.ImageURL,
		s.ImageKey,
		s.Summary,
		s.Highlights,
		s.SortOrder,
		s.IsActive,
	).Scan(&s.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return fmt.Errorf("memperbarui layanan: %w", err)
	}
	return nil
}

func (r *serviceRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	const query = `UPDATE services SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("menghapus layanan: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("cek rows affected: %w", err)
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

type scannable interface {
	Scan(dest ...any) error
}

func scanService(s scannable) (*model.Service, error) {
	var item model.Service
	err := s.Scan(
		&item.ID,
		&item.Slug,
		&item.Title,
		&item.Category,
		&item.PricePrefix,
		&item.Price,
		&item.Unit,
		&item.PriceNote,
		&item.ImageURL,
		&item.ImageKey,
		&item.Summary,
		&item.Highlights,
		&item.SortOrder,
		&item.IsActive,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &item, nil
}
