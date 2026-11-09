package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/auth/controller"
	"winteknikmandiri-backend/auth/service"
)

// RegisterAuthRoutes mendaftarkan endpoint otentikasi login.
func RegisterAuthRoutes(rg *gin.RouterGroup, db *sql.DB) {
	svc := service.NewAuthService(db)
	ctrl := controller.NewAuthController(svc)

	authGroup := rg.Group("/auth")
	{
		authGroup.POST("/login", ctrl.Login)
	}
}
