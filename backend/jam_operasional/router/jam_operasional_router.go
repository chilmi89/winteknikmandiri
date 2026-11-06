package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/jam_operasional/controller"
	"winteknikmandiri-backend/jam_operasional/repository"
	"winteknikmandiri-backend/jam_operasional/service"
)

// RegisterJamOperasionalRoutes mendaftarkan seluruh route untuk fitur jam operasional.
func RegisterJamOperasionalRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewJamOperasionalRepository(db)
	svc := service.NewJamOperasionalService(repo)
	ctrl := controller.NewJamOperasionalController(svc)

	jamGroup := rg.Group("/jam-operasional")
	{
		jamGroup.GET("", ctrl.GetBundle)
		jamGroup.PUT("/setting", ctrl.UpdateSetting)
		jamGroup.GET("/:id", ctrl.GetByID)
		jamGroup.POST("", ctrl.Create)
		jamGroup.PUT("/:id", ctrl.Update)
		jamGroup.DELETE("/:id", ctrl.Delete)
	}
}
