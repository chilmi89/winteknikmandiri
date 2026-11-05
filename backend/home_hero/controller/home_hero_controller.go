package controller

import (
	"fmt"
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

// UploadMedia menangani POST /api/v1/home-hero/upload (multipart form-data).
func (h *HomeHeroController) UploadMedia(c *gin.Context) {
	// Batasi ukuran upload maksimal 100MB untuk video hero
	const maxUploadSize = 100 << 20
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		fileHeader, err = c.FormFile("media")
		if err != nil {
			httpx.Fail(c, apperr.Validation("File tidak ditemukan", "Wajib menyertakan file pada field 'file' atau 'media'"))
			return
		}
	}

	src, err := fileHeader.Open()
	if err != nil {
		httpx.Fail(c, fmt.Errorf("membuka file upload: %w", err))
		return
	}
	defer src.Close()

	contentType := fileHeader.Header.Get("Content-Type")
	publicURL, err := h.svc.UploadMedia(c.Request.Context(), fileHeader.Filename, src, fileHeader.Size, contentType)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "File berhasil diunggah",
		"url":     publicURL,
	})
}
