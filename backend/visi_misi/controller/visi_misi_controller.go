package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/visi_misi/dto"
	"winteknikmandiri-backend/visi_misi/service"
)

// VisiMisiController menangani request HTTP untuk entitas visi_setting dan misi.
type VisiMisiController struct {
	svc *service.VisiMisiService
}

// NewVisiMisiController menginisialisasi controller baru.
func NewVisiMisiController(svc *service.VisiMisiService) *VisiMisiController {
	return &VisiMisiController{svc: svc}
}

// GetBundle godoc
// @Summary     Bundle visi dan misi perusahaan
// @Description Mengambil visi dan daftar kartu misi aktif untuk halaman tentang-kami.
// @Tags        visi_misi
// @Produce     json
// @Param       include_inactive query bool false "Sertakan misi nonaktif (admin)"
// @Success     200 {object} dto.VisiMisiBundleEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/visi-misi [get]
func (ctrl *VisiMisiController) GetBundle(c *gin.Context) {
	includeInactive := c.Query("include_inactive") == "true"
	bundle, err := ctrl.svc.GetBundle(c.Request.Context(), includeInactive)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.VisiMisiBundleEnvelope{
		Message: "Data visi dan misi berhasil dimuat",
		Data:    *bundle,
	})
}

// UpdateVisi godoc
// @Summary     Perbarui teks visi perusahaan
// @Description Memperbarui kutipan visi perusahaan.
// @Tags        visi_misi
// @Accept      json
// @Produce     json
// @Param       payload body dto.UpdateVisiRequest true "Payload update visi"
// @Success     200 {object} dto.VisiEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/visi-misi/visi [put]
func (ctrl *VisiMisiController) UpdateVisi(c *gin.Context) {
	var req dto.UpdateVisiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Payload tidak valid", err.Error()))
		return
	}
	res, err := ctrl.svc.UpdateVisi(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.VisiEnvelope{
		Message: "Visi perusahaan berhasil diperbarui",
		Data:    *res,
	})
}

// GetMisi godoc
// @Summary     Detail satu butir misi
// @Description Mengambil detail misi berdasarkan ID UUID.
// @Tags        visi_misi
// @Produce     json
// @Param       id path string true "ID Misi (UUID)"
// @Success     200 {object} dto.MisiEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Router      /api/v1/visi-misi/misi/{id} [get]
func (ctrl *VisiMisiController) GetMisi(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetMisiByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.MisiEnvelope{
		Message: "Data misi berhasil dimuat",
		Data:    *item,
	})
}

// CreateMisi godoc
// @Summary     Tambah butir misi baru
// @Description Menambahkan kartu butir misi baru.
// @Tags        visi_misi
// @Accept      json
// @Produce     json
// @Param       payload body dto.CreateMisiRequest true "Payload kartu misi"
// @Success     201 {object} dto.MisiEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/visi-misi/misi [post]
func (ctrl *VisiMisiController) CreateMisi(c *gin.Context) {
	var req dto.CreateMisiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Payload tidak valid", err.Error()))
		return
	}
	item, err := ctrl.svc.CreateMisi(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.MisiEnvelope{
		Message: "Butir misi berhasil ditambahkan",
		Data:    *item,
	})
}

// UpdateMisi godoc
// @Summary     Perbarui kartu butir misi
// @Description Memperbarui data butir misi berdasarkan ID UUID.
// @Tags        visi_misi
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Misi (UUID)"
// @Param       payload body dto.UpdateMisiRequest true "Payload update misi"
// @Success     200 {object} dto.MisiEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/visi-misi/misi/{id} [put]
func (ctrl *VisiMisiController) UpdateMisi(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateMisiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Payload tidak valid", err.Error()))
		return
	}
	item, err := ctrl.svc.UpdateMisi(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.MisiEnvelope{
		Message: "Butir misi berhasil diperbarui",
		Data:    *item,
	})
}

// DeleteMisi godoc
// @Summary     Hapus butir misi (soft delete)
// @Description Menghapus kartu misi berdasarkan ID UUID.
// @Tags        visi_misi
// @Produce     json
// @Param       id path string true "ID Misi (UUID)"
// @Success     200 {object} dto.VisiMisiMessageResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/visi-misi/misi/{id} [delete]
func (ctrl *VisiMisiController) DeleteMisi(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteMisi(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.VisiMisiMessageResponse{
		Message: "Butir misi berhasil dihapus",
	})
}
