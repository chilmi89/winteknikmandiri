package service

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"winteknikmandiri-backend/auth/dto"
	"winteknikmandiri-backend/users/model"
)

var (
	ErrInvalidCredentials = errors.New("username atau kata sandi salah")
	ErrAccountInactive    = errors.New("akun Anda sedang dinonaktifkan, silakan hubungi admin")
)

type AuthService struct {
	db *sql.DB
}

func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{db: db}
}

// Login memvalidasi kredensial login (bisa menggunakan username atau email).
func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.LoginResponse, error) {
	identifier := strings.ToLower(strings.TrimSpace(req.Username))
	password := strings.TrimSpace(req.Password)

	if identifier == "" || password == "" {
		return nil, ErrInvalidCredentials
	}

	query := `
		SELECT id, username, email, name, password_hash, is_active
		FROM users
		WHERE (LOWER(username) = $1 OR LOWER(email) = $1)
		  AND deleted_at IS NULL
		LIMIT 1
	`

	var u model.User
	err := s.db.QueryRowContext(ctx, query, identifier).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.Name,
		&u.PasswordHash,
		&u.IsActive,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !u.IsActive {
		return nil, ErrAccountInactive
	}

	// Verifikasi kata sandi dengan bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	return &dto.LoginResponse{
		ID:       u.ID,
		Username: u.Username,
		Email:    u.Email,
		Name:     u.Name,
	}, nil
}
