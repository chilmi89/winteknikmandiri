package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/gaji/dto"
	"winteknikmandiri-backend/gaji/service"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
)

// GajiController menangani endpoint HTTP untuk penggajian tim.
type GajiController struct {
	svc *service.GajiService
}

// NewGajiController membuat instance controller baru.
func NewGajiController(svc *service.GajiService) *GajiController {
	return &GajiController{svc: svc}
}

// ListGaji godoc
// @Summary     Daftar slip gaji tim dengan filter & pagination
// @Tags        gaji
// @Produce     json
// @Param       team_id query string false "Filter per Tim (UUID)"
// @Param       order_id query string false "Filter per Proyek / Order (UUID)"
// @Param       date query string false "Filter per tanggal YYYY-MM-DD"
// @Param       status query string false "Filter status (draft, dibayar)"
// @Param       search query string false "Cari kode gaji / nama tim"
// @Param       page query int false "Nomor halaman" default(1)
// @Param       limit query int false "Jumlah data per halaman" default(10)
// @Success     200 {object} dto.ListGajiEnvelope
// @Router      /api/v1/gaji [get]
func (ctrl *GajiController) ListGaji(c *gin.Context) {
	teamID := c.Query("team_id")
	orderID := c.Query("order_id")
	dateFilter := c.Query("date")
	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	res, err := ctrl.svc.ListGaji(c.Request.Context(), teamID, orderID, dateFilter, status, search, page, limit)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListGajiEnvelope{
		Message: "Daftar gaji tim berhasil dimuat",
		Data:    *res,
	})
}

// GetGajiDetail godoc
// @Summary     Detail slip gaji tim beserta seluruh proyek yang ditempelkan
// @Tags        gaji
// @Produce     json
// @Param       id path string true "ID Slip Gaji (UUID)"
// @Success     200 {object} dto.GajiEnvelope
// @Router      /api/v1/gaji/{id} [get]
func (ctrl *GajiController) GetGajiDetail(c *gin.Context) {
	id := c.Param("id")
	res, err := ctrl.svc.GetGajiDetail(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GajiEnvelope{
		Message: "Detail slip gaji berhasil dimuat",
		Data:    *res,
	})
}

// CreateGaji godoc
// @Summary     Buat slip gaji baru untuk tim tertentu
// @Tags        gaji
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateGajiRequest true "Payload slip gaji"
// @Success     201 {object} dto.GajiEnvelope
// @Router      /api/v1/gaji [post]
func (ctrl *GajiController) CreateGaji(c *gin.Context) {
	var req dto.CreateGajiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.CreateGaji(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.GajiEnvelope{
		Message: "Slip gaji berhasil dibuat",
		Data:    *res,
	})
}

// UpdateGaji godoc
// @Summary     Perbarui slip gaji (status, catatan, tim)
// @Tags        gaji
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Slip Gaji (UUID)"
// @Param       body body dto.UpdateGajiRequest true "Payload edit"
// @Success     200 {object} dto.GajiEnvelope
// @Router      /api/v1/gaji/{id} [put]
func (ctrl *GajiController) UpdateGaji(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateGajiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.UpdateGaji(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GajiEnvelope{
		Message: "Slip gaji berhasil diperbarui",
		Data:    *res,
	})
}

// DeleteGaji godoc
// @Summary     Hapus slip gaji (soft delete)
// @Tags        gaji
// @Produce     json
// @Param       id path string true "ID Slip Gaji (UUID)"
// @Success     200 {object} dto.GajiMessageResponse
// @Router      /api/v1/gaji/{id} [delete]
func (ctrl *GajiController) DeleteGaji(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteGaji(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GajiMessageResponse{
		Message: "Slip gaji berhasil dihapus",
	})
}

// AttachProyek godoc
// @Summary     Tempelkan proyek ke slip gaji
// @Tags        gaji
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Slip Gaji (UUID)"
// @Param       body body dto.AttachProyekRequest true "Data proyek & upah borongan"
// @Success     201 {object} dto.GajiEnvelope
// @Router      /api/v1/gaji/{id}/proyek [post]
func (ctrl *GajiController) AttachProyek(c *gin.Context) {
	gajiID := c.Param("id")
	var req dto.AttachProyekRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.AttachProyek(c.Request.Context(), gajiID, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.GajiEnvelope{
		Message: "Proyek berhasil ditempelkan ke slip gaji",
		Data:    *res,
	})
}

// UpdateProyek godoc
// @Summary     Edit nominal upah borongan proyek
// @Tags        gaji
// @Accept      json
// @Produce     json
// @Param       proyek_id path string true "ID Gaji Proyek (UUID)"
// @Param       nominal query string true "Nominal upah baru (mis. Rp 1.500.000)"
// @Param       keterangan query string false "Catatan khusus"
// @Success     200 {object} dto.GajiEnvelope
// @Router      /api/v1/gaji/proyek/{proyek_id} [put]
func (ctrl *GajiController) UpdateProyek(c *gin.Context) {
	proyekID := c.Param("proyek_id")
	nominal := c.Query("nominal")
	ket := c.Query("keterangan")
	if nominal == "" {
		httpx.Fail(c, apperr.Validation("Nominal wajib diisi", "Parameter query 'nominal' tidak boleh kosong"))
		return
	}
	res, err := ctrl.svc.UpdateProyekGaji(c.Request.Context(), proyekID, nominal, ket)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GajiEnvelope{
		Message: "Upah proyek berhasil diperbarui",
		Data:    *res,
	})
}

// DeleteProyek godoc
// @Summary     Lepas proyek dari slip gaji
// @Tags        gaji
// @Produce     json
// @Param       proyek_id path string true "ID Gaji Proyek (UUID)"
// @Success     200 {object} dto.GajiEnvelope
// @Router      /api/v1/gaji/proyek/{proyek_id} [delete]
func (ctrl *GajiController) DeleteProyek(c *gin.Context) {
	proyekID := c.Param("proyek_id")
	res, err := ctrl.svc.DeleteProyekGaji(c.Request.Context(), proyekID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GajiEnvelope{
		Message: "Proyek berhasil dilepas dari slip gaji",
		Data:    *res,
	})
}
