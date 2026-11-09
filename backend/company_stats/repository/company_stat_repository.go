package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"

	"winteknikmandiri-backend/company_stats/dto"
	"winteknikmandiri-backend/company_stats/model"
)

// CompanyStatRepository menangani query PostgreSQL untuk tabel company_stats.
type CompanyStatRepository struct {
	db *sql.DB
}

// NewCompanyStatRepository membuat instance repository baru.
func NewCompanyStatRepository(db *sql.DB) *CompanyStatRepository {
	return &CompanyStatRepository{db: db}
}

// ListPublic mengambil seluruh statistik aktif untuk publik.
func (r *CompanyStatRepository) ListPublic(ctx context.Context) ([]model.CompanyStat, error) {
	query := `
		SELECT id, label, value, target_number, has_plus, keterangan, sort_order, is_active, created_at, updated_at
		FROM company_stats
		WHERE is_active = TRUE AND deleted_at IS NULL
		ORDER BY sort_order ASC, created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.CompanyStat, 0)
	for rows.Next() {
		var s model.CompanyStat
		if err := rows.Scan(
			&s.ID, &s.Label, &s.Value, &s.TargetNumber, &s.HasPlus,
			&s.Keterangan, &s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, rows.Err()
}

// ListAdmin mengambil seluruh data statistik untuk dashboard (termasuk nonaktif).
func (r *CompanyStatRepository) ListAdmin(ctx context.Context) ([]model.CompanyStat, error) {
	query := `
		SELECT id, label, value, target_number, has_plus, keterangan, sort_order, is_active, created_at, updated_at
		FROM company_stats
		WHERE deleted_at IS NULL
		ORDER BY sort_order ASC, created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.CompanyStat, 0)
	for rows.Next() {
		var s model.CompanyStat
		if err := rows.Scan(
			&s.ID, &s.Label, &s.Value, &s.TargetNumber, &s.HasPlus,
			&s.Keterangan, &s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, rows.Err()
}

// GetByID mengambil satu data statistik berdasarkan ID.
func (r *CompanyStatRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.CompanyStat, error) {
	query := `
		SELECT id, label, value, target_number, has_plus, keterangan, sort_order, is_active, created_at, updated_at
		FROM company_stats
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var s model.CompanyStat
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ID, &s.Label, &s.Value, &s.TargetNumber, &s.HasPlus,
		&s.Keterangan, &s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Create membuat item statistik baru.
func (r *CompanyStatRepository) Create(ctx context.Context, req dto.CreateCompanyStatRequest) (*model.CompanyStat, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	query := `
		INSERT INTO company_stats (label, value, target_number, has_plus, keterangan, sort_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, label, value, target_number, has_plus, keterangan, sort_order, is_active, created_at, updated_at
	`
	var s model.CompanyStat
	err := r.db.QueryRowContext(
		ctx, query,
		req.Label, req.Value, req.TargetNumber, req.HasPlus, req.Keterangan, req.SortOrder, isActive,
	).Scan(
		&s.ID, &s.Label, &s.Value, &s.TargetNumber, &s.HasPlus,
		&s.Keterangan, &s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Update mengubah item statistik.
func (r *CompanyStatRepository) Update(ctx context.Context, current *model.CompanyStat, req dto.UpdateCompanyStatRequest) (*model.CompanyStat, error) {
	label := current.Label
	if req.Label != nil {
		label = *req.Label
	}
	value := current.Value
	if req.Value != nil {
		value = *req.Value
	}
	targetNumber := current.TargetNumber
	if req.TargetNumber != nil {
		targetNumber = *req.TargetNumber
	}
	hasPlus := current.HasPlus
	if req.HasPlus != nil {
		hasPlus = *req.HasPlus
	}
	keterangan := current.Keterangan
	if req.Keterangan != nil {
		keterangan = *req.Keterangan
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
		UPDATE company_stats
		SET label = $1, value = $2, target_number = $3, has_plus = $4, keterangan = $5,
		    sort_order = $6, is_active = $7, updated_at = NOW()
		WHERE id = $8::uuid AND deleted_at IS NULL
		RETURNING id, label, value, target_number, has_plus, keterangan, sort_order, is_active, created_at, updated_at
	`
	var s model.CompanyStat
	err := r.db.QueryRowContext(
		ctx, query,
		label, value, targetNumber, hasPlus, keterangan, sortOrder, isActive, current.ID,
	).Scan(
		&s.ID, &s.Label, &s.Value, &s.TargetNumber, &s.HasPlus,
		&s.Keterangan, &s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// ToggleActive mengubah status aktif/nonaktif.
func (r *CompanyStatRepository) ToggleActive(ctx context.Context, id uuid.UUID) (*model.CompanyStat, error) {
	query := `
		UPDATE company_stats
		SET is_active = NOT is_active, updated_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
		RETURNING id, label, value, target_number, has_plus, keterangan, sort_order, is_active, created_at, updated_at
	`
	var s model.CompanyStat
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ID, &s.Label, &s.Value, &s.TargetNumber, &s.HasPlus,
		&s.Keterangan, &s.SortOrder, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Delete soft-delete item statistik.
func (r *CompanyStatRepository) Delete(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE company_stats SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}
