package controller

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/users/dto"
	"winteknikmandiri-backend/users/repository"
	"winteknikmandiri-backend/users/service"
)

type UserController struct {
	svc *service.UserService
}

func NewUserController(svc *service.UserService) *UserController {
	return &UserController{svc: svc}
}

// List mengambil daftar semua user.
func (ctrl *UserController) List(c *gin.Context) {
	users, err := ctrl.svc.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Daftar pengguna berhasil dimuat",
		"data":    users,
	})
}

// GetByID mengambil data 1 user berdasarkan ID.
func (ctrl *UserController) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID pengguna tidak valid"})
		return
	}

	user, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Detail pengguna berhasil dimuat",
		"data":    user,
	})
}

// Create membuat user baru.
func (ctrl *UserController) Create(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid: " + err.Error()})
		return
	}

	created, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, repository.ErrUsernameExists) || errors.Is(err, repository.ErrEmailExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pengguna baru berhasil ditambahkan",
		"data":    created,
	})
}

// Update mengubah profil user.
func (ctrl *UserController) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID pengguna tidak valid"})
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid: " + err.Error()})
		return
	}

	updated, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
			return
		}
		if errors.Is(err, repository.ErrUsernameExists) || errors.Is(err, repository.ErrEmailExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil pengguna berhasil diperbarui",
		"data":    updated,
	})
}

// ResetPassword mereset atau mengganti kata sandi user.
func (ctrl *UserController) ResetPassword(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID pengguna tidak valid"})
		return
	}

	var req dto.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kata sandi minimal 6 karakter"})
		return
	}

	err = ctrl.svc.ResetPassword(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Kata sandi pengguna berhasil diubah",
	})
}

// Delete menghapus user.
func (ctrl *UserController) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID pengguna tidak valid"})
		return
	}

	err = ctrl.svc.Delete(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
			return
		}
		if errors.Is(err, repository.ErrCannotDeleteLast) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	httpx.JSON(c, http.StatusOK, gin.H{
		"message": "Pengguna berhasil dihapus",
	})
}
