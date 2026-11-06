package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/sosial_media/controller"
	"winteknikmandiri-backend/sosial_media/repository"
	"winteknikmandiri-backend/sosial_media/service"
)

// RegisterSosialMediaRoutes mendaftarkan seluruh route untuk fitur sosial media.
func RegisterSosialMediaRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewSosialMediaRepository(db)
	svc := service.NewSosialMediaService(repo)
	ctrl := controller.NewSosialMediaController(svc)

	sosmedGroup := rg.Group("/sosial-media")
	{
		sosmedGroup.GET("", ctrl.List)
		sosmedGroup.GET("/:id", ctrl.Get)
		sosmedGroup.POST("", ctrl.Create)
		sosmedGroup.PUT("/:id", ctrl.Update)
		sosmedGroup.DELETE("/:id", ctrl.Delete)
	}
}
