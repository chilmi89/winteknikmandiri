// Package router mendaftarkan endpoint fitur inquiries ke router Gin.
package router

import (
	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/inquiries/controller"
)

// RegisterRoutes mendaftarkan seluruh endpoint inquiries pada grup API.
func RegisterRoutes(rg *gin.RouterGroup, ctrl *controller.InquiryController) {
	group := rg.Group("/inquiries")
	group.GET("", ctrl.List)
	group.POST("", ctrl.Create)
}
