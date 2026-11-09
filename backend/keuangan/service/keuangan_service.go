package service

import (
	"context"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/keuangan/dto"
	"winteknikmandiri-backend/keuangan/model"
	"winteknikmandiri-backend/keuangan/repository"
)

var nonDigitRegex = regexp.MustCompile(`[^0-9]`)

// KeuanganService mengelola alur bisnis nota kas, rincian transaksi, dan kategori akun.
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

// ---------- 2. BUKU KAS & JURNAL TRANSAKSI SERVICE ----------

func (s *KeuanganService) GetNextKodeJurnal(ctx context.Context) (string, error) {
	return s.repo.GenerateKodeJurnal(ctx)
}

// GetLaporanData mengakumulasikan data laporan dan analitik finansial untuk 4 periode.
func (s *KeuanganService) GetLaporanData(
	ctx context.Context,
	periode string,
	tanggal string,
	startDate string,
	endDate string,
	month int,
	year int,
	orderID string,
	kategoriID string,
	sortDir string,
	page int,
	limit int,
) (*dto.LaporanResponse, error) {
	return s.repo.GetLaporanData(
		ctx, periode, tanggal, startDate, endDate, month, year,
		orderID, kategoriID, sortDir, page, limit,
	)
}

func (s *KeuanganService) ListJurnal(
	ctx context.Context,
	search string,
	status string,
	cabang string,
	dateFrom string,
	dateTo string,
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
		ctx, search, status, cabang, dateFrom, dateTo, sortBy, sortDir, page, limit,
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
		return nil, apperr.NotFound("Nota kas jurnal tidak ditemukan")
	}
	res := toJurnalDTO(it)
	return &res, nil
}

func (s *KeuanganService) CreateJurnal(ctx context.Context, req dto.CreateJurnalRequest) (*dto.JurnalResponse, error) {
	waktu := time.Now()
	if req.WaktuTransaksi != nil && *req.WaktuTransaksi != "" {
		waktu = parseWaktu(*req.WaktuTransaksi)
	}

	// Validasi anti-duplikasi order_id dan gaji_id (dalam 1 nota dan lintas-nota)
	seenOrders := make(map[string]bool)
	seenGaji := make(map[string]bool)
	for _, itemReq := range req.Items {
		if itemReq.OrderID != nil && *itemReq.OrderID != "" {
			if seenOrders[*itemReq.OrderID] {
				return nil, apperr.Validation("Proyek duplikat", "Satu invoice proyek tidak boleh dipilih lebih dari satu kali dalam satu nota kas")
			}
			seenOrders[*itemReq.OrderID] = true

			if ordUUID, err := uuid.Parse(*itemReq.OrderID); err == nil {
				used, err := s.repo.IsOrderUsedInOtherJurnal(ctx, ordUUID, nil)
				if err == nil && used {
					return nil, apperr.Validation("Proyek sudah dicatat", "Invoice proyek ini sudah pernah dicatat di nota kas lain")
				}
			}
		}
		if itemReq.GajiID != nil && *itemReq.GajiID != "" {
			if seenGaji[*itemReq.GajiID] {
				return nil, apperr.Validation("Slip gaji duplikat", "Satu slip gaji tidak boleh dipilih lebih dari satu kali dalam satu nota kas")
			}
			seenGaji[*itemReq.GajiID] = true

			if gjUUID, err := uuid.Parse(*itemReq.GajiID); err == nil {
				used, err := s.repo.IsGajiUsedInOtherJurnal(ctx, gjUUID, nil)
				if err == nil && used {
					return nil, apperr.Validation("Slip gaji sudah dicatat", "Slip gaji ini sudah pernah dicatat di nota kas lain")
				}
			}
		}
	}

	kodeJurnal, err := s.repo.GenerateKodeJurnal(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate kode jurnal: %w", err)
	}

	// Proses items & hitung total
	modelItems := make([]model.JurnalItem, 0, len(req.Items))
	var sumIn int64
	var sumOut int64

	for _, itemReq := range req.Items {
		tipe := strings.ToLower(strings.TrimSpace(itemReq.Tipe))
		if tipe != "pemasukan" && tipe != "pengeluaran" {
			continue
		}
		num := parseNumeric(itemReq.Nominal)
		if num <= 0 {
			continue
		}

		if tipe == "pemasukan" {
			sumIn += num
		} else {
			sumOut += num
		}

		var katUUID *uuid.UUID
		if itemReq.KategoriID != nil && *itemReq.KategoriID != "" {
			if parsed, err := uuid.Parse(*itemReq.KategoriID); err == nil {
				katUUID = &parsed
			}
		}

		var ordUUID *uuid.UUID
		if itemReq.OrderID != nil && *itemReq.OrderID != "" {
			if parsed, err := uuid.Parse(*itemReq.OrderID); err == nil {
				ordUUID = &parsed
			}
		}

		var gjUUID *uuid.UUID
		if itemReq.GajiID != nil && *itemReq.GajiID != "" {
			if parsed, err := uuid.Parse(*itemReq.GajiID); err == nil {
				gjUUID = &parsed
			}
		}

		pembayaran := itemReq.MetodePembayaran
		if pembayaran == "" {
			pembayaran = "transfer"
		}
		sumber := itemReq.Sumber
		if sumber == "" {
			sumber = "manual"
		}

		modelItems = append(modelItems, model.JurnalItem{
			Tipe:             tipe,
			Deskripsi:        itemReq.Deskripsi,
			KategoriID:       katUUID,
			MetodePembayaran: pembayaran,
			Nominal:          fmt.Sprintf("Rp %s", formatRupiah(num)),
			AmountNumeric:    num,
			Sumber:           sumber,
			OrderID:          ordUUID,
			GajiID:           gjUUID,
			Catatan:          itemReq.Catatan,
		})
	}

	saldo := sumIn - sumOut
	totInStr := fmt.Sprintf("Rp %s", formatRupiah(sumIn))
	totOutStr := fmt.Sprintf("Rp %s", formatRupiah(sumOut))
	saldoStr := formatSaldo(saldo)

	it, err := s.repo.CreateJurnal(
		ctx, kodeJurnal, req.Judul, waktu, req.Cabang, req.Status, req.Catatan,
		modelItems, totInStr, totOutStr, saldoStr, sumIn, sumOut, saldo,
	)
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
		return nil, apperr.NotFound("Nota kas jurnal tidak ditemukan")
	}

	judul := current.Judul
	if req.Judul != nil {
		judul = *req.Judul
	}

	waktu := current.WaktuTransaksi
	if req.WaktuTransaksi != nil && *req.WaktuTransaksi != "" {
		waktu = parseWaktu(*req.WaktuTransaksi)
	}

	cabang := current.Cabang
	if req.Cabang != nil {
		cabang = *req.Cabang
	}

	status := current.Status
	if req.Status != nil {
		status = *req.Status
	}

	catatan := current.Catatan
	if req.Catatan != nil {
		catatan = *req.Catatan
	}

	var modelItems *[]model.JurnalItem
	totInStr := current.TotalPemasukan
	totOutStr := current.TotalPengeluaran
	saldoStr := current.SaldoBersih
	numIn := current.NumericPemasukan
	numOut := current.NumericPengeluaran
	numSaldo := current.NumericSaldo

	if req.Items != nil {
		// Validasi anti-duplikasi order_id dan gaji_id (dalam 1 nota dan lintas-nota)
		seenOrders := make(map[string]bool)
		seenGaji := make(map[string]bool)
		for _, itemReq := range *req.Items {
			if itemReq.OrderID != nil && *itemReq.OrderID != "" {
				if seenOrders[*itemReq.OrderID] {
					return nil, apperr.Validation("Proyek duplikat", "Satu invoice proyek tidak boleh dipilih lebih dari satu kali dalam satu nota kas")
				}
				seenOrders[*itemReq.OrderID] = true

				if ordUUID, err := uuid.Parse(*itemReq.OrderID); err == nil {
					used, err := s.repo.IsOrderUsedInOtherJurnal(ctx, ordUUID, &current.ID)
					if err == nil && used {
						return nil, apperr.Validation("Proyek sudah dicatat", "Invoice proyek ini sudah pernah dicatat di nota kas lain")
					}
				}
			}
			if itemReq.GajiID != nil && *itemReq.GajiID != "" {
				if seenGaji[*itemReq.GajiID] {
					return nil, apperr.Validation("Slip gaji duplikat", "Satu slip gaji tidak boleh dipilih lebih dari satu kali dalam satu nota kas")
				}
				seenGaji[*itemReq.GajiID] = true

				if gjUUID, err := uuid.Parse(*itemReq.GajiID); err == nil {
					used, err := s.repo.IsGajiUsedInOtherJurnal(ctx, gjUUID, &current.ID)
					if err == nil && used {
						return nil, apperr.Validation("Slip gaji sudah dicatat", "Slip gaji ini sudah pernah dicatat di nota kas lain")
					}
				}
			}
		}

		itemsArr := make([]model.JurnalItem, 0, len(*req.Items))
		var sumIn int64
		var sumOut int64

		for _, itemReq := range *req.Items {
			tipe := strings.ToLower(strings.TrimSpace(itemReq.Tipe))
			if tipe != "pemasukan" && tipe != "pengeluaran" {
				continue
			}
			num := parseNumeric(itemReq.Nominal)
			if num <= 0 {
				continue
			}

			if tipe == "pemasukan" {
				sumIn += num
			} else {
				sumOut += num
			}

			var katUUID *uuid.UUID
			if itemReq.KategoriID != nil && *itemReq.KategoriID != "" {
				if parsed, err := uuid.Parse(*itemReq.KategoriID); err == nil {
					katUUID = &parsed
				}
			}

			var ordUUID *uuid.UUID
			if itemReq.OrderID != nil && *itemReq.OrderID != "" {
				if parsed, err := uuid.Parse(*itemReq.OrderID); err == nil {
					ordUUID = &parsed
				}
			}

			var gjUUID *uuid.UUID
			if itemReq.GajiID != nil && *itemReq.GajiID != "" {
				if parsed, err := uuid.Parse(*itemReq.GajiID); err == nil {
					gjUUID = &parsed
				}
			}

			pembayaran := itemReq.MetodePembayaran
			if pembayaran == "" {
				pembayaran = "transfer"
			}
			sumber := itemReq.Sumber
			if sumber == "" {
				sumber = "manual"
			}

			itemsArr = append(itemsArr, model.JurnalItem{
				Tipe:             tipe,
				Deskripsi:        itemReq.Deskripsi,
				KategoriID:       katUUID,
				MetodePembayaran: pembayaran,
				Nominal:          fmt.Sprintf("Rp %s", formatRupiah(num)),
				AmountNumeric:    num,
				Sumber:           sumber,
				OrderID:          ordUUID,
				GajiID:           gjUUID,
				Catatan:          itemReq.Catatan,
			})
		}

		modelItems = &itemsArr
		numIn = sumIn
		numOut = sumOut
		numSaldo = sumIn - sumOut
		totInStr = fmt.Sprintf("Rp %s", formatRupiah(numIn))
		totOutStr = fmt.Sprintf("Rp %s", formatRupiah(numOut))
		saldoStr = formatSaldo(numSaldo)
	}

	updated, err := s.repo.UpdateJurnal(
		ctx, current, judul, waktu, cabang, status, catatan,
		modelItems, totInStr, totOutStr, saldoStr, numIn, numOut, numSaldo,
	)
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
		return apperr.NotFound("Nota kas jurnal tidak ditemukan")
	}
	return nil
}

// ---------- HELPER UTILS ----------

func parseWaktu(str string) time.Time {
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04",
		"2006-01-02 15:04",
		"2006-01-02",
	}
	for _, f := range formats {
		if t, err := time.ParseInLocation(f, str, time.Local); err == nil {
			return t
		}
	}
	return time.Now()
}

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
	itemsDTO := make([]dto.JurnalItemResponse, len(j.Items))
	for i, itm := range j.Items {
		var katID *string
		if itm.KategoriID != nil {
			s := itm.KategoriID.String()
			katID = &s
		}
		var ordID *string
		if itm.OrderID != nil {
			s := itm.OrderID.String()
			ordID = &s
		}
		var gjID *string
		if itm.GajiID != nil {
			s := itm.GajiID.String()
			gjID = &s
		}

		itemsDTO[i] = dto.JurnalItemResponse{
			ID:               itm.ID.String(),
			JurnalID:         itm.JurnalID.String(),
			Tipe:             itm.Tipe,
			Deskripsi:        itm.Deskripsi,
			KategoriID:       katID,
			NamaKategori:     itm.NamaKategori,
			MetodePembayaran: itm.MetodePembayaran,
			Nominal:          itm.Nominal,
			AmountNumeric:    itm.AmountNumeric,
			Sumber:           itm.Sumber,
			OrderID:          ordID,
			InvoiceNo:        itm.InvoiceNo,
			GajiID:           gjID,
			KodeGaji:         itm.KodeGaji,
			Catatan:          itm.Catatan,
			CreatedAt:        itm.CreatedAt,
			UpdatedAt:        itm.UpdatedAt,
		}
	}

	return dto.JurnalResponse{
		ID:                 j.ID.String(),
		KodeJurnal:         j.KodeJurnal,
		Judul:              j.Judul,
		WaktuTransaksi:     j.WaktuTransaksi,
		Cabang:             j.Cabang,
		Status:             j.Status,
		TotalPemasukan:     j.TotalPemasukan,
		TotalPengeluaran:   j.TotalPengeluaran,
		SaldoBersih:        j.SaldoBersih,
		NumericPemasukan:   j.NumericPemasukan,
		NumericPengeluaran: j.NumericPengeluaran,
		NumericSaldo:       j.NumericSaldo,
		Catatan:            j.Catatan,
		Items:              itemsDTO,
		CreatedAt:          j.CreatedAt,
		UpdatedAt:          j.UpdatedAt,
	}
}

// ---------- 3. OPSI TERSEDIA (ANTI-DUPLIKASI) ----------

func (s *KeuanganService) ListAvailableOrders(ctx context.Context, excludeJurnalIDStr string) ([]dto.KeuanganOrderOptionResponse, error) {
	var excl *uuid.UUID
	if strings.TrimSpace(excludeJurnalIDStr) != "" {
		if parsed, err := uuid.Parse(excludeJurnalIDStr); err == nil {
			excl = &parsed
		}
	}
	items, err := s.repo.ListAvailableOrders(ctx, excl)
	if err != nil {
		return nil, fmt.Errorf("list available orders: %w", err)
	}
	res := make([]dto.KeuanganOrderOptionResponse, len(items))
	for i, it := range items {
		res[i] = dto.KeuanganOrderOptionResponse{
			ID:              it.ID.String(),
			InvoiceNo:       it.InvoiceNo,
			InitialCategory: it.InitialCategory,
			InitialService:  it.InitialService,
			CustomerName:    it.CustomerName,
			TotalAmount:     it.TotalAmount,
			Status:          it.Status,
		}
	}
	return res, nil
}

func (s *KeuanganService) ListAvailableGaji(ctx context.Context, excludeJurnalIDStr string) ([]dto.KeuanganGajiOptionResponse, error) {
	var excl *uuid.UUID
	if strings.TrimSpace(excludeJurnalIDStr) != "" {
		if parsed, err := uuid.Parse(excludeJurnalIDStr); err == nil {
			excl = &parsed
		}
	}
	items, err := s.repo.ListAvailableGaji(ctx, excl)
	if err != nil {
		return nil, fmt.Errorf("list available gaji: %w", err)
	}
	res := make([]dto.KeuanganGajiOptionResponse, len(items))
	for i, it := range items {
		res[i] = dto.KeuanganGajiOptionResponse{
			ID:        it.ID.String(),
			KodeGaji:  it.KodeGaji,
			TeamName:  it.TeamName,
			TotalGaji: it.TotalGaji,
		}
	}
	return res, nil
}
