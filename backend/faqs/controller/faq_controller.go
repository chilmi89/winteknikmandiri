// Package controller menerjemahkan HTTP request menjadi pemanggilan service FAQ.
package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"winteknikmandiri-backend/faqs/dto"
	"winteknikmandiri-backend/faqs/service"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
)

// FAQController menangani endpoint FAQ.
type FAQController struct {
	svc *service.FAQService
}

// NewFAQController membuat controller FAQ.
func NewFAQController(svc *service.FAQService) *FAQController {
	return &FAQController{svc: svc}
}

// List menangani GET /api/v1/faqs.
//
// @Summary     Daftar FAQ
// @Description Endpoint publik. Secara default hanya mengembalikan FAQ aktif, urut sort_order.
// @Tags        faqs
// @Produce     json
// @Param       category         query string false "Filter kategori"
// @Param       search           query string false "Cari pada pertanyaan atau jawaban"
// @Param       include_inactive query bool   false "Ikutkan FAQ non-aktif (untuk dashboard)"
// @Param       limit            query int    false "Jumlah data per halaman (default 20, maks 100)" default(20)
// @Param       offset           query int    false "Offset pagination" default(0)
// @Success     200 {object} dto.ListFAQResponse
// @Failure     400 {object} httpx.ErrorResponse "Parameter query tidak valid"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/faqs [get]
func (h *FAQController) List(c *gin.Context) {
	var query dto.ListFAQQuery
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

// Get menangani GET /api/v1/faqs/:id.
//
// @Summary     Detail FAQ
// @Description Mengambil satu FAQ berdasarkan ID.
// @Tags        faqs
// @Produce     json
// @Param       id path string true "ID FAQ (UUID)"
// @Success     200 {object} dto.FAQEnvelope
// @Failure     400 {object} httpx.ErrorResponse "ID tidak valid"
// @Failure     404 {object} httpx.ErrorResponse "FAQ tidak ditemukan"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/faqs/{id} [get]
func (h *FAQController) Get(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	result, err := h.svc.Get(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.FAQEnvelope{Data: result})
}

// Create menangani POST /api/v1/faqs.
//
// @Summary     Buat FAQ baru
// @Description Menambahkan FAQ. is_active default true bila tidak dikirim.
// @Tags        faqs
// @Accept      json
// @Produce     json
// @Param       payload body dto.CreateFAQRequest true "Data FAQ"
// @Success     201 {object} dto.FAQEnvelope
// @Failure     400 {object} httpx.ErrorResponse "Input tidak valid"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/faqs [post]
func (h *FAQController) Create(c *gin.Context) {
	var req dto.CreateFAQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}

	result, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusCreated, dto.FAQEnvelope{
		Message: "FAQ berhasil dibuat",
		Data:    result,
	})
}

// Update menangani PUT /api/v1/faqs/:id.
//
// @Summary     Perbarui FAQ
// @Description Field opsional (category, sort_order, is_active) dipertahankan bila tidak dikirim.
// @Tags        faqs
// @Accept      json
// @Produce     json
// @Param       id      path string                true "ID FAQ (UUID)"
// @Param       payload body dto.UpdateFAQRequest true "Data FAQ"
// @Success     200 {object} dto.FAQEnvelope
// @Failure     400 {object} httpx.ErrorResponse "Input tidak valid"
// @Failure     404 {object} httpx.ErrorResponse "FAQ tidak ditemukan"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/faqs/{id} [put]
func (h *FAQController) Update(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var req dto.UpdateFAQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}

	result, err := h.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.FAQEnvelope{
		Message: "FAQ berhasil diperbarui",
		Data:    result,
	})
}

// Delete menangani DELETE /api/v1/faqs/:id.
//
// @Summary     Hapus FAQ
// @Description Soft delete: data tidak dihapus permanen, hanya diisi deleted_at.
// @Tags        faqs
// @Produce     json
// @Param       id path string true "ID FAQ (UUID)"
// @Success     200 {object} dto.FAQMessageResponse
// @Failure     400 {object} httpx.ErrorResponse "ID tidak valid"
// @Failure     404 {object} httpx.ErrorResponse "FAQ tidak ditemukan"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/faqs/{id} [delete]
func (h *FAQController) Delete(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, dto.FAQMessageResponse{Message: "FAQ berhasil dihapus"})
}

func parseID(c *gin.Context) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil || id == uuid.Nil {
		httpx.Fail(c, apperr.Validation("ID FAQ tidak valid", "id harus UUID yang valid"))
		return uuid.Nil, false
	}
	return id, true
}
