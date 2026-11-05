package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/pilar_layanan/controller"
	"winteknikmandiri-backend/pilar_layanan/repository"
	"winteknikmandiri-backend/pilar_layanan/service"
)

// RegisterPilarLayananRoutes mendaftarkan seluruh route untuk fitur pilar layanan.
func RegisterPilarLayananRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewPilarLayananRepository(db)
	svc := service.NewPilarLayananService(repo)
	ctrl := controller.NewPilarLayananController(svc)

	pilarGroup := rg.Group("/pilar-layanan")
	{
		pilarGroup.GET("", ctrl.List)
		pilarGroup.GET("/:id", ctrl.Get)
		pilarGroup.POST("", ctrl.Create)
		pilarGroup.PUT("/:id", ctrl.Update)
		pilarGroup.DELETE("/:id", ctrl.Delete)
	}
}
