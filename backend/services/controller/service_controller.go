// Package controller menerjemahkan request HTTP menjadi pemanggilan service Layanan.
package controller

import (
	"fmt"
	"net/http"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/services/dto"
	"winteknikmandiri-backend/services/service"
)

// ServiceController menangani endpoint HTTP untuk Layanan.
type ServiceController struct {
	svc *service.ServiceService
}

// NewServiceController membuat instance baru ServiceController.
func NewServiceController(svc *service.ServiceService) *ServiceController {
	return &ServiceController{svc: svc}
}

// List menangani GET /api/v1/services.
func (h *ServiceController) List(c *gin.Context) {
	var query dto.ListServiceQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		httpx.Fail(c, apperr.Validation("Parameter query tidak valid", err.Error()))
		return
	}

	result, err := h.svc.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, result)
}

// Get menangani GET /api/v1/services/:id.
func (h *ServiceController) Get(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	result, err := h.svc.Get(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.ServiceEnvelope{Data: *result})
}

// GetBySlug menangani GET /api/v1/services/slug/:slug.
func (h *ServiceController) GetBySlug(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	if slug == "" {
		httpx.Fail(c, apperr.Validation("Slug tidak valid", "Slug wajib diisi"))
		return
	}

	result, err := h.svc.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.ServiceEnvelope{Data: *result})
}

// Create menangani POST /api/v1/services.
func (h *ServiceController) Create(c *gin.Context) {
	var req dto.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi input gagal", err.Error()))
		return
	}

	result, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusCreated, dto.ServiceEnvelope{
		Message: "Layanan berhasil ditambahkan",
		Data:    *result,
	})
}

// Update menangani PUT /api/v1/services/:id.
func (h *ServiceController) Update(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req dto.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi input gagal", err.Error()))
		return
	}

	result, err := h.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.ServiceEnvelope{
		Message: "Layanan berhasil diperbarui",
		Data:    *result,
	})
}

// Delete menangani DELETE /api/v1/services/:id.
func (h *ServiceController) Delete(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.ServiceMessageResponse{
		Message: "Layanan berhasil dihapus",
	})
}

// UploadImage menangani POST /api/v1/services/upload-image (multipart form-data).
func (h *ServiceController) UploadImage(c *gin.Context) {
	// Batasi ukuran request maksimal 10MB
	const maxUploadSize = 10 << 20
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)

	fileHeader, err := c.FormFile("image")
	if err != nil {
		// Coba fallback ke field "file"
		fileHeader, err = c.FormFile("file")
		if err != nil {
			httpx.Fail(c, apperr.Validation("File gambar tidak ditemukan", "Wajib menyertakan file pada field 'image' atau 'file'"))
			return
		}
	}

	// Validasi ekstensi gambar
	ext := strings.ToLower(path.Ext(fileHeader.Filename))
	allowed := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".avif": true,
	}
	if !allowed[ext] {
		httpx.Fail(c, apperr.Validation("Format file tidak didukung", "Format yang diizinkan: JPG, PNG, WEBP, AVIF"))
		return
	}

	src, err := fileHeader.Open()
	if err != nil {
		httpx.Fail(c, fmt.Errorf("membuka file upload: %w", err))
		return
	}
	defer src.Close()

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	res, err := h.svc.UploadImage(c.Request.Context(), fileHeader.Filename, src, fileHeader.Size, contentType)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.JSON(c, http.StatusOK, res)
}

func parseID(c *gin.Context) (uuid.UUID, bool) {
	raw := c.Param("id")
	id, err := uuid.Parse(raw)
	if err != nil {
		httpx.Fail(c, apperr.Validation("ID tidak valid", "ID harus berupa UUID yang valid"))
		return uuid.Nil, false
	}
	return id, true
}
