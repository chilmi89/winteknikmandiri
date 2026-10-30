package routes

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"winteknikmandiri-backend/controllers"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS configuration for frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	healthCtrl := controllers.NewHealthController()
	inquiryCtrl := controllers.NewInquiryController()

	// Public Health Check
	r.GET("/health", healthCtrl.Check)

	// API v1 Group
	v1 := r.Group("/api/v1")
	{
		v1.GET("/inquiries", inquiryCtrl.List)
		v1.POST("/inquiries", inquiryCtrl.Create)
	}

	return r
}
