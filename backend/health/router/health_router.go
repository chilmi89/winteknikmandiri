// Package router mendaftarkan endpoint health ke router Gin.
package router

import (
	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/health/controller"
)

// RegisterRoutes mendaftarkan endpoint health di root router.
func RegisterRoutes(r *gin.Engine, ctrl *controller.HealthController) {
	r.GET("/health", ctrl.Check)
}
