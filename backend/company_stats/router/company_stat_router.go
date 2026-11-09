package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/company_stats/controller"
	"winteknikmandiri-backend/company_stats/repository"
	"winteknikmandiri-backend/company_stats/service"
)

// RegisterCompanyStatRoutes mendaftarkan seluruh route untuk angka pencapaian perusahaan.
func RegisterCompanyStatRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewCompanyStatRepository(db)
	svc := service.NewCompanyStatService(repo)
	ctrl := controller.NewCompanyStatController(svc)

	statsGroup := rg.Group("/company-stats")
	{
		statsGroup.GET("", ctrl.ListPublic)
		statsGroup.GET("/admin", ctrl.ListAdmin)
		statsGroup.GET("/:id", ctrl.GetByID)
		statsGroup.POST("", ctrl.Create)
		statsGroup.PUT("/:id", ctrl.Update)
		statsGroup.PUT("/:id/toggle", ctrl.ToggleActive)
		statsGroup.DELETE("/:id", ctrl.Delete)
	}
}
