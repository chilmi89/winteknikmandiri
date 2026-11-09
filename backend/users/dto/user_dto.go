package dto

import (
	"time"
	"winteknikmandiri-backend/users/model"

	"github.com/google/uuid"
)

type CreateUserRequest struct {
	Name     string `json:"name"`
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type UpdateUserRequest struct {
	Name     string `json:"name"`
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	IsActive *bool  `json:"is_active"`
}

type ResetPasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func ToUserResponse(u *model.User) UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Username:  u.Username,
		Email:     u.Email,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func ToUserResponses(users []*model.User) []UserResponse {
	res := make([]UserResponse, 0, len(users))
	for _, u := range users {
		res = append(res, ToUserResponse(u))
	}
	return res
}
