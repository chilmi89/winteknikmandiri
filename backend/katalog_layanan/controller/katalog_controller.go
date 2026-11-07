package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/katalog_layanan/dto"
	"winteknikmandiri-backend/katalog_layanan/service"
)

// KatalogController menangani HTTP request untuk kategori & item layanan.
type KatalogController struct {
	svc *service.KatalogService
}

// NewKatalogController membuat instance controller baru.
func NewKatalogController(svc *service.KatalogService) *KatalogController {
	return &KatalogController{svc: svc}
}

// ---------- CATEGORY ENDPOINTS ----------

// ListCategories godoc
// @Summary     Daftar kategori layanan
// @Description Mengambil daftar seluruh kategori layanan aktif.
// @Tags        kategori_layanan
// @Produce     json
// @Param       include_inactive query bool false "Sertakan nonaktif"
// @Success     200 {object} dto.ListCategoryEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/service-categories [get]
func (ctrl *KatalogController) ListCategories(c *gin.Context) {
	includeInactive := c.Query("include_inactive") == "true"
	items, err := ctrl.svc.ListCategories(c.Request.Context(), includeInactive)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListCategoryEnvelope{
		Message: "Daftar kategori layanan berhasil dimuat",
		Data:    items,
	})
}

// CreateCategory godoc
// @Summary     Tambah kategori layanan baru
// @Tags        kategori_layanan
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateCategoryRequest true "Payload kategori"
// @Success     201 {object} dto.CategoryEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/service-categories [post]
func (ctrl *KatalogController) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	created, err := ctrl.svc.CreateCategory(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.CategoryEnvelope{
		Message: "Kategori layanan berhasil ditambahkan",
		Data:    *created,
	})
}

// UpdateCategory godoc
// @Summary     Perbarui kategori layanan
// @Tags        kategori_layanan
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Kategori (UUID)"
// @Param       body body dto.UpdateCategoryRequest true "Payload edit"
// @Success     200 {object} dto.CategoryEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/service-categories/{id} [put]
func (ctrl *KatalogController) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.UpdateCategory(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.CategoryEnvelope{
		Message: "Kategori layanan berhasil diperbarui",
		Data:    *updated,
	})
}

// DeleteCategory godoc
// @Summary     Hapus kategori layanan (soft delete)
// @Tags        kategori_layanan
// @Produce     json
// @Param       id path string true "ID Kategori (UUID)"
// @Success     200 {object} dto.KatalogMessageResponse
// @Router      /api/v1/service-categories/{id} [delete]
func (ctrl *KatalogController) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteCategory(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.KatalogMessageResponse{
		Message: "Kategori layanan berhasil dihapus",
	})
}

// ---------- ITEM ENDPOINTS ----------

// ListItems godoc
// @Summary     Daftar kartu layanan
// @Description Mengambil daftar item layanan lengkap dengan nama & kode kategori.
// @Tags        service_items
// @Produce     json
// @Param       category_id query string false "Filter berdasarkan ID Kategori (UUID)"
// @Param       include_inactive query bool false "Sertakan nonaktif"
// @Success     200 {object} dto.ListItemEnvelope
// @Failure     500 {object} httpx.ErrorResponse
// @Router      /api/v1/service-items [get]
func (ctrl *KatalogController) ListItems(c *gin.Context) {
	categoryID := c.Query("category_id")
	includeInactive := c.Query("include_inactive") == "true"

	items, err := ctrl.svc.ListItems(c.Request.Context(), categoryID, includeInactive)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListItemEnvelope{
		Message: "Daftar item layanan berhasil dimuat",
		Data:    items,
	})
}

// GetItemByID godoc
// @Summary     Detail satu kartu layanan
// @Tags        service_items
// @Produce     json
// @Param       id path string true "ID Item (UUID)"
// @Success     200 {object} dto.ItemEnvelope
// @Router      /api/v1/service-items/{id} [get]
func (ctrl *KatalogController) GetItemByID(c *gin.Context) {
	id := c.Param("id")
	item, err := ctrl.svc.GetItemByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ItemEnvelope{
		Message: "Detail layanan berhasil dimuat",
		Data:    *item,
	})
}

// CreateItem godoc
// @Summary     Tambah kartu layanan baru
// @Tags        service_items
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateItemRequest true "Payload item layanan"
// @Success     201 {object} dto.ItemEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/service-items [post]
func (ctrl *KatalogController) CreateItem(c *gin.Context) {
	var req dto.CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	created, err := ctrl.svc.CreateItem(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.ItemEnvelope{
		Message: "Item layanan berhasil ditambahkan",
		Data:    *created,
	})
}

// UpdateItem godoc
// @Summary     Perbarui kartu layanan
// @Tags        service_items
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Item (UUID)"
// @Param       body body dto.UpdateItemRequest true "Payload edit"
// @Success     200 {object} dto.ItemEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/service-items/{id} [put]
func (ctrl *KatalogController) UpdateItem(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.UpdateItem(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ItemEnvelope{
		Message: "Item layanan berhasil diperbarui",
		Data:    *updated,
	})
}

// DeleteItem godoc
// @Summary     Hapus kartu layanan (soft delete)
// @Tags        service_items
// @Produce     json
// @Param       id path string true "ID Item (UUID)"
// @Success     200 {object} dto.KatalogMessageResponse
// @Router      /api/v1/service-items/{id} [delete]
func (ctrl *KatalogController) DeleteItem(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteItem(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.KatalogMessageResponse{
		Message: "Item layanan berhasil dihapus",
	})
}

// UploadPhoto godoc
// @Summary     Unggah foto layanan (Auto-Convert WebP ke MinIO)
// @Tags        service_items
// @Accept      multipart/form-data
// @Produce     json
// @Param       image formData file true "File foto layanan (JPG, PNG, WEBP)"
// @Success     200 {object} dto.UploadServicePhotoResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/service-items/upload-photo [post]
func (ctrl *KatalogController) UploadPhoto(c *gin.Context) {
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
