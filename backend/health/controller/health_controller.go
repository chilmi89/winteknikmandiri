// Package controller menangani endpoint health check.
package controller

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/httpx"
)

// HealthController melaporkan status server dan koneksi database.
type HealthController struct {
	db *sql.DB
}

// NewHealthController membuat controller health dengan pool database.
func NewHealthController(db *sql.DB) *HealthController {
	return &HealthController{db: db}
}

// Check menangani GET /health.
//
// @Summary     Health check
// @Description Menunjukkan status server dan koneksi database PostgreSQL.
// @Tags        system
// @Produce     json
// @Success     200 {object} httpx.HealthResponse
// @Router      /health [get]
func (h *HealthController) Check(c *gin.Context) {
	dbStatus := "disconnected"
	if h.db != nil {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()
		if err := h.db.PingContext(ctx); err == nil {
			dbStatus = "connected"
		}
	}

	httpx.JSON(c, http.StatusOK, httpx.HealthResponse{
		Status:    "healthy",
		Service:   "CV Win Teknik Mandiri API",
		Database:  dbStatus,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}
