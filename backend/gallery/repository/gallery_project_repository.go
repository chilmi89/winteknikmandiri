package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"winteknikmandiri-backend/gallery/dto"
	"winteknikmandiri-backend/gallery/model"
)

// GalleryProjectRepository menangani query database untuk gallery_projects.
type GalleryProjectRepository struct {
	db *sql.DB
}

// NewGalleryProjectRepository membuat instance repository baru.
func NewGalleryProjectRepository(db *sql.DB) *GalleryProjectRepository {
	return &GalleryProjectRepository{db: db}
}

// List mengambil daftar proyek dokumentasi dengan filter kategori opsional.
func (r *GalleryProjectRepository) List(ctx context.Context, category string, includeInactive bool) ([]model.GalleryProject, error) {
	query := `
		SELECT
			id, title, category, client, scope, location,
			image_url, image_key, sort_order, is_active,
			created_at, updated_at
		FROM gallery_projects
		WHERE deleted_at IS NULL
	`
	var args []any
	argIdx := 1

	if !includeInactive {
		query += " AND is_active = TRUE"
	}
	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND category = $%d", argIdx)
		args = append(args, category)
		argIdx++
	}

	query += " ORDER BY sort_order ASC, created_at ASC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("gagal query gallery_projects: %w", err)
	}
	defer rows.Close()

	items := make([]model.GalleryProject, 0)
	for rows.Next() {
		var it model.GalleryProject
		if err := rows.Scan(
			&it.ID,
			&it.Title,
			&it.Category,
			&it.Client,
			&it.Scope,
			&it.Location,
			&it.ImageURL,
			&it.ImageKey,
			&it.SortOrder,
			&it.IsActive,
			&it.CreatedAt,
			&it.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan gallery_projects: %w", err)
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

// GetCategoriesWithCount menghitung total item per kategori secara dinamis.
func (r *GalleryProjectRepository) GetCategoriesWithCount(ctx context.Context, includeInactive bool) ([]model.CategoryCount, error) {
	query := `
		SELECT category, COUNT(*) as count
		FROM gallery_projects
		WHERE deleted_at IS NULL
	`
	if !includeInactive {
		query += " AND is_active = TRUE"
	}
	query += " GROUP BY category ORDER BY count DESC, category ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query kategori galeri: %w", err)
	}
	defer rows.Close()

	counts := make([]model.CategoryCount, 0)
	for rows.Next() {
		var c model.CategoryCount
		if err := rows.Scan(&c.Category, &c.Count); err != nil {
			return nil, fmt.Errorf("gagal scan kategori count: %w", err)
		}
		counts = append(counts, c)
	}
	return counts, rows.Err()
}

// GetByID mengambil satu proyek dokumentasi berdasarkan UUID.
func (r *GalleryProjectRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.GalleryProject, error) {
	query := `
		SELECT
			id, title, category, client, scope, location,
			image_url, image_key, sort_order, is_active,
			created_at, updated_at
		FROM gallery_projects
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.GalleryProject
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID,
		&it.Title,
		&it.Category,
		&it.Client,
		&it.Scope,
		&it.Location,
		&it.ImageURL,
		&it.ImageKey,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query gallery_projects by id: %w", err)
	}
	return &it, nil
}

// Create menyisipkan proyek baru.
func (r *GalleryProjectRepository) Create(ctx context.Context, req dto.CreateGalleryProjectRequest) (*model.GalleryProject, error) {
	query := `
		INSERT INTO gallery_projects (
			title, category, client, scope, location,
			image_url, image_key, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING
			id, title, category, client, scope, location,
			image_url, image_key, sort_order, is_active,
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

	var it model.GalleryProject
	err := r.db.QueryRowContext(
		ctx,
		query,
		req.Title,
		req.Category,
		req.Client,
		req.Scope,
		req.Location,
		req.ImageURL,
		req.ImageKey,
		sortOrder,
		isActive,
	).Scan(
		&it.ID,
		&it.Title,
		&it.Category,
		&it.Client,
		&it.Scope,
		&it.Location,
		&it.ImageURL,
		&it.ImageKey,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal insert gallery_projects: %w", err)
	}
	return &it, nil
}

// Update memperbarui data proyek.
func (r *GalleryProjectRepository) Update(ctx context.Context, current *model.GalleryProject, req dto.UpdateGalleryProjectRequest) (*model.GalleryProject, error) {
	title := current.Title
	if req.Title != nil {
		title = *req.Title
	}
	category := current.Category
	if req.Category != nil {
		category = *req.Category
	}
	client := current.Client
	if req.Client != nil {
		client = *req.Client
	}
	scope := current.Scope
	if req.Scope != nil {
		scope = *req.Scope
	}
	location := current.Location
	if req.Location != nil {
		location = *req.Location
	}
	imageURL := current.ImageURL
	if req.ImageURL != nil {
		imageURL = *req.ImageURL
	}
	imageKey := current.ImageKey
	if req.ImageKey != nil {
		imageKey = *req.ImageKey
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
		UPDATE gallery_projects
		SET
			title = $1,
			category = $2,
			client = $3,
			scope = $4,
			location = $5,
			image_url = $6,
			image_key = $7,
			sort_order = $8,
			is_active = $9,
			updated_at = NOW()
		WHERE id = $10::uuid AND deleted_at IS NULL
		RETURNING
			id, title, category, client, scope, location,
			image_url, image_key, sort_order, is_active,
			created_at, updated_at
	`
	var it model.GalleryProject
	err := r.db.QueryRowContext(
		ctx,
		query,
		title,
		category,
		client,
		scope,
		location,
		imageURL,
		imageKey,
		sortOrder,
		isActive,
		current.ID,
	).Scan(
		&it.ID,
		&it.Title,
		&it.Category,
		&it.Client,
		&it.Scope,
		&it.Location,
		&it.ImageURL,
		&it.ImageKey,
		&it.SortOrder,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update gallery_projects: %w", err)
	}
	return &it, nil
}

// Delete melakukan soft delete proyek.
func (r *GalleryProjectRepository) Delete(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `
		UPDATE gallery_projects
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, fmt.Errorf("gagal soft delete gallery_projects: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
