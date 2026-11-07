package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/gallery/controller"
	"winteknikmandiri-backend/gallery/repository"
	"winteknikmandiri-backend/gallery/service"
)

// RegisterGalleryRoutes mendaftarkan seluruh endpoint fitur galeri proyek.
func RegisterGalleryRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewGalleryProjectRepository(db)
	svc := service.NewGalleryProjectService(repo)
	ctrl := controller.NewGalleryProjectController(svc)

	galleryGroup := rg.Group("/gallery")
	{
		galleryGroup.GET("", ctrl.GetBundle)
		galleryGroup.GET("/:id", ctrl.GetByID)
		galleryGroup.POST("/upload-photo", ctrl.UploadPhoto)
		galleryGroup.POST("", ctrl.Create)
		galleryGroup.PUT("/:id", ctrl.Update)
		galleryGroup.DELETE("/:id", ctrl.Delete)
	}
}
