package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"winteknikmandiri-backend/config"
)

type HealthController struct{}

func NewHealthController() *HealthController {
	return &HealthController{}
}

func (h *HealthController) Check(c *gin.Context) {
	dbStatus := "disconnected"
	if config.DB != nil {
		sqlDB, err := config.DB.DB()
		if err == nil && sqlDB.Ping() == nil {
			dbStatus = "connected"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "CV Win Teknik Mandiri API",
		"database":  dbStatus,
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
