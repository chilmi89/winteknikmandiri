package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/keuangan/dto"
	"winteknikmandiri-backend/keuangan/service"
)

// KeuanganController menangani endpoint HTTP modul keuangan.
type KeuanganController struct {
	svc *service.KeuanganService
}

// NewKeuanganController membuat instance controller baru.
func NewKeuanganController(svc *service.KeuanganService) *KeuanganController {
	return &KeuanganController{svc: svc}
}

// ---------- 1. KATEGORI CONTROLLER ----------

// ListKategori godoc
// @Summary     Daftar kategori keuangan (pemasukan / pengeluaran)
// @Tags        keuangan
// @Produce     json
// @Param       tipe query string false "Filter tipe: pemasukan / pengeluaran"
// @Success     200 {object} dto.ListKategoriEnvelope
// @Router      /api/v1/keuangan/kategori [get]
func (ctrl *KeuanganController) ListKategori(c *gin.Context) {
	tipe := c.Query("tipe")
	res, err := ctrl.svc.ListKategori(c.Request.Context(), tipe)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListKategoriEnvelope{
		Message: "Daftar kategori keuangan berhasil dimuat",
		Data:    res,
	})
}

// CreateKategori godoc
// @Summary     Tambah kategori keuangan baru
// @Tags        keuangan
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateKategoriRequest true "Data kategori"
// @Success     201 {object} dto.KategoriEnvelope
// @Router      /api/v1/keuangan/kategori [post]
func (ctrl *KeuanganController) CreateKategori(c *gin.Context) {
	var req dto.CreateKategoriRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.CreateKategori(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.KategoriEnvelope{
		Message: "Kategori keuangan berhasil dibuat",
		Data:    *res,
	})
}

// UpdateKategori godoc
// @Summary     Perbarui kategori keuangan
// @Tags        keuangan
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Kategori (UUID)"
// @Param       body body dto.UpdateKategoriRequest true "Data update"
// @Success     200 {object} dto.KategoriEnvelope
// @Router      /api/v1/keuangan/kategori/{id} [put]
func (ctrl *KeuanganController) UpdateKategori(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateKategoriRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.UpdateKategori(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.KategoriEnvelope{
		Message: "Kategori keuangan berhasil diperbarui",
		Data:    *res,
	})
}

// DeleteKategori godoc
// @Summary     Hapus kategori keuangan
// @Tags        keuangan
// @Produce     json
// @Param       id path string true "ID Kategori (UUID)"
// @Success     200 {object} dto.KeuanganMessageResponse
// @Router      /api/v1/keuangan/kategori/{id} [delete]
func (ctrl *KeuanganController) DeleteKategori(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteKategori(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.KeuanganMessageResponse{
		Message: "Kategori keuangan berhasil dihapus",
	})
}

// ---------- 2. JURNAL KEUANGAN CONTROLLER ----------

// GetNextKodeJurnal godoc
// @Summary     Ambil kode nota jurnal berikutnya
// @Tags        keuangan
// @Produce     json
// @Success     200 {object} map[string]any
// @Router      /api/v1/keuangan/jurnal/next-code [get]
func (ctrl *KeuanganController) GetNextKodeJurnal(c *gin.Context) {
	code, err := ctrl.svc.GetNextKodeJurnal(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Kode jurnal berikutnya",
		"data": gin.H{
			"next_code": code,
		},
	})
}

// GetLaporan godoc
// @Summary     Laporan & Analitik Keuangan untuk 4 periode (harian, mingguan, bulanan, tahunan)
// @Tags        keuangan
// @Produce     json
// @Param       periode query string false "Periode: harian / mingguan / bulanan / tahunan"
// @Param       tanggal query string false "Tanggal YYYY-MM-DD (harian)"
// @Param       start_date query string false "Tanggal mulai YYYY-MM-DD (mingguan)"
// @Param       end_date query string false "Tanggal selesai YYYY-MM-DD (mingguan)"
// @Param       month query int false "Bulan 1-12 (bulanan)"
// @Param       year query int false "Tahun e.g. 2026 (bulanan & tahunan)"
// @Param       order_id query string false "Filter per proyek (UUID)"
// @Param       kategori_id query string false "Filter per kategori (UUID)"
// @Param       sort_dir query string false "Urutan: asc / desc"
// @Param       page query int false "Nomor halaman" default(1)
// @Param       limit query int false "Limit per halaman" default(10)
// @Success     200 {object} dto.LaporanEnvelope
// @Router      /api/v1/keuangan/laporan [get]
func (ctrl *KeuanganController) GetLaporan(c *gin.Context) {
	periode := c.DefaultQuery("periode", "bulanan")
	tanggal := c.Query("tanggal")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	month, _ := strconv.Atoi(c.Query("month"))
	year, _ := strconv.Atoi(c.Query("year"))
	orderID := c.Query("order_id")
	kategoriID := c.Query("kategori_id")
	sortDir := c.DefaultQuery("sort_dir", "desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	res, err := ctrl.svc.GetLaporanData(
		c.Request.Context(), periode, tanggal, startDate, endDate, month, year,
		orderID, kategoriID, sortDir, page, limit,
	)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.LaporanEnvelope{
		Message: "Data laporan keuangan berhasil dimuat",
		Data:    *res,
	})
}

// ListJurnal godoc
// @Summary     Daftar buku kas & jurnal keuangan lengkap dengan summary saldo & pagination
// @Tags        keuangan
// @Produce     json
// @Param       search query string false "Cari kode, judul, catatan"
// @Param       status query string false "Filter status: draft / lunas / batal"
// @Param       cabang query string false "Filter cabang operasional"
// @Param       date_from query string false "Filter tanggal mulai (YYYY-MM-DD)"
// @Param       date_to query string false "Filter tanggal akhir (YYYY-MM-DD)"
// @Param       sort_by query string false "Sort by: tanggal / nominal / judul"
// @Param       sort_dir query string false "Sort dir: asc / desc"
// @Param       page query int false "Nomor halaman" default(1)
// @Param       limit query int false "Limit per halaman" default(10)
// @Success     200 {object} dto.ListJurnalEnvelope
// @Router      /api/v1/keuangan/jurnal [get]
func (ctrl *KeuanganController) ListJurnal(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")
	cabang := c.Query("cabang")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")
	sortBy := c.Query("sort_by")
	sortDir := c.Query("sort_dir")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	res, err := ctrl.svc.ListJurnal(
		c.Request.Context(), search, status, cabang,
		dateFrom, dateTo, sortBy, sortDir, page, limit,
	)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListJurnalEnvelope{
		Message: "Daftar jurnal kas keuangan berhasil dimuat",
		Data:    *res,
	})
}

// GetJurnalByID godoc
// @Summary     Detail transaksi jurnal kas
// @Tags        keuangan
// @Produce     json
// @Param       id path string true "ID Jurnal (UUID)"
// @Success     200 {object} dto.JurnalEnvelope
// @Router      /api/v1/keuangan/jurnal/{id} [get]
func (ctrl *KeuanganController) GetJurnalByID(c *gin.Context) {
	id := c.Param("id")
	res, err := ctrl.svc.GetJurnalByID(c.Request.Context(), id)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JurnalEnvelope{
		Message: "Detail transaksi jurnal kas berhasil dimuat",
		Data:    *res,
	})
}

// CreateJurnal godoc
// @Summary     Catat transaksi jurnal kas baru (manual / tarik dari proyek / tarik dari gaji)
// @Tags        keuangan
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateJurnalRequest true "Data transaksi"
// @Success     201 {object} dto.JurnalEnvelope
// @Router      /api/v1/keuangan/jurnal [post]
func (ctrl *KeuanganController) CreateJurnal(c *gin.Context) {
	var req dto.CreateJurnalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.CreateJurnal(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.JurnalEnvelope{
		Message: "Transaksi jurnal berhasil dicatat",
		Data:    *res,
	})
}

// UpdateJurnal godoc
// @Summary     Perbarui transaksi jurnal kas
// @Tags        keuangan
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Jurnal (UUID)"
// @Param       body body dto.UpdateJurnalRequest true "Data update"
// @Success     200 {object} dto.JurnalEnvelope
// @Router      /api/v1/keuangan/jurnal/{id} [put]
func (ctrl *KeuanganController) UpdateJurnal(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateJurnalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.UpdateJurnal(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.JurnalEnvelope{
		Message: "Transaksi jurnal berhasil diperbarui",
		Data:    *res,
	})
}

// DeleteJurnal godoc
// @Summary     Hapus transaksi jurnal kas
// @Tags        keuangan
// @Produce     json
// @Param       id path string true "ID Jurnal (UUID)"
// @Success     200 {object} dto.KeuanganMessageResponse
// @Router      /api/v1/keuangan/jurnal/{id} [delete]
func (ctrl *KeuanganController) DeleteJurnal(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteJurnal(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.KeuanganMessageResponse{
		Message: "Transaksi jurnal berhasil dihapus",
	})
}
