package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/company_stats/dto"
	"winteknikmandiri-backend/company_stats/service"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
)

// CompanyStatController menangani endpoint HTTP angka pencapaian / statistik perusahaan.
type CompanyStatController struct {
	svc *service.CompanyStatService
}

// NewCompanyStatController membuat instance controller baru.
func NewCompanyStatController(svc *service.CompanyStatService) *CompanyStatController {
	return &CompanyStatController{svc: svc}
}

// ListPublic godoc
// @Summary     Daftar statistik pencapaian aktif untuk publik (Beranda, Tentang Kami, Galeri)
// @Tags        company-stats
// @Produce     json
// @Success     200 {object} dto.ListCompanyStatEnvelope
// @Router      /api/v1/company-stats [get]
func (ctrl *CompanyStatController) ListPublic(c *gin.Context) {
	res, err := ctrl.svc.ListPublic(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListCompanyStatEnvelope{
		Message: "Statistik pencapaian berhasil dimuat",
		Data:    res,
	})
}

// ListAdmin godoc
// @Summary     Daftar statistik pencapaian untuk dashboard admin (semua status)
// @Tags        company-stats
// @Produce     json
// @Success     200 {object} dto.ListCompanyStatEnvelope
// @Router      /api/v1/company-stats/admin [get]
func (ctrl *CompanyStatController) ListAdmin(c *gin.Context) {
	res, err := ctrl.svc.ListAdmin(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListCompanyStatEnvelope{
		Message: "Data statistik admin berhasil dimuat",
		Data:    res,
	})
}

// GetByID godoc
// @Summary     Detail satu item statistik
// @Tags        company-stats
// @Produce     json
// @Param       id path string true "ID Statistik (UUID)"
// @Success     200 {object} dto.CompanyStatEnvelope
// @Router      /api/v1/company-stats/{id} [get]
func (ctrl *CompanyStatController) GetByID(c *gin.Context) {
	id := c.Param("id")
	res, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.CompanyStatEnvelope{
		Message: "Detail statistik berhasil dimuat",
		Data:    *res,
	})
}

// Create godoc
// @Summary     Tambah item statistik pencapaian baru
// @Tags        company-stats
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateCompanyStatRequest true "Data statistik"
// @Success     201 {object} dto.CompanyStatEnvelope
// @Router      /api/v1/company-stats [post]
func (ctrl *CompanyStatController) Create(c *gin.Context) {
	var req dto.CreateCompanyStatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.CompanyStatEnvelope{
		Message: "Statistik pencapaian berhasil dibuat",
		Data:    *res,
	})
}

// Update godoc
// @Summary     Perbarui data statistik pencapaian
// @Tags        company-stats
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Statistik (UUID)"
// @Param       body body dto.UpdateCompanyStatRequest true "Data update"
// @Success     200 {object} dto.CompanyStatEnvelope
// @Router      /api/v1/company-stats/{id} [put]
func (ctrl *CompanyStatController) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCompanyStatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.CompanyStatEnvelope{
		Message: "Statistik pencapaian berhasil diperbarui",
		Data:    *res,
	})
}

// ToggleActive godoc
// @Summary     Toggle status aktif/nonaktif statistik
// @Tags        company-stats
// @Produce     json
// @Param       id path string true "ID Statistik (UUID)"
// @Success     200 {object} dto.CompanyStatEnvelope
// @Router      /api/v1/company-stats/{id}/toggle [put]
func (ctrl *CompanyStatController) ToggleActive(c *gin.Context) {
	id := c.Param("id")
	res, err := ctrl.svc.ToggleActive(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.CompanyStatEnvelope{
		Message: "Status aktif statistik berhasil diubah",
		Data:    *res,
	})
}

// Delete godoc
// @Summary     Hapus data statistik
// @Tags        company-stats
// @Produce     json
// @Param       id path string true "ID Statistik (UUID)"
// @Success     200 {object} dto.CompanyStatMessageResponse
// @Router      /api/v1/company-stats/{id} [delete]
func (ctrl *CompanyStatController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.CompanyStatMessageResponse{
		Message: "Data statistik berhasil dihapus",
	})
}
