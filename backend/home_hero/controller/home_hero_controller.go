package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/home_hero/dto"
	"winteknikmandiri-backend/home_hero/service"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
)

type HomeHeroController struct {
	svc *service.HomeHeroService
}

func NewHomeHeroController(svc *service.HomeHeroService) *HomeHeroController {
	return &HomeHeroController{svc: svc}
}

// Get menangani GET /api/v1/home-hero (publik).
func (h *HomeHeroController) Get(c *gin.Context) {
	hero, err := h.svc.GetActive(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	c.JSON(http.StatusOK, dto.HomeHeroEnvelope{
		Message: "Data hero berhasil dimuat",
		Data:    *hero,
	})
}

// Update menangani PUT /api/v1/home-hero (admin).
func (h *HomeHeroController) Update(c *gin.Context) {
	var req dto.UpdateHomeHeroRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}

	updated, err := h.svc.Update(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	c.JSON(http.StatusOK, dto.HomeHeroEnvelope{
		Message: "Konfigurasi hero berhasil disimpan",
		Data:    *updated,
	})
}
