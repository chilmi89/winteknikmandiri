// Package router mendaftarkan endpoint fitur FAQ ke router Gin.
package router

import (
	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/faqs/controller"
)

// RegisterRoutes mendaftarkan seluruh endpoint FAQ pada grup API.
func RegisterRoutes(rg *gin.RouterGroup, ctrl *controller.FAQController) {
	group := rg.Group("/faqs")
	group.GET("", ctrl.List)
	group.GET("/:id", ctrl.Get)

	// TODO(auth): lindungi endpoint tulis dengan middleware admin
	// (mis. X-Admin-Token) begitu autentikasi dashboard tersedia.
	group.POST("", ctrl.Create)
	group.PUT("/:id", ctrl.Update)
	group.DELETE("/:id", ctrl.Delete)
}
