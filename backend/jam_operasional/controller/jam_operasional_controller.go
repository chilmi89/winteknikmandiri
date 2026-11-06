package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/jam_operasional/dto"
	"winteknikmandiri-backend/jam_operasional/service"
)

// JamOperasionalController menangani HTTP request untuk fitur jam operasional.
type JamOperasionalController struct {
	svc *service.JamOperasionalService
}

// NewJamOperasionalController membuat controller baru.
func NewJamOperasionalController(svc *service.JamOperasionalService) *JamOperasionalController {
	return &JamOperasionalController{svc: svc}
}

// GetBundle godoc
// @Summary     Ambil bundle jadwal & setting jam operasional
// @Description Mengembalikan setting kartu jadwal dan seluruh baris hari kerja.
// @Tags        jam_operasional
// @Produce     json
// @Param       include_inactive query bool false "Sertakan baris non-aktif (khusus dashboard)"
// @Success     200 {object} dto.JamOperasionalBundleEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/jam-operasional [get]
func (ctrl *JamOperasionalController) GetBundle(c *gin.Context) {
	includeInactive := c.Query("include_inactive") == "true"
	bundle, err := ctrl.svc.GetBundle(c.Request.Context(), includeInactive)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JamOperasionalBundleEnvelope{
		Message: "Data jam operasional berhasil dimuat",
		Data:    *bundle,
	})
}

// GetByID godoc
// @Summary     Ambil satu baris jadwal
// @Description Mengambil satu baris jadwal berdasarkan ID UUID.
// @Tags        jam_operasional
// @Produce     json
// @Param       id path string true "ID Baris Jadwal (UUID)"
// @Success     200 {object} dto.JamOperasionalItemEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Router      /api/v1/jam-operasional/{id} [get]
func (ctrl *JamOperasionalController) GetByID(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JamOperasionalItemEnvelope{
		Message: "Data jadwal berhasil dimuat",
		Data:    *item,
	})
}

// Create godoc
// @Summary     Tambah baris jadwal jam operasional
// @Description Menambahkan baris jadwal kerja baru.
// @Tags        jam_operasional
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateJamOperasionalRequest true "Payload baris jadwal"
// @Success     201 {object} dto.JamOperasionalItemEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/jam-operasional [post]
func (ctrl *JamOperasionalController) Create(c *gin.Context) {
	var req dto.CreateJamOperasionalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	created, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.JamOperasionalItemEnvelope{
		Message: "Jadwal operasional berhasil ditambahkan",
		Data:    *created,
	})
}

// Update godoc
// @Summary     Perbarui baris jadwal jam operasional
// @Description Memperbarui baris jadwal kerja berdasarkan ID UUID.
// @Tags        jam_operasional
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Baris Jadwal (UUID)"
// @Param       body body dto.UpdateJamOperasionalRequest true "Payload update"
// @Success     200 {object} dto.JamOperasionalItemEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/jam-operasional/{id} [put]
func (ctrl *JamOperasionalController) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateJamOperasionalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JamOperasionalItemEnvelope{
		Message: "Jadwal operasional berhasil diperbarui",
		Data:    *updated,
	})
}

// Delete godoc
// @Summary     Hapus baris jadwal (soft delete)
// @Description Menghapus satu baris jadwal kerja berdasarkan ID UUID.
// @Tags        jam_operasional
// @Produce     json
// @Param       id path string true "ID Baris Jadwal (UUID)"
// @Success     200 {object} dto.JamOperasionalMessageResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/jam-operasional/{id} [delete]
func (ctrl *JamOperasionalController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JamOperasionalMessageResponse{
		Message: "Jadwal operasional berhasil dihapus",
	})
}

// UpdateSetting godoc
// @Summary     Perbarui pengaturan kartu jam operasional
// @Description Mengubah badge teks atas, judul, dan catatan kaki berbintang.
// @Tags        jam_operasional
// @Accept      json
// @Produce     json
// @Param       body body dto.UpdateJamOperasionalSettingRequest true "Payload setting"
// @Success     200 {object} dto.JamOperasionalSettingEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/jam-operasional/setting [put]
func (ctrl *JamOperasionalController) UpdateSetting(c *gin.Context) {
	var req dto.UpdateJamOperasionalSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.UpdateSetting(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JamOperasionalSettingEnvelope{
		Message: "Pengaturan jam operasional berhasil diperbarui",
		Data:    *updated,
	})
}
