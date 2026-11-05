// Package router mendaftarkan endpoint HTTP fitur Layanan pada router Gin.
package router

import (
	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/services/controller"
)

// RegisterRoutes mendaftarkan seluruh endpoint Layanan pada router group API v1.
func RegisterRoutes(rg *gin.RouterGroup, ctrl *controller.ServiceController) {
	group := rg.Group("/services")
	group.GET("", ctrl.List)
	group.GET("/:id", ctrl.Get)
	group.GET("/slug/:slug", ctrl.GetBySlug)
	group.POST("", ctrl.Create)
	group.PUT("/:id", ctrl.Update)
	group.DELETE("/:id", ctrl.Delete)
	group.POST("/upload-image", ctrl.UploadImage)
}
