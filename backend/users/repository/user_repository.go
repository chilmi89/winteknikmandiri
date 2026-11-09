package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"winteknikmandiri-backend/users/model"
)

var (
	ErrUserNotFound      = errors.New("pengguna tidak ditemukan")
	ErrUsernameExists    = errors.New("username sudah digunakan")
	ErrEmailExists       = errors.New("email sudah digunakan")
	ErrCannotDeleteLast  = errors.New("tidak dapat menghapus pengguna terakhir di sistem")
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// List mengambil seluruh data user yang belum dihapus.
func (r *UserRepository) List(ctx context.Context) ([]*model.User, error) {
	query := `
		SELECT id, username, email, name, password_hash, is_active, created_at, updated_at
		FROM users
		WHERE deleted_at IS NULL
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query users: %w", err)
	}
	defer rows.Close()

	users := make([]*model.User, 0)
	for rows.Next() {
		var u model.User
		if err := rows.Scan(
			&u.ID,
			&u.Username,
			&u.Email,
			&u.Name,
			&u.PasswordHash,
			&u.IsActive,
			&u.CreatedAt,
			&u.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("gagal scan user: %w", err)
		}
		users = append(users, &u)
	}
	return users, rows.Err()
}

// GetByID mengambil satu user berdasarkan ID UUID.
func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	query := `
		SELECT id, username, email, name, password_hash, is_active, created_at, updated_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`
	var u model.User
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.Name,
		&u.PasswordHash,
		&u.IsActive,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("gagal query user by id: %w", err)
	}
	return &u, nil
}

// GetByUsername mengambil satu user berdasarkan username.
func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	query := `
		SELECT id, username, email, name, password_hash, is_active, created_at, updated_at
		FROM users
		WHERE username = $1 AND deleted_at IS NULL
	`
	var u model.User
	err := r.db.QueryRowContext(ctx, query, username).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.Name,
		&u.PasswordHash,
		&u.IsActive,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("gagal query user by username: %w", err)
	}
	return &u, nil
}

// Create menyimpan user baru ke database.
func (r *UserRepository) Create(ctx context.Context, u *model.User) (*model.User, error) {
	query := `
		INSERT INTO users (username, email, name, password_hash, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRowContext(
		ctx,
		query,
		u.Username,
		u.Email,
		u.Name,
		u.PasswordHash,
		u.IsActive,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("gagal insert user: %w", err)
	}
	return u, nil
}

// Update memperbarui data profil user (name, username, email, is_active).
func (r *UserRepository) Update(ctx context.Context, u *model.User) (*model.User, error) {
	query := `
		UPDATE users
		SET username = $1, email = $2, name = $3, is_active = $4, updated_at = NOW()
		WHERE id = $5 AND deleted_at IS NULL
		RETURNING updated_at
	`
	err := r.db.QueryRowContext(
		ctx,
		query,
		u.Username,
		u.Email,
		u.Name,
		u.IsActive,
		u.ID,
	).Scan(&u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("gagal update user: %w", err)
	}
	return u, nil
}

// UpdatePassword memperbarui hash kata sandi user.
func (r *UserRepository) UpdatePassword(ctx context.Context, id uuid.UUID, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, passwordHash, id)
	if err != nil {
		return fmt.Errorf("gagal update password user: %w", err)
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrUserNotFound
	}
	return nil
}

// Delete melakukan soft delete pada user.
func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Pastikan tidak menghapus user terakhir
	var count int
	countQuery := `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`
	if err := r.db.QueryRowContext(ctx, countQuery).Scan(&count); err != nil {
		return fmt.Errorf("gagal hitung jumlah user: %w", err)
	}
	if count <= 1 {
		return ErrCannotDeleteLast
	}

	query := `
		UPDATE users
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal soft delete user: %w", err)
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrUserNotFound
	}
	return nil
}
