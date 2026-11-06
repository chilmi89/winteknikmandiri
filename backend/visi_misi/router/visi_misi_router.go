package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/visi_misi/controller"
	"winteknikmandiri-backend/visi_misi/repository"
	"winteknikmandiri-backend/visi_misi/service"
)

// RegisterVisiMisiRoutes mendaftarkan seluruh route untuk fitur visi dan misi perusahaan.
func RegisterVisiMisiRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewVisiMisiRepository(db)
	svc := service.NewVisiMisiService(repo)
	ctrl := controller.NewVisiMisiController(svc)

	vmGroup := rg.Group("/visi-misi")
	{
		// Bundle endpoint untuk web publik
		vmGroup.GET("", ctrl.GetBundle)

		// Visi
		vmGroup.PUT("/visi", ctrl.UpdateVisi)

		// Misi CRUD
		vmGroup.GET("/misi/:id", ctrl.GetMisi)
		vmGroup.POST("/misi", ctrl.CreateMisi)
		vmGroup.PUT("/misi/:id", ctrl.UpdateMisi)
		vmGroup.DELETE("/misi/:id", ctrl.DeleteMisi)
	}
}
