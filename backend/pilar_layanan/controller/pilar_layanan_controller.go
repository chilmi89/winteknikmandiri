package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/pilar_layanan/dto"
	"winteknikmandiri-backend/pilar_layanan/service"
)

// PilarLayananController menangani request HTTP untuk entitas pilar_layanan.
type PilarLayananController struct {
	svc *service.PilarLayananService
}

// NewPilarLayananController menginisialisasi controller baru.
func NewPilarLayananController(svc *service.PilarLayananService) *PilarLayananController {
	return &PilarLayananController{svc: svc}
}

// List godoc
// @Summary     Daftar pilar layanan
// @Description Mengambil daftar pilar layanan aktif untuk homepage.
// @Tags        pilar_layanan
// @Produce     json
// @Param       include_inactive query bool false "Sertakan yang nonaktif (khusus admin)"
// @Success     200 {object} dto.ListPilarLayananEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/pilar-layanan [get]
func (ctrl *PilarLayananController) List(c *gin.Context) {
	includeInactive := c.Query("include_inactive") == "true"
	items, err := ctrl.svc.List(c.Request.Context(), dto.ListPilarLayananQuery{
		IncludeInactive: includeInactive,
	})
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListPilarLayananEnvelope{
		Message: "Daftar pilar layanan berhasil dimuat",
		Data:    items,
	})
}

// Get godoc
// @Summary     Detail satu pilar layanan
// @Description Mengambil detail pilar layanan berdasarkan ID UUID.
// @Tags        pilar_layanan
// @Produce     json
// @Param       id path string true "ID Pilar Layanan (UUID)"
// @Success     200 {object} dto.PilarLayananEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Router      /api/v1/pilar-layanan/{id} [get]
func (ctrl *PilarLayananController) Get(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.PilarLayananEnvelope{
		Message: "Data pilar layanan berhasil dimuat",
		Data:    *item,
	})
}

// Create godoc
// @Summary     Tambah pilar layanan baru
// @Description Menambahkan data kartu pilar layanan baru.
// @Tags        pilar_layanan
// @Accept      json
// @Produce     json
// @Param       body body dto.CreatePilarLayananRequest true "Payload pilar layanan"
// @Success     201 {object} dto.PilarLayananEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/pilar-layanan [post]
func (ctrl *PilarLayananController) Create(c *gin.Context) {
	var req dto.CreatePilarLayananRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	created, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.PilarLayananEnvelope{
		Message: "Pilar layanan berhasil ditambahkan",
		Data:    *created,
	})
}

// Update godoc
// @Summary     Perbarui data pilar layanan
// @Description Memperbarui pilar layanan berdasarkan ID UUID.
// @Tags        pilar_layanan
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Pilar Layanan (UUID)"
// @Param       body body dto.UpdatePilarLayananRequest true "Payload update"
// @Success     200 {object} dto.PilarLayananEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/pilar-layanan/{id} [put]
func (ctrl *PilarLayananController) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdatePilarLayananRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.PilarLayananEnvelope{
		Message: "Pilar layanan berhasil diperbarui",
		Data:    *updated,
	})
}

// Delete godoc
// @Summary     Hapus pilar layanan (soft delete)
// @Description Menghapus pilar layanan berdasarkan ID UUID.
// @Tags        pilar_layanan
// @Produce     json
// @Param       id path string true "ID Pilar Layanan (UUID)"
// @Success     200 {object} dto.PilarLayananMessageResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/pilar-layanan/{id} [delete]
func (ctrl *PilarLayananController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.PilarLayananMessageResponse{
		Message: "Pilar layanan berhasil dihapus",
	})
}
