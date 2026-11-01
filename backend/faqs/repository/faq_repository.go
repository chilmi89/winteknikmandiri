// Package repository menangani akses data FAQ dengan SQL native.
package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/faqs/model"
	"winteknikmandiri-backend/internal/database"
)

// ErrNotFound menandai FAQ tidak ada atau sudah dihapus.
var ErrNotFound = errors.New("faq tidak ditemukan")

// ListFilter menampung parameter pencarian daftar FAQ.
type ListFilter struct {
	Category   string
	Search     string
	OnlyActive bool
	Limit      int
	Offset     int
}

// FAQRepository adalah kontrak akses data yang dipakai service.
type FAQRepository interface {
	Create(ctx context.Context, faq *model.FAQ) error
	FindByID(ctx context.Context, id uuid.UUID) (*model.FAQ, error)
	List(ctx context.Context, filter ListFilter) ([]model.FAQ, int64, error)
	Update(ctx context.Context, faq *model.FAQ) error
	SoftDelete(ctx context.Context, id uuid.UUID) error
}

type faqRepository struct {
	db *sql.DB
}

// NewFAQRepository membuat repository dengan pool database yang diberikan.
func NewFAQRepository(db *sql.DB) FAQRepository {
	return &faqRepository{db: db}
}

// COALESCE dipakai agar baris lama yang kolomnya NULL tetap bisa dipindai.
const faqColumns = `id, COALESCE(question, '') AS question, COALESCE(answer, '') AS answer,
	COALESCE(category, '') AS category, COALESCE(sort_order, 0) AS sort_order,
	COALESCE(is_active, TRUE) AS is_active,
	COALESCE(created_at, NOW()) AS created_at, COALESCE(updated_at, NOW()) AS updated_at`

func (r *faqRepository) Create(ctx context.Context, faq *model.FAQ) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	const query = `
		INSERT INTO faqs (question, answer, category, sort_order, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		faq.Question, faq.Answer, faq.Category, faq.SortOrder, faq.IsActive,
	).Scan(&faq.ID, &faq.CreatedAt, &faq.UpdatedAt)
	if err != nil {
		return fmt.Errorf("menyimpan faq: %w", err)
	}
	return nil
}

func (r *faqRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.FAQ, error) {
	if r.db == nil {
		return nil, database.ErrUnavailable
	}

	query := `SELECT ` + faqColumns + `
		FROM faqs
		WHERE id = $1::uuid AND deleted_at IS NULL`

	var faq model.FAQ
	err := r.db.QueryRowContext(ctx, query, id.String()).Scan(
		&faq.ID, &faq.Question, &faq.Answer, &faq.Category,
		&faq.SortOrder, &faq.IsActive, &faq.CreatedAt, &faq.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("mengambil faq id %s: %w", id, err)
	}
	return &faq, nil
}

func (r *faqRepository) List(ctx context.Context, filter ListFilter) ([]model.FAQ, int64, error) {
	if r.db == nil {
		return nil, 0, database.ErrUnavailable
	}

	conditions := []string{"deleted_at IS NULL"}
	args := make([]any, 0, 3)

	if filter.OnlyActive {
		conditions = append(conditions, "is_active = TRUE")
	}
	if filter.Category != "" {
		args = append(args, filter.Category)
		conditions = append(conditions, fmt.Sprintf("category = $%d", len(args)))
	}
	if filter.Search != "" {
		args = append(args, "%"+filter.Search+"%")
		conditions = append(conditions, fmt.Sprintf(
			"(question ILIKE $%d OR answer ILIKE $%d)", len(args), len(args),
		))
	}

	where := " WHERE " + strings.Join(conditions, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM faqs`+where, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("menghitung faq: %w", err)
	}

	args = append(args, filter.Limit, filter.Offset)
	query := `SELECT ` + faqColumns + ` FROM faqs` + where +
		fmt.Sprintf(` ORDER BY sort_order ASC, created_at ASC, id ASC LIMIT $%d OFFSET $%d`, len(args)-1, len(args))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("mengambil daftar faq: %w", err)
	}
	defer func() { _ = rows.Close() }()

	faqs := make([]model.FAQ, 0, filter.Limit)
	for rows.Next() {
		var faq model.FAQ
		if err := rows.Scan(
			&faq.ID, &faq.Question, &faq.Answer, &faq.Category,
			&faq.SortOrder, &faq.IsActive, &faq.CreatedAt, &faq.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("memindai baris faq: %w", err)
		}
		faqs = append(faqs, faq)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterasi baris faq: %w", err)
	}
	return faqs, total, nil
}

func (r *faqRepository) Update(ctx context.Context, faq *model.FAQ) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	const query = `
		UPDATE faqs
		SET question = $2, answer = $3, category = $4,
		    sort_order = $5, is_active = $6, updated_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
		RETURNING updated_at`

	err := r.db.QueryRowContext(ctx, query,
		faq.ID.String(), faq.Question, faq.Answer, faq.Category, faq.SortOrder, faq.IsActive,
	).Scan(&faq.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return fmt.Errorf("memperbarui faq id %s: %w", faq.ID, err)
	}
	return nil
}

func (r *faqRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	if r.db == nil {
		return database.ErrUnavailable
	}

	result, err := r.db.ExecContext(
		ctx,
		`UPDATE faqs SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`,
		id.String(),
	)
	if err != nil {
		return fmt.Errorf("menghapus faq id %s: %w", id, err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("membaca hasil hapus faq id %s: %w", id, err)
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}
