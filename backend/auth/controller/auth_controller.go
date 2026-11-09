package controller

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/auth/dto"
	"winteknikmandiri-backend/auth/service"
)

type AuthController struct {
	svc *service.AuthService
}

func NewAuthController(svc *service.AuthService) *AuthController {
	return &AuthController{svc: svc}
}

// Login godoc
// @Summary     Login akun admin
// @Description Memvalidasi username/email dan kata sandi terhadap database PostgreSQL.
// @Tags        auth
// @Accept      json
// @Produce     json
// @Param       request body dto.LoginRequest true "Kredensial login"
// @Success     200 {object} gin.H
// @Failure     400 {object} gin.H
// @Failure     401 {object} gin.H
// @Failure     403 {object} gin.H
// @Router      /api/v1/auth/login [post]
func (ctrl *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username dan kata sandi wajib diisi"})
		return
	}

	res, err := ctrl.svc.Login(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau kata sandi tidak cocok"})
			return
		}
		if errors.Is(err, service.ErrAccountInactive) {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan pada server"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"data":    res,
	})
}
