package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/sosial_media/dto"
	"winteknikmandiri-backend/sosial_media/service"
)

// SosialMediaController menangani request HTTP untuk entitas sosial_media.
type SosialMediaController struct {
	svc *service.SosialMediaService
}

// NewSosialMediaController menginisialisasi controller baru.
func NewSosialMediaController(svc *service.SosialMediaService) *SosialMediaController {
	return &SosialMediaController{svc: svc}
}

// List godoc
// @Summary     Daftar sosial media
// @Description Mengambil daftar sosial media aktif untuk publik / admin.
// @Tags        sosial_media
// @Produce     json
// @Param       include_inactive query bool false "Sertakan yang nonaktif (khusus admin)"
// @Success     200 {object} dto.ListSosialMediaEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/sosial-media [get]
func (ctrl *SosialMediaController) List(c *gin.Context) {
	includeInactive := c.Query("include_inactive") == "true"
	items, err := ctrl.svc.List(c.Request.Context(), dto.ListSosialMediaQuery{
		IncludeInactive: includeInactive,
	})
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListSosialMediaEnvelope{
		Message: "Daftar sosial media berhasil dimuat",
		Data:    items,
	})
}

// Get godoc
// @Summary     Detail satu sosial media
// @Description Mengambil detail sosial media berdasarkan ID UUID.
// @Tags        sosial_media
// @Produce     json
// @Param       id path string true "ID Sosial Media (UUID)"
// @Success     200 {object} dto.SosialMediaEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Router      /api/v1/sosial-media/{id} [get]
func (ctrl *SosialMediaController) Get(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.SosialMediaEnvelope{
		Message: "Data sosial media berhasil dimuat",
		Data:    *item,
	})
}

// Create godoc
// @Summary     Tambah sosial media baru
// @Description Menambahkan data sosial media baru.
// @Tags        sosial_media
// @Accept      json
// @Produce     json
// @Param       payload body dto.CreateSosialMediaRequest true "Payload sosial media"
// @Success     201 {object} dto.SosialMediaEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/sosial-media [post]
func (ctrl *SosialMediaController) Create(c *gin.Context) {
	var req dto.CreateSosialMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Payload tidak valid", err.Error()))
		return
	}
	item, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.SosialMediaEnvelope{
		Message: "Sosial media berhasil ditambahkan",
		Data:    *item,
	})
}

// Update godoc
// @Summary     Perbarui data sosial media
// @Description Memperbarui data sosial media berdasarkan ID UUID.
// @Tags        sosial_media
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Sosial Media (UUID)"
// @Param       payload body dto.UpdateSosialMediaRequest true "Payload perbaruan sosial media"
// @Success     200 {object} dto.SosialMediaEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/sosial-media/{id} [put]
func (ctrl *SosialMediaController) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSosialMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Payload tidak valid", err.Error()))
		return
	}
	item, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.SosialMediaEnvelope{
		Message: "Data sosial media berhasil diperbarui",
		Data:    *item,
	})
}

// Delete godoc
// @Summary     Hapus sosial media (soft delete)
// @Description Menghapus sosial media berdasarkan ID UUID.
// @Tags        sosial_media
// @Produce     json
// @Param       id path string true "ID Sosial Media (UUID)"
// @Success     200 {object} dto.SosialMediaMessageResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/sosial-media/{id} [delete]
func (ctrl *SosialMediaController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.SosialMediaMessageResponse{
		Message: "Sosial media berhasil dihapus",
	})
}
