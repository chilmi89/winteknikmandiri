// Package repository menangani akses data inquiries dengan SQL native.
package repository

import (
	"context"
	"database/sql"
	"fmt"

	"winteknikmandiri-backend/inquiries/model"
	"winteknikmandiri-backend/internal/database"
)

// InquiryRepository adalah kontrak akses data yang dipakai service.
type InquiryRepository interface {
	Create(ctx context.Context, in *model.Inquiry) error
	List(ctx context.Context, limit, offset int) ([]model.Inquiry, error)
	Count(ctx context.Context) (int64, error)
}

type inquiryRepository struct {
	db *sql.DB
}

// NewInquiryRepository membuat repository dengan pool database yang diberikan.
func NewInquiryRepository(db *sql.DB) InquiryRepository {
	return &inquiryRepository{db: db}
}

// Kolom dibaca dengan COALESCE agar baris lama yang kolomnya NULL (warisan
// AutoMigrate GORM) tetap bisa dipindai ke tipe string.
const inquiryColumns = `id, name, phone, service, COALESCE(address, '') AS address,
	notes, COALESCE(status, 'pending') AS status,
	COALESCE(created_at, NOW()) AS created_at, COALESCE(updated_at, NOW()) AS updated_at`

func (r *inquiryRepository) Create(ctx context.Context, in *model.Inquiry) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	const query = `
		INSERT INTO inquiries (name, phone, service, address, notes, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		in.Name, in.Phone, in.Service, in.Address, in.Notes, in.Status,
	).Scan(&in.ID, &in.CreatedAt, &in.UpdatedAt)
	if err != nil {
		return fmt.Errorf("menyimpan inquiry: %w", err)
	}
	return nil
}

func (r *inquiryRepository) List(ctx context.Context, limit, offset int) ([]model.Inquiry, error) {
	if r.db == nil {
		return nil, database.ErrUnavailable
	}

	query := `SELECT ` + inquiryColumns + `
		FROM inquiries
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC NULLS LAST, id DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("mengambil daftar inquiry: %w", err)
	}
	defer func() { _ = rows.Close() }()

	inquiries := make([]model.Inquiry, 0, limit)
	for rows.Next() {
		var in model.Inquiry
		if err := rows.Scan(
			&in.ID, &in.Name, &in.Phone, &in.Service, &in.Address,
			&in.Notes, &in.Status, &in.CreatedAt, &in.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("memindai baris inquiry: %w", err)
		}
		inquiries = append(inquiries, in)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterasi baris inquiry: %w", err)
	}
	return inquiries, nil
}

func (r *inquiryRepository) Count(ctx context.Context) (int64, error) {
	if r.db == nil {
		return 0, database.ErrUnavailable
	}

	var total int64
	err := r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(*) FROM inquiries WHERE deleted_at IS NULL`,
	).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("menghitung inquiry: %w", err)
	}
	return total, nil
}
