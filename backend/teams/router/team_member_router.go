package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/teams/controller"
	"winteknikmandiri-backend/teams/repository"
	"winteknikmandiri-backend/teams/service"
)

// RegisterTeamMemberRoutes mendaftarkan seluruh route untuk fitur anggota tim.
func RegisterTeamMemberRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewTeamMemberRepository(db)
	svc := service.NewTeamMemberService(repo)
	ctrl := controller.NewTeamMemberController(svc)

	teamGroup := rg.Group("/teams")
	{
		teamGroup.GET("", ctrl.List)
		teamGroup.GET("/:id", ctrl.GetByID)
		teamGroup.POST("/upload-photo", ctrl.UploadPhoto)
		teamGroup.POST("", ctrl.Create)
		teamGroup.PUT("/:id", ctrl.Update)
		teamGroup.DELETE("/:id", ctrl.Delete)
	}
}
