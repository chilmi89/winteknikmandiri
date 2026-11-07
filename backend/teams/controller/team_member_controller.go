package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/teams/dto"
	"winteknikmandiri-backend/teams/service"
)

// TeamMemberController menangani HTTP endpoint untuk fitur anggota tim.
type TeamMemberController struct {
	svc *service.TeamMemberService
}

// NewTeamMemberController membuat instance controller baru.
func NewTeamMemberController(svc *service.TeamMemberService) *TeamMemberController {
	return &TeamMemberController{svc: svc}
}

// List godoc
// @Summary     Daftar tim teknisi
// @Description Mengambil daftar anggota tim aktif untuk halaman Tentang Kami & dashboard.
// @Tags        teams
// @Produce     json
// @Param       include_inactive query bool false "Sertakan yang nonaktif (khusus dashboard)"
// @Success     200 {object} dto.ListTeamMemberEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/teams [get]
func (ctrl *TeamMemberController) List(c *gin.Context) {
	includeInactive := c.Query("include_inactive") == "true"
	items, err := ctrl.svc.List(c.Request.Context(), includeInactive)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListTeamMemberEnvelope{
		Message: "Daftar anggota tim berhasil dimuat",
		Data:    items,
	})
}

// GetByID godoc
// @Summary     Detail satu anggota tim
// @Description Mengambil satu anggota tim berdasarkan ID UUID.
// @Tags        teams
// @Produce     json
// @Param       id path string true "ID Tim (UUID)"
// @Success     200 {object} dto.TeamMemberEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Router      /api/v1/teams/{id} [get]
func (ctrl *TeamMemberController) GetByID(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.TeamMemberEnvelope{
		Message: "Data tim berhasil dimuat",
		Data:    *item,
	})
}

// Create godoc
// @Summary     Tambah anggota tim baru
// @Description Menambahkan data tim baru (nama, skill, foto WebP).
// @Tags        teams
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateTeamMemberRequest true "Payload anggota tim"
// @Success     201 {object} dto.TeamMemberEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/teams [post]
func (ctrl *TeamMemberController) Create(c *gin.Context) {
	var req dto.CreateTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	created, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.TeamMemberEnvelope{
		Message: "Anggota tim berhasil ditambahkan",
		Data:    *created,
	})
}

// Update godoc
// @Summary     Perbarui data anggota tim
// @Description Memperbarui data tim berdasarkan ID UUID.
// @Tags        teams
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Tim (UUID)"
// @Param       body body dto.UpdateTeamMemberRequest true "Payload update"
// @Success     200 {object} dto.TeamMemberEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/teams/{id} [put]
func (ctrl *TeamMemberController) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.TeamMemberEnvelope{
		Message: "Data tim berhasil diperbarui",
		Data:    *updated,
	})
}

// Delete godoc
// @Summary     Hapus anggota tim (soft delete)
// @Description Menghapus anggota tim berdasarkan ID UUID.
// @Tags        teams
// @Produce     json
// @Param       id path string true "ID Tim (UUID)"
// @Success     200 {object} dto.TeamMemberMessageResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/teams/{id} [delete]
func (ctrl *TeamMemberController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.TeamMemberMessageResponse{
		Message: "Anggota tim berhasil dihapus",
	})
}

// UploadPhoto godoc
// @Summary     Unggah foto tim (Auto-Convert & Kompresi WebP ke MinIO)
// @Description Menerima file gambar (JPG, JPEG, PNG, WEBP), otomatis di-encode ke WebP dengan kompresi berkualitas tinggi, lalu disimpan ke MinIO bucket wtm-media/teams.
// @Tags        teams
// @Accept      multipart/form-data
// @Produce     json
// @Param       image formData file true "File foto tim (JPG, PNG, WEBP)"
// @Success     200 {object} dto.UploadTeamPhotoResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/teams/upload-photo [post]
func (ctrl *TeamMemberController) UploadPhoto(c *gin.Context) {
	// Batasi ukuran upload maksimal 10MB
	const maxUploadSize = 10 << 20
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)

	fileHeader, err := c.FormFile("image")
	if err != nil {
		fileHeader, err = c.FormFile("file")
		if err != nil {
			httpx.Fail(c, apperr.Validation("File foto tidak ditemukan", "Wajib menyertakan file pada field 'image' atau 'file'"))
			return
		}
	}

	src, err := fileHeader.Open()
	if err != nil {
		httpx.Fail(c, fmt.Errorf("membuka file foto: %w", err))
		return
	}
	defer src.Close()

	res, err := ctrl.svc.UploadPhoto(c.Request.Context(), fileHeader.Filename, src)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	c.JSON(http.StatusOK, res)
}
