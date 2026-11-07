package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"winteknikmandiri-backend/teams/dto"
	"winteknikmandiri-backend/teams/model"
)

// TeamMemberRepository menangani operasi database PostgreSQL untuk team_members.
type TeamMemberRepository struct {
	db *sql.DB
}

// NewTeamMemberRepository membuat instance repository baru.
func NewTeamMemberRepository(db *sql.DB) *TeamMemberRepository {
	return &TeamMemberRepository{db: db}
}

// List mengambil seluruh data anggota tim yang belum di-soft-delete.
func (r *TeamMemberRepository) List(ctx context.Context, includeInactive bool) ([]model.TeamMember, error) {
	query := `
		SELECT
			id, name, skill, image_url, image_key, is_active,
			created_at, updated_at
		FROM team_members
		WHERE deleted_at IS NULL
	`
	if !includeInactive {
		query += " AND is_active = TRUE"
	}
	query += " ORDER BY created_at ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query team_members: %w", err)
	}
	defer rows.Close()

	items := make([]model.TeamMember, 0)
	for rows.Next() {
		var it model.TeamMember
		if err := rows.Scan(
			&it.ID,
			&it.Name,
			&it.Skill,
			&it.ImageURL,
			&it.ImageKey,
			&it.IsActive,
			&it.CreatedAt,
			&it.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan team_members: %w", err)
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

// GetByID mengambil satu anggota tim berdasarkan ID UUID.
func (r *TeamMemberRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.TeamMember, error) {
	query := `
		SELECT
			id, name, skill, image_url, image_key, is_active,
			created_at, updated_at
		FROM team_members
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var it model.TeamMember
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID,
		&it.Name,
		&it.Skill,
		&it.ImageURL,
		&it.ImageKey,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("gagal query team_members by id: %w", err)
	}
	return &it, nil
}

// Create menyisipkan data tim baru.
func (r *TeamMemberRepository) Create(ctx context.Context, req dto.CreateTeamMemberRequest) (*model.TeamMember, error) {
	query := `
		INSERT INTO team_members (
			name, skill, image_url, image_key, is_active
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING
			id, name, skill, image_url, image_key, is_active,
			created_at, updated_at
	`
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	var it model.TeamMember
	err := r.db.QueryRowContext(
		ctx,
		query,
		req.Name,
		req.Skill,
		req.ImageURL,
		req.ImageKey,
		isActive,
	).Scan(
		&it.ID,
		&it.Name,
		&it.Skill,
		&it.ImageURL,
		&it.ImageKey,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal insert team_members: %w", err)
	}
	return &it, nil
}

// Update memperbarui data anggota tim.
func (r *TeamMemberRepository) Update(ctx context.Context, current *model.TeamMember, req dto.UpdateTeamMemberRequest) (*model.TeamMember, error) {
	name := current.Name
	if req.Name != nil {
		name = *req.Name
	}
	skill := current.Skill
	if req.Skill != nil {
		skill = *req.Skill
	}
	imageURL := current.ImageURL
	if req.ImageURL != nil {
		imageURL = *req.ImageURL
	}
	imageKey := current.ImageKey
	if req.ImageKey != nil {
		imageKey = *req.ImageKey
	}
	isActive := current.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	query := `
		UPDATE team_members
		SET
			name = $1,
			skill = $2,
			image_url = $3,
			image_key = $4,
			is_active = $5,
			updated_at = NOW()
		WHERE id = $6::uuid AND deleted_at IS NULL
		RETURNING
			id, name, skill, image_url, image_key, is_active,
			created_at, updated_at
	`
	var it model.TeamMember
	err := r.db.QueryRowContext(
		ctx,
		query,
		name,
		skill,
		imageURL,
		imageKey,
		isActive,
		current.ID,
	).Scan(
		&it.ID,
		&it.Name,
		&it.Skill,
		&it.ImageURL,
		&it.ImageKey,
		&it.IsActive,
		&it.CreatedAt,
		&it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal update team_members: %w", err)
	}
	return &it, nil
}

// Delete melakukan soft delete tim.
func (r *TeamMemberRepository) Delete(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `
		UPDATE team_members
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, fmt.Errorf("gagal soft delete team_members: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
