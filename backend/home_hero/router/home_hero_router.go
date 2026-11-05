package router

import (
	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/home_hero/controller"
)

// RegisterRoutes mendaftarkan endpoint hero ke router Gin.
func RegisterRoutes(rg *gin.RouterGroup, ctrl *controller.HomeHeroController) {
	group := rg.Group("/home-hero")
	group.GET("", ctrl.Get)
	group.PUT("", ctrl.Update)
}
