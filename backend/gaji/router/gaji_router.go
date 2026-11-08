package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/gaji/controller"
	"winteknikmandiri-backend/gaji/repository"
	"winteknikmandiri-backend/gaji/service"
)

// RegisterGajiRoutes mendaftarkan seluruh endpoint untuk modul penggajian tim multi-proyek.
func RegisterGajiRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewGajiRepository(db)
	svc := service.NewGajiService(repo)
	ctrl := controller.NewGajiController(svc)

	gajiGroup := rg.Group("/gaji")
	{
		gajiGroup.GET("", ctrl.ListGaji)
		gajiGroup.GET("/:id", ctrl.GetGajiDetail)
		gajiGroup.POST("", ctrl.CreateGaji)
		gajiGroup.PUT("/:id", ctrl.UpdateGaji)
		gajiGroup.DELETE("/:id", ctrl.DeleteGaji)

		// Operasi Rincian Proyek yang Ditempelkan
		gajiGroup.POST("/:id/proyek", ctrl.AttachProyek)
		gajiGroup.PUT("/proyek/:proyek_id", ctrl.UpdateProyek)
		gajiGroup.DELETE("/proyek/:proyek_id", ctrl.DeleteProyek)
	}
}
