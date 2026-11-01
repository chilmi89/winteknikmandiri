// Package controller menerjemahkan HTTP request menjadi pemanggilan service.
package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/inquiries/dto"
	"winteknikmandiri-backend/inquiries/service"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
)

// InquiryController menangani endpoint inquiries.
type InquiryController struct {
	svc *service.InquiryService
}

// NewInquiryController membuat controller inquiry.
func NewInquiryController(svc *service.InquiryService) *InquiryController {
	return &InquiryController{svc: svc}
}

// Create menangani POST /api/v1/inquiries.
//
// @Summary     Kirim permohonan konsultasi
// @Description Menyimpan permohonan dari formulir kontak website. Status awal selalu "pending".
// @Tags        inquiries
// @Accept      json
// @Produce     json
// @Param       payload body dto.CreateInquiryRequest true "Data permohonan"
// @Success     201 {object} dto.CreateInquiryResponse
// @Failure     400 {object} httpx.ErrorResponse "Input tidak valid"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/inquiries [post]
func (h *InquiryController) Create(c *gin.Context) {
	var req dto.CreateInquiryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}

	result, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.JSON(c, http.StatusCreated, dto.CreateInquiryResponse{
		Message: "Permohonan konsultasi berhasil disimpan",
		Data:    result,
	})
}

// List menangani GET /api/v1/inquiries.
//
// @Summary     Daftar permohonan konsultasi
// @Description Menampilkan permohonan terbaru beserta total data (untuk dashboard).
// @Tags        inquiries
// @Produce     json
// @Param       limit  query int false "Jumlah data per halaman (default 20, maks 100)" default(20)
// @Param       offset query int false "Offset pagination" default(0)
// @Success     200 {object} dto.ListInquiryResponse
// @Failure     400 {object} httpx.ErrorResponse "Parameter query tidak valid"
// @Failure     503 {object} httpx.ErrorResponse "Database tidak terhubung"
// @Router      /api/v1/inquiries [get]
func (h *InquiryController) List(c *gin.Context) {
	var query dto.ListInquiryQuery
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
