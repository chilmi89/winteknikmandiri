package service

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"winteknikmandiri-backend/users/dto"
	"winteknikmandiri-backend/users/model"
	"winteknikmandiri-backend/users/repository"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) List(ctx context.Context) ([]dto.UserResponse, error) {
	users, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	return dto.ToUserResponses(users), nil
}

func (s *UserService) GetByID(ctx context.Context, id uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	res := dto.ToUserResponse(user)
	return &res, nil
}

func (s *UserService) Create(ctx context.Context, req dto.CreateUserRequest) (*dto.UserResponse, error) {
	username := strings.ToLower(strings.TrimSpace(req.Username))
	email := strings.ToLower(strings.TrimSpace(req.Email))
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = username
	}

	if len(req.Password) < 6 {
		return nil, errors.New("kata sandi minimal 6 karakter")
	}

	// Cek apakah username sudah ada
	existing, _ := s.repo.GetByUsername(ctx, username)
	if existing != nil {
		return nil, repository.ErrUsernameExists
	}

	// Hash password menggunakan bcrypt
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := &model.User{
		Username:     username,
		Email:        email,
		Name:         name,
		PasswordHash: string(hashed),
		IsActive:     true,
	}

	created, err := s.repo.Create(ctx, newUser)
	if err != nil {
		if strings.Contains(err.Error(), "users_username_key") {
			return nil, repository.ErrUsernameExists
		}
		if strings.Contains(err.Error(), "users_email_key") {
			return nil, repository.ErrEmailExists
		}
		return nil, err
	}

	res := dto.ToUserResponse(created)
	return &res, nil
}

func (s *UserService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	user.Username = strings.ToLower(strings.TrimSpace(req.Username))
	user.Email = strings.ToLower(strings.TrimSpace(req.Email))
	user.Name = strings.TrimSpace(req.Name)
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	updated, err := s.repo.Update(ctx, user)
	if err != nil {
		if strings.Contains(err.Error(), "users_username_key") {
			return nil, repository.ErrUsernameExists
		}
		if strings.Contains(err.Error(), "users_email_key") {
			return nil, repository.ErrEmailExists
		}
		return nil, err
	}

	res := dto.ToUserResponse(updated)
	return &res, nil
}

func (s *UserService) ResetPassword(ctx context.Context, id uuid.UUID, req dto.ResetPasswordRequest) error {
	if len(req.NewPassword) < 6 {
		return errors.New("kata sandi baru minimal 6 karakter")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(ctx, id, string(hashed))
}

func (s *UserService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
