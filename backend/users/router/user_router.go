package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/users/controller"
	"winteknikmandiri-backend/users/repository"
	"winteknikmandiri-backend/users/service"
)

// RegisterUserRoutes mendaftarkan seluruh route untuk manajemen pengguna (Users CRUD).
func RegisterUserRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewUserRepository(db)
	svc := service.NewUserService(repo)
	ctrl := controller.NewUserController(svc)

	userGroup := rg.Group("/users")
	{
		userGroup.GET("", ctrl.List)
		userGroup.GET("/:id", ctrl.GetByID)
		userGroup.POST("", ctrl.Create)
		userGroup.PUT("/:id", ctrl.Update)
		userGroup.PUT("/:id/reset-password", ctrl.ResetPassword)
		userGroup.DELETE("/:id", ctrl.Delete)
	}
}
