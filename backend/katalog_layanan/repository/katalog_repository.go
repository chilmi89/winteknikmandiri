package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"winteknikmandiri-backend/katalog_layanan/dto"
	"winteknikmandiri-backend/katalog_layanan/model"
)

// KatalogRepository menangani database query untuk kategori dan item layanan.
type KatalogRepository struct {
	db *sql.DB
}

// NewKatalogRepository membuat instance repository baru.
func NewKatalogRepository(db *sql.DB) *KatalogRepository {
	return &KatalogRepository{db: db}
}

// ---------- CATEGORY METHODS ----------

func (r *KatalogRepository) ListCategories(ctx context.Context, includeInactive bool) ([]model.ServiceCategory, error) {
	query := `
		SELECT id, code, name, is_active, created_at, updated_at
		FROM service_categories
		WHERE deleted_at IS NULL
	`
	if !includeInactive {
		query += " AND is_active = TRUE"
	}
	query += " ORDER BY code ASC, created_at ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query categories: %w", err)
	}
	defer rows.Close()

	items := make([]model.ServiceCategory, 0)
	for rows.Next() {
		var it model.ServiceCategory
		if err := rows.Scan(&it.ID, &it.Code, &it.Name, &it.IsActive, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

func (r *KatalogRepository) GetCategoryByID(ctx context.Context, id uuid.UUID) (*model.ServiceCategory, error) {
	query := `
		SELECT id, code, name, is_active, created_at, updated_at
		FROM service_categories
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.ServiceCategory
	err := r.db.QueryRowContext(ctx, query, id).Scan(&it.ID, &it.Code, &it.Name, &it.IsActive, &it.CreatedAt, &it.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *KatalogRepository) CreateCategory(ctx context.Context, req dto.CreateCategoryRequest) (*model.ServiceCategory, error) {
	query := `
		INSERT INTO service_categories (code, name, is_active)
		VALUES ($1, $2, $3)
		RETURNING id, code, name, is_active, created_at, updated_at
	`
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var it model.ServiceCategory
	err := r.db.QueryRowContext(ctx, query, req.Code, req.Name, isActive).Scan(
		&it.ID, &it.Code, &it.Name, &it.IsActive, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *KatalogRepository) UpdateCategory(ctx context.Context, current *model.ServiceCategory, req dto.UpdateCategoryRequest) (*model.ServiceCategory, error) {
	code := current.Code
	if req.Code != nil {
		code = *req.Code
	}
	name := current.Name
	if req.Name != nil {
		name = *req.Name
	}
	isActive := current.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	query := `
		UPDATE service_categories
		SET code = $1, name = $2, is_active = $3, updated_at = NOW()
		WHERE id = $4::uuid AND deleted_at IS NULL
		RETURNING id, code, name, is_active, created_at, updated_at
	`
	var it model.ServiceCategory
	err := r.db.QueryRowContext(ctx, query, code, name, isActive, current.ID).Scan(
		&it.ID, &it.Code, &it.Name, &it.IsActive, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *KatalogRepository) DeleteCategory(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE service_categories SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

// ---------- ITEM METHODS ----------

func (r *KatalogRepository) ListItems(ctx context.Context, categoryIDStr string, includeInactive bool) ([]model.ServiceItem, error) {
	query := `
		SELECT
			i.id, i.category_id, c.name as category_name, c.code as category_code,
			i.title, i.description, i.highlights, i.price_prefix, i.price, i.unit, i.price_note,
			i.image_url, i.image_key, i.sort_order, i.is_active, i.created_at, i.updated_at
		FROM service_items i
		JOIN service_categories c ON i.category_id = c.id
		WHERE i.deleted_at IS NULL AND c.deleted_at IS NULL
	`
	var args []any
	argIdx := 1

	if !includeInactive {
		query += " AND i.is_active = TRUE AND c.is_active = TRUE"
	}
	if categoryIDStr != "" {
		catUUID, err := uuid.Parse(categoryIDStr)
		if err == nil {
			query += fmt.Sprintf(" AND i.category_id = $%d::uuid", argIdx)
			args = append(args, catUUID)
			argIdx++
		}
	}
	query += " ORDER BY c.code ASC, i.sort_order ASC, i.created_at ASC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query service_items: %w", err)
	}
	defer rows.Close()

	items := make([]model.ServiceItem, 0)
	for rows.Next() {
		var it model.ServiceItem
		var hl pgtype.FlatArray[string]
		if err := rows.Scan(
			&it.ID, &it.CategoryID, &it.CategoryName, &it.CategoryCode,
			&it.Title, &it.Description, &hl, &it.PricePrefix, &it.Price, &it.Unit, &it.PriceNote,
			&it.ImageURL, &it.ImageKey, &it.SortOrder, &it.IsActive, &it.CreatedAt, &it.UpdatedAt,
		); err != nil {
			return nil, err
		}
		it.Highlights = []string(hl)
		if it.Highlights == nil {
			it.Highlights = []string{}
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

func (r *KatalogRepository) GetItemByID(ctx context.Context, id uuid.UUID) (*model.ServiceItem, error) {
	query := `
		SELECT
			i.id, i.category_id, c.name as category_name, c.code as category_code,
			i.title, i.description, i.highlights, i.price_prefix, i.price, i.unit, i.price_note,
			i.image_url, i.image_key, i.sort_order, i.is_active, i.created_at, i.updated_at
		FROM service_items i
		JOIN service_categories c ON i.category_id = c.id
		WHERE i.id = $1::uuid AND i.deleted_at IS NULL
	`
	var it model.ServiceItem
	var hl pgtype.FlatArray[string]
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID, &it.CategoryID, &it.CategoryName, &it.CategoryCode,
		&it.Title, &it.Description, &hl, &it.PricePrefix, &it.Price, &it.Unit, &it.PriceNote,
		&it.ImageURL, &it.ImageKey, &it.SortOrder, &it.IsActive, &it.CreatedAt, &it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	it.Highlights = []string(hl)
	if it.Highlights == nil {
		it.Highlights = []string{}
	}
	return &it, nil
}

func (r *KatalogRepository) CreateItem(ctx context.Context, catUUID uuid.UUID, req dto.CreateItemRequest) (*model.ServiceItem, error) {
	query := `
		INSERT INTO service_items (
			category_id, title, description, highlights, price_prefix, price, unit, price_note,
			image_url, image_key, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, category_id, title, description, highlights, price_prefix, price, unit, price_note,
		          image_url, image_key, sort_order, is_active, created_at, updated_at
	`
	hl := req.Highlights
	if hl == nil {
		hl = []string{}
	}
	pricePrefix := req.PricePrefix
	if pricePrefix == "" {
		pricePrefix = "Mulai dari"
	}
	unit := req.Unit
	if unit == "" {
		unit = "/ unit"
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var it model.ServiceItem
	var hlScan pgtype.FlatArray[string]
	err := r.db.QueryRowContext(ctx, query,
		catUUID, req.Title, req.Description, pgtype.FlatArray[string](hl),
		pricePrefix, req.Price, unit, req.PriceNote,
		req.ImageURL, req.ImageKey, sortOrder, isActive,
	).Scan(
		&it.ID, &it.CategoryID, &it.Title, &it.Description, &hlScan, &it.PricePrefix, &it.Price, &it.Unit, &it.PriceNote,
		&it.ImageURL, &it.ImageKey, &it.SortOrder, &it.IsActive, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	it.Highlights = []string(hlScan)
	return &it, nil
}

func (r *KatalogRepository) UpdateItem(ctx context.Context, current *model.ServiceItem, catUUID uuid.UUID, req dto.UpdateItemRequest) (*model.ServiceItem, error) {
	title := current.Title
	if req.Title != nil {
		title = *req.Title
	}
	desc := current.Description
	if req.Description != nil {
		desc = *req.Description
	}
	hl := current.Highlights
	if req.Highlights != nil {
		hl = *req.Highlights
	}
	pricePrefix := current.PricePrefix
	if req.PricePrefix != nil {
		pricePrefix = *req.PricePrefix
	}
	price := current.Price
	if req.Price != nil {
		price = *req.Price
	}
	unit := current.Unit
	if req.Unit != nil {
		unit = *req.Unit
	}
	priceNote := current.PriceNote
	if req.PriceNote != nil {
		priceNote = *req.PriceNote
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
		UPDATE service_items
		SET
			category_id = $1, title = $2, description = $3, highlights = $4, price_prefix = $5,
			price = $6, unit = $7, price_note = $8, image_url = $9, image_key = $10,
			sort_order = $11, is_active = $12, updated_at = NOW()
		WHERE id = $13::uuid AND deleted_at IS NULL
		RETURNING id, category_id, title, description, highlights, price_prefix, price, unit, price_note,
		          image_url, image_key, sort_order, is_active, created_at, updated_at
	`
	var it model.ServiceItem
	var hlScan pgtype.FlatArray[string]
	err := r.db.QueryRowContext(ctx, query,
		catUUID, title, desc, pgtype.FlatArray[string](hl), pricePrefix,
		price, unit, priceNote, imageURL, imageKey,
		sortOrder, isActive, current.ID,
	).Scan(
		&it.ID, &it.CategoryID, &it.Title, &it.Description, &hlScan, &it.PricePrefix, &it.Price, &it.Unit, &it.PriceNote,
		&it.ImageURL, &it.ImageKey, &it.SortOrder, &it.IsActive, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	it.Highlights = []string(hlScan)
	return &it, nil
}

func (r *KatalogRepository) DeleteItem(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE service_items SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}
