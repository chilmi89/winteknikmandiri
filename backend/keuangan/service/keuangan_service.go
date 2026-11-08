package service

import (
	"context"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/keuangan/dto"
	"winteknikmandiri-backend/keuangan/model"
	"winteknikmandiri-backend/keuangan/repository"
)

var nonDigitRegex = regexp.MustCompile(`[^0-9]`)

// KeuanganService mengelola alur bisnis transaksi keuangan, kategori, dan ringkasan arus kas.
type KeuanganService struct {
	repo *repository.KeuanganRepository
}

// NewKeuanganService membuat instance service baru.
func NewKeuanganService(repo *repository.KeuanganRepository) *KeuanganService {
	return &KeuanganService{repo: repo}
}

// ---------- 1. KATEGORI SERVICE ----------

func (s *KeuanganService) ListKategori(ctx context.Context, tipe string) ([]dto.KategoriResponse, error) {
	items, err := s.repo.ListKategori(ctx, tipe)
	if err != nil {
		return nil, err
	}
	res := make([]dto.KategoriResponse, len(items))
	for i, k := range items {
		res[i] = toKategoriDTO(&k)
	}
	return res, nil
}

func (s *KeuanganService) GetKategoriByID(ctx context.Context, idStr string) (*dto.KategoriResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	k, err := s.repo.GetKategoriByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if k == nil {
		return nil, apperr.NotFound("Kategori keuangan tidak ditemukan")
	}
	res := toKategoriDTO(k)
	return &res, nil
}

func (s *KeuanganService) CreateKategori(ctx context.Context, req dto.CreateKategoriRequest) (*dto.KategoriResponse, error) {
	tipe := strings.ToLower(strings.TrimSpace(req.Tipe))
	if tipe != "pemasukan" && tipe != "pengeluaran" {
		return nil, apperr.Validation("Tipe kategori harus 'pemasukan' atau 'pengeluaran'", "")
	}
	nama := strings.TrimSpace(req.NamaKategori)
	if nama == "" {
		return nil, apperr.Validation("Nama kategori wajib diisi", "")
	}

	req.Tipe = tipe
	req.NamaKategori = nama
	k, err := s.repo.CreateKategori(ctx, req)
	if err != nil {
		return nil, err
	}
	res := toKategoriDTO(k)
	return &res, nil
}

func (s *KeuanganService) UpdateKategori(ctx context.Context, idStr string, req dto.UpdateKategoriRequest) (*dto.KategoriResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	current, err := s.repo.GetKategoriByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Kategori keuangan tidak ditemukan")
	}

	if req.Tipe != nil {
		t := strings.ToLower(strings.TrimSpace(*req.Tipe))
		if t != "pemasukan" && t != "pengeluaran" {
			return nil, apperr.Validation("Tipe kategori harus 'pemasukan' atau 'pengeluaran'", "")
		}
		req.Tipe = &t
	}

	updated, err := s.repo.UpdateKategori(ctx, current, req)
	if err != nil {
		return nil, err
	}
	res := toKategoriDTO(updated)
	return &res, nil
}

func (s *KeuanganService) DeleteKategori(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid", err.Error())
	}
	current, err := s.repo.GetKategoriByID(ctx, id)
	if err != nil {
		return err
	}
	if current == nil {
		return apperr.NotFound("Kategori keuangan tidak ditemukan")
	}
	if current.IsSystem {
		return apperr.Validation("Kategori sistem", "Kategori bawaan sistem tidak boleh dihapus")
	}

	deleted, err := s.repo.DeleteKategori(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Kategori keuangan tidak ditemukan")
	}
	return nil
}

// ---------- 2. JURNAL KEUANGAN SERVICE ----------

func (s *KeuanganService) ListJurnal(
	ctx context.Context,
	search string,
	tipe string,
	kategoriID string,
	orderID string,
	gajiID string,
	dateFrom string,
	dateTo string,
	pembayaran string,
	status string,
	sortBy string,
	sortDir string,
	page int,
	limit int,
) (*dto.ListJurnalResponse, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	items, total, sumIn, sumOut, err := s.repo.ListJurnal(
		ctx, search, tipe, kategoriID, orderID, gajiID,
		dateFrom, dateTo, pembayaran, status,
		sortBy, sortDir, page, limit,
	)
	if err != nil {
		return nil, err
	}

	data := make([]dto.JurnalResponse, len(items))
	for i, it := range items {
		data[i] = toJurnalDTO(&it)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	saldoNumeric := sumIn - sumOut

	summary := dto.KeuanganSummary{
		TotalPemasukan:     fmt.Sprintf("Rp %s", formatRupiah(sumIn)),
		TotalPengeluaran:   fmt.Sprintf("Rp %s", formatRupiah(sumOut)),
		SisaSaldoKas:       formatSaldo(saldoNumeric),
		NumericPemasukan:   sumIn,
		NumericPengeluaran: sumOut,
		NumericSaldo:       saldoNumeric,
		TotalTransaksi:     total,
	}

	return &dto.ListJurnalResponse{
		Summary:    summary,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
		Data:       data,
	}, nil
}

func (s *KeuanganService) GetJurnalByID(ctx context.Context, idStr string) (*dto.JurnalResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	it, err := s.repo.GetJurnalByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Transaksi jurnal tidak ditemukan")
	}
	res := toJurnalDTO(it)
	return &res, nil
}

func (s *KeuanganService) CreateJurnal(ctx context.Context, req dto.CreateJurnalRequest) (*dto.JurnalResponse, error) {
	tipe := strings.ToLower(strings.TrimSpace(req.Tipe))
	if tipe != "pemasukan" && tipe != "pengeluaran" {
		return nil, apperr.Validation("Tipe jurnal harus 'pemasukan' atau 'pengeluaran'", "")
	}
	judul := strings.TrimSpace(req.Judul)
	if judul == "" {
		return nil, apperr.Validation("Judul transaksi wajib diisi", "")
	}

	// Parsing nominal
	amountNumeric := parseNumeric(req.Nominal)
	if amountNumeric <= 0 {
		return nil, apperr.Validation("Nominal harus lebih dari 0", "")
	}
	req.Nominal = fmt.Sprintf("Rp %s", formatRupiah(amountNumeric))
	req.Tipe = tipe
	req.Judul = judul

	var katUUID *uuid.UUID
	if req.KategoriID != nil && *req.KategoriID != "" {
		if parsed, err := uuid.Parse(*req.KategoriID); err == nil {
			katUUID = &parsed
		}
	}

	var ordUUID *uuid.UUID
	if req.OrderID != nil && *req.OrderID != "" {
		if parsed, err := uuid.Parse(*req.OrderID); err == nil {
			ordUUID = &parsed
		}
	}

	var gjUUID *uuid.UUID
	if req.GajiID != nil && *req.GajiID != "" {
		if parsed, err := uuid.Parse(*req.GajiID); err == nil {
			gjUUID = &parsed
		}
	}

	kodeJurnal, err := s.repo.GenerateKodeJurnal(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate kode jurnal: %w", err)
	}

	it, err := s.repo.CreateJurnal(ctx, kodeJurnal, amountNumeric, katUUID, ordUUID, gjUUID, req)
	if err != nil {
		return nil, err
	}
	res := toJurnalDTO(it)
	return &res, nil
}

func (s *KeuanganService) UpdateJurnal(ctx context.Context, idStr string, req dto.UpdateJurnalRequest) (*dto.JurnalResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	current, err := s.repo.GetJurnalByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Transaksi jurnal tidak ditemukan")
	}

	amountNumeric := current.AmountNumeric
	if req.Nominal != nil {
		amountNumeric = parseNumeric(*req.Nominal)
		if amountNumeric <= 0 {
			return nil, apperr.Validation("Nominal harus lebih dari 0", "")
		}
		formatted := fmt.Sprintf("Rp %s", formatRupiah(amountNumeric))
		req.Nominal = &formatted
	}

	if req.Tipe != nil {
		t := strings.ToLower(strings.TrimSpace(*req.Tipe))
		if t != "pemasukan" && t != "pengeluaran" {
			return nil, apperr.Validation("Tipe jurnal harus 'pemasukan' atau 'pengeluaran'", "")
		}
		req.Tipe = &t
	}

	var katUUID *uuid.UUID = current.KategoriID
	if req.KategoriID != nil {
		if *req.KategoriID == "" {
			katUUID = nil
		} else if parsed, err := uuid.Parse(*req.KategoriID); err == nil {
			katUUID = &parsed
		}
	}

	var ordUUID *uuid.UUID = current.OrderID
	if req.OrderID != nil {
		if *req.OrderID == "" {
			ordUUID = nil
		} else if parsed, err := uuid.Parse(*req.OrderID); err == nil {
			ordUUID = &parsed
		}
	}

	var gjUUID *uuid.UUID = current.GajiID
	if req.GajiID != nil {
		if *req.GajiID == "" {
			gjUUID = nil
		} else if parsed, err := uuid.Parse(*req.GajiID); err == nil {
			gjUUID = &parsed
		}
	}

	updated, err := s.repo.UpdateJurnal(ctx, current, amountNumeric, katUUID, ordUUID, gjUUID, req)
	if err != nil {
		return nil, err
	}
	res := toJurnalDTO(updated)
	return &res, nil
}

func (s *KeuanganService) DeleteJurnal(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format ID tidak valid", err.Error())
	}
	deleted, err := s.repo.DeleteJurnal(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Transaksi jurnal tidak ditemukan")
	}
	return nil
}

// ---------- HELPER UTILS ----------

func parseNumeric(s string) int64 {
	digits := nonDigitRegex.ReplaceAllString(s, "")
	val, _ := strconv.ParseInt(digits, 10, 64)
	return val
}

func formatRupiah(n int64) string {
	if n < 0 {
		n = -n
	}
	in := strconv.FormatInt(n, 10)
	var out []byte
	l := len(in)
	for i, c := range in {
		out = append(out, byte(c))
		if (l-i-1)%3 == 0 && i != l-1 {
			out = append(out, '.')
		}
	}
	if len(out) == 0 {
		return "0"
	}
	return string(out)
}

func formatSaldo(n int64) string {
	if n < 0 {
		return fmt.Sprintf("-Rp %s", formatRupiah(-n))
	}
	return fmt.Sprintf("Rp %s", formatRupiah(n))
}

func toKategoriDTO(k *model.KategoriKeuangan) dto.KategoriResponse {
	return dto.KategoriResponse{
		ID:           k.ID.String(),
		NamaKategori: k.NamaKategori,
		Tipe:         k.Tipe,
		Deskripsi:    k.Deskripsi,
		IsSystem:     k.IsSystem,
		CreatedAt:    k.CreatedAt,
		UpdatedAt:    k.UpdatedAt,
	}
}

func toJurnalDTO(j *model.JurnalKeuangan) dto.JurnalResponse {
	var katID *string
	if j.KategoriID != nil {
		s := j.KategoriID.String()
		katID = &s
	}
	var ordID *string
	if j.OrderID != nil {
		s := j.OrderID.String()
		ordID = &s
	}
	var gjID *string
	if j.GajiID != nil {
		s := j.GajiID.String()
		gjID = &s
	}

	return dto.JurnalResponse{
		ID:               j.ID.String(),
		KodeJurnal:       j.KodeJurnal,
		Tipe:             j.Tipe,
		Judul:            j.Judul,
		KategoriID:       katID,
		NamaKategori:     j.NamaKategori,
		MetodePembayaran: j.MetodePembayaran,
		Nominal:          j.Nominal,
		AmountNumeric:    j.AmountNumeric,
		Status:           j.Status,
		Tanggal:          j.Tanggal,
		Sumber:           j.Sumber,
		OrderID:          ordID,
		InvoiceNo:        j.InvoiceNo,
		GajiID:           gjID,
		KodeGaji:         j.KodeGaji,
		Catatan:          j.Catatan,
		CreatedAt:        j.CreatedAt,
		UpdatedAt:        j.UpdatedAt,
	}
}
