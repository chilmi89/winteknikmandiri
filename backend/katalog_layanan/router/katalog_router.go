package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/katalog_layanan/controller"
	"winteknikmandiri-backend/katalog_layanan/repository"
	"winteknikmandiri-backend/katalog_layanan/service"
)

// RegisterKatalogRoutes mendaftarkan seluruh endpoint untuk kategori & item layanan.
func RegisterKatalogRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewKatalogRepository(db)
	svc := service.NewKatalogService(repo)
	ctrl := controller.NewKatalogController(svc)

	// Kelompok 1: Kategori Layanan
	catGroup := rg.Group("/service-categories")
	{
		catGroup.GET("", ctrl.ListCategories)
		catGroup.POST("", ctrl.CreateCategory)
		catGroup.PUT("/:id", ctrl.UpdateCategory)
		catGroup.DELETE("/:id", ctrl.DeleteCategory)
	}

	// Kelompok 2: Item Layanan
	itemGroup := rg.Group("/service-items")
	{
		itemGroup.GET("", ctrl.ListItems)
		itemGroup.GET("/:id", ctrl.GetItemByID)
		itemGroup.POST("/upload-photo", ctrl.UploadPhoto)
		itemGroup.POST("", ctrl.CreateItem)
		itemGroup.PUT("/:id", ctrl.UpdateItem)
		itemGroup.DELETE("/:id", ctrl.DeleteItem)
	}
}
