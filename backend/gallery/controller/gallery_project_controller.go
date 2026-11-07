package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/gallery/dto"
	"winteknikmandiri-backend/gallery/service"
	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
)

// GalleryProjectController menangani HTTP request untuk galeri portofolio.
type GalleryProjectController struct {
	svc *service.GalleryProjectService
}

// NewGalleryProjectController membuat controller baru.
func NewGalleryProjectController(svc *service.GalleryProjectService) *GalleryProjectController {
	return &GalleryProjectController{svc: svc}
}

// GetBundle godoc
// @Summary     Ambil bundle proyek galeri & filter kategori dinamis
// @Description Mengembalikan seluruh daftar proyek, total counter, dan tab kategori unik yang dihitung otomatis.
// @Tags        gallery
// @Produce     json
// @Param       category query string false "Filter kategori tertentu (mis. Mall & Retail)"
// @Param       include_inactive query bool false "Sertakan yang non-aktif (khusus dashboard)"
// @Success     200 {object} dto.GalleryBundleEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/gallery [get]
func (ctrl *GalleryProjectController) GetBundle(c *gin.Context) {
	category := c.Query("category")
	includeInactive := c.Query("include_inactive") == "true"

	bundle, err := ctrl.svc.GetBundle(c.Request.Context(), category, includeInactive)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GalleryBundleEnvelope{
		Message: "Data galeri proyek berhasil dimuat",
		Data:    *bundle,
	})
}

// GetByID godoc
// @Summary     Detail satu proyek galeri
// @Description Mengambil satu proyek berdasarkan ID UUID.
// @Tags        gallery
// @Produce     json
// @Param       id path string true "ID Proyek (UUID)"
// @Success     200 {object} dto.GalleryProjectEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Router      /api/v1/gallery/{id} [get]
func (ctrl *GalleryProjectController) GetByID(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GalleryProjectEnvelope{
		Message: "Data proyek berhasil dimuat",
		Data:    *item,
	})
}

// Create godoc
// @Summary     Tambah proyek galeri baru
// @Description Menambahkan data dokumentasi proyek baru (kategori bebas diinput).
// @Tags        gallery
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateGalleryProjectRequest true "Payload proyek galeri"
// @Success     201 {object} dto.GalleryProjectEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/gallery [post]
func (ctrl *GalleryProjectController) Create(c *gin.Context) {
	var req dto.CreateGalleryProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	created, err := ctrl.svc.Create(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.GalleryProjectEnvelope{
		Message: "Proyek galeri berhasil ditambahkan",
		Data:    *created,
	})
}

// Update godoc
// @Summary     Perbarui proyek galeri
// @Description Memperbarui data proyek galeri berdasarkan ID UUID.
// @Tags        gallery
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Proyek (UUID)"
// @Param       body body dto.UpdateGalleryProjectRequest true "Payload update"
// @Success     200 {object} dto.GalleryProjectEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/gallery/{id} [put]
func (ctrl *GalleryProjectController) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateGalleryProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GalleryProjectEnvelope{
		Message: "Proyek galeri berhasil diperbarui",
		Data:    *updated,
	})
}

// Delete godoc
// @Summary     Hapus proyek galeri (soft delete)
// @Description Menghapus satu proyek berdasarkan ID UUID.
// @Tags        gallery
// @Produce     json
// @Param       id path string true "ID Proyek (UUID)"
// @Success     200 {object} dto.GalleryMessageResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     404 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/gallery/{id} [delete]
func (ctrl *GalleryProjectController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.GalleryMessageResponse{
		Message: "Proyek galeri berhasil dihapus",
	})
}

// UploadPhoto godoc
// @Summary     Unggah foto galeri (Auto-Convert & Kompresi WebP ke MinIO)
// @Description Menerima file gambar (JPG, JPEG, PNG, WEBP), otomatis di-encode ke WebP dengan kompresi berkualitas tinggi, lalu disimpan ke MinIO bucket wtm-media/gallery.
// @Tags        gallery
// @Accept      multipart/form-data
// @Produce     json
// @Param       image formData file true "File foto galeri (JPG, PNG, WEBP)"
// @Success     200 {object} dto.UploadGalleryPhotoResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/gallery/upload-photo [post]
func (ctrl *GalleryProjectController) UploadPhoto(c *gin.Context) {
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
