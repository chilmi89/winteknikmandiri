package service

import (
	"context"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/gaji/dto"
	"winteknikmandiri-backend/gaji/model"
	"winteknikmandiri-backend/gaji/repository"
	"winteknikmandiri-backend/internal/apperr"
)

var nonDigitRegex = regexp.MustCompile(`[^0-9]`)

// GajiService mengelola logika penggajian tim multi-proyek.
type GajiService struct {
	repo *repository.GajiRepository
}

// NewGajiService membuat service baru.
func NewGajiService(repo *repository.GajiRepository) *GajiService {
	return &GajiService{repo: repo}
}

// ListGaji mengambil daftar gaji dengan pagination & filter.
func (s *GajiService) ListGaji(
	ctx context.Context,
	teamID string,
	orderID string,
	dateFilter string,
	status string,
	search string,
	page int,
	limit int,
) (*dto.ListGajiResponse, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	items, total, err := s.repo.ListGaji(ctx, teamID, orderID, dateFilter, status, search, page, limit)
	if err != nil {
		return nil, err
	}

	res := make([]dto.GajiResponse, len(items))
	for i, it := range items {
		res[i] = toGajiDTO(&it)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &dto.ListGajiResponse{
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
		Data:       res,
	}, nil
}

// GetGajiDetail mengambil detail lengkap slip gaji beserta proyek-proyeknya.
func (s *GajiService) GetGajiDetail(ctx context.Context, idStr string) (*dto.GajiResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	it, err := s.repo.GetGajiDetail(ctx, id)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Slip gaji tidak ditemukan")
	}

	res := toGajiDTO(it)
	return &res, nil
}

// CreateGaji membuat slip gaji baru dan mengakumulasikan totalnya.
func (s *GajiService) CreateGaji(ctx context.Context, req dto.CreateGajiRequest) (*dto.GajiResponse, error) {
	teamUUID, err := uuid.Parse(req.TeamID)
	if err != nil {
		return nil, apperr.Validation("Format TeamID tidak valid", err.Error())
	}

	// Validasi anti-duplikasi order dalam satu slip dan antar-slip aktif
	seenOrders := make(map[string]bool)
	for _, p := range req.Proyek {
		if p.OrderID == "" {
			continue
		}
		if seenOrders[p.OrderID] {
			return nil, apperr.Validation("Proyek duplikat", "Satu invoice proyek tidak boleh dipilih lebih dari satu kali dalam satu slip gaji")
		}
		seenOrders[p.OrderID] = true

		orderUUID, err := uuid.Parse(p.OrderID)
		if err == nil {
			existingKode, err := s.repo.CheckOrderAlreadyGajied(ctx, orderUUID, nil)
			if err != nil {
				return nil, err
			}
			if existingKode != "" {
				return nil, apperr.Validation("Proyek sudah digajikan", fmt.Sprintf("Proyek ini sudah pernah dimasukkan ke slip gaji %s", existingKode))
			}
		}
	}

	kodeGaji, err := s.repo.GenerateKodeGaji(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate kode gaji: %w", err)
	}

	ord, err := s.repo.CreateGaji(ctx, kodeGaji, teamUUID, req)
	if err != nil {
		return nil, err
	}

	// Recalculate total
	full, err := s.repo.GetGajiDetail(ctx, ord.ID)
	if err != nil || full == nil {
		res := toGajiDTO(ord)
		return &res, nil
	}

	totalSum := calculateTotal(full.Proyek)
	_ = s.repo.UpdateTotalGaji(ctx, full.ID, totalSum)
	full.TotalGaji = totalSum

	res := toGajiDTO(full)
	return &res, nil
}

// UpdateGaji memperbarui data header slip gaji beserta rincian proyeknya secara atomik.
func (s *GajiService) UpdateGaji(ctx context.Context, idStr string, req dto.UpdateGajiRequest) (*dto.GajiResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperr.Validation("Format ID tidak valid", err.Error())
	}
	current, err := s.repo.GetGajiDetail(ctx, id)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperr.NotFound("Slip gaji tidak ditemukan")
	}

	// Validasi anti-duplikasi proyek jika proyek disertakan
	if req.Proyek != nil {
		seenOrders := make(map[string]bool)
		for _, p := range *req.Proyek {
			if p.OrderID == "" {
				continue
			}
			if seenOrders[p.OrderID] {
				return nil, apperr.Validation("Proyek duplikat", "Satu invoice proyek tidak boleh dipilih lebih dari satu kali dalam satu slip gaji")
			}
			seenOrders[p.OrderID] = true

			orderUUID, err := uuid.Parse(p.OrderID)
			if err == nil {
				existingKode, err := s.repo.CheckOrderAlreadyGajied(ctx, orderUUID, &current.ID)
				if err != nil {
					return nil, err
				}
				if existingKode != "" {
					return nil, apperr.Validation("Proyek sudah digajikan", fmt.Sprintf("Proyek ini sudah pernah dimasukkan ke slip gaji %s", existingKode))
				}
			}
		}
	}

	updated, err := s.repo.UpdateGaji(ctx, current, req)
	if err != nil {
		return nil, err
	}

	full, _ := s.repo.GetGajiDetail(ctx, updated.ID)
	if full == nil {
		res := toGajiDTO(updated)
		return &res, nil
	}

	// Hitung ulang total gaji jika ada perubahan proyek
	if req.Proyek != nil {
		totalSum := calculateTotal(full.Proyek)
		_ = s.repo.UpdateTotalGaji(ctx, full.ID, totalSum)
		full.TotalGaji = totalSum
	}

	res := toGajiDTO(full)
	return &res, nil
}

// AttachProyek menempelkan 1 proyek baru ke slip gaji & recalculate total.
func (s *GajiService) AttachProyek(ctx context.Context, gajiIDStr string, req dto.AttachProyekRequest) (*dto.GajiResponse, error) {
	gajiUUID, err := uuid.Parse(gajiIDStr)
	if err != nil {
		return nil, apperr.Validation("Format Gaji ID tidak valid", err.Error())
	}
	orderUUID, err := uuid.Parse(req.OrderID)
	if err != nil {
		return nil, apperr.Validation("Format Order ID tidak valid", err.Error())
	}

	// Cek apakah proyek ini sudah terdaftar di slip gaji ini
	existing, err := s.repo.GetGajiDetail(ctx, gajiUUID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, apperr.NotFound("Slip gaji tidak ditemukan")
	}
	for _, p := range existing.Proyek {
		if p.OrderID == orderUUID {
			return nil, apperr.Validation("Proyek duplikat", "Invoice proyek ini sudah terdaftar dalam slip gaji ini")
		}
	}

	_, err = s.repo.AttachProyek(ctx, gajiUUID, orderUUID, req.Nominal, req.Keterangan)
	if err != nil {
		return nil, err
	}

	full, err := s.repo.GetGajiDetail(ctx, gajiUUID)
	if err != nil || full == nil {
		return nil, err
	}

	totalSum := calculateTotal(full.Proyek)
	_ = s.repo.UpdateTotalGaji(ctx, full.ID, totalSum)
	full.TotalGaji = totalSum

	res := toGajiDTO(full)
	return &res, nil
}

// UpdateProyekGaji mengedit nominal proyek & recalculate total.
func (s *GajiService) UpdateProyekGaji(ctx context.Context, proyekIDStr string, nominal string, ket string) (*dto.GajiResponse, error) {
	proyekUUID, err := uuid.Parse(proyekIDStr)
	if err != nil {
		return nil, apperr.Validation("Format Proyek ID tidak valid", err.Error())
	}

	p, err := s.repo.UpdateProyekGaji(ctx, proyekUUID, nominal, ket)
	if err != nil {
		return nil, err
	}

	full, err := s.repo.GetGajiDetail(ctx, p.GajiID)
	if err != nil || full == nil {
		return nil, err
	}

	totalSum := calculateTotal(full.Proyek)
	_ = s.repo.UpdateTotalGaji(ctx, full.ID, totalSum)
	full.TotalGaji = totalSum

	res := toGajiDTO(full)
	return &res, nil
}

// DeleteProyekGaji melepas proyek dari slip gaji & recalculate total.
func (s *GajiService) DeleteProyekGaji(ctx context.Context, proyekIDStr string) (*dto.GajiResponse, error) {
	proyekUUID, err := uuid.Parse(proyekIDStr)
	if err != nil {
		return nil, apperr.Validation("Format Proyek ID tidak valid", err.Error())
	}

	gajiID, err := s.repo.DeleteProyekGaji(ctx, proyekUUID)
	if err != nil {
		return nil, err
	}

	full, err := s.repo.GetGajiDetail(ctx, gajiID)
	if err != nil || full == nil {
		return nil, err
	}

	totalSum := calculateTotal(full.Proyek)
	_ = s.repo.UpdateTotalGaji(ctx, full.ID, totalSum)
	full.TotalGaji = totalSum

	res := toGajiDTO(full)
	return &res, nil
}

// ListAvailableOrdersForGaji mengambil daftar invoice proyek closing yang belum digajikan di slip aktif lain.
func (s *GajiService) ListAvailableOrdersForGaji(ctx context.Context, excludeGajiIDStr string) ([]dto.GajiOrderOptionResponse, error) {
	var excl *uuid.UUID
	if excludeGajiIDStr != "" {
		if parsed, err := uuid.Parse(excludeGajiIDStr); err == nil {
			excl = &parsed
		}
	}

	items, err := s.repo.ListAvailableOrdersForGaji(ctx, excl)
	if err != nil {
		return nil, err
	}

	res := make([]dto.GajiOrderOptionResponse, len(items))
	for i, it := range items {
		res[i] = dto.GajiOrderOptionResponse{
			ID:              it.ID.String(),
			InvoiceNo:       it.InvoiceNo,
			InitialCategory: it.InitialCategory,
			InitialService:  it.InitialService,
			CustomerName:    it.CustomerName,
			TotalAmount:     it.TotalAmount,
			Status:          it.Status,
			CreatedAt:       it.CreatedAt,
		}
	}
	return res, nil
}

// DeleteGaji menghapus slip gaji (soft delete).
func (s *GajiService) DeleteGaji(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format Gaji ID tidak valid", err.Error())
	}
	deleted, err := s.repo.DeleteGaji(ctx, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Slip gaji tidak ditemukan")
	}
	return nil
}

func calculateTotal(proyekList []model.GajiProyek) string {
	var sum int64
	for _, p := range proyekList {
		cleaned := nonDigitRegex.ReplaceAllString(p.Nominal, "")
		val, _ := strconv.ParseInt(cleaned, 10, 64)
		sum += val
	}
	if sum > 0 {
		return fmt.Sprintf("Rp %s", formatRupiah(sum))
	}
	return "Rp 0"
}

func formatRupiah(n int64) string {
	in := strconv.FormatInt(n, 10)
	var out []byte
	l := len(in)
	for i, c := range in {
		out = append(out, byte(c))
		if (l-i-1)%3 == 0 && i != l-1 {
			out = append(out, '.')
		}
	}
	return string(out)
}

func toGajiDTO(g *model.Gaji) dto.GajiResponse {
	proyekDTO := make([]dto.GajiProyekResponse, len(g.Proyek))
	for i, p := range g.Proyek {
		layanan := p.NamaLayanan
		if layanan == "" {
			layanan = "Pekerjaan AC"
		}
		proyekDTO[i] = dto.GajiProyekResponse{
			ID:           p.ID.String(),
			GajiID:       p.GajiID.String(),
			OrderID:      p.OrderID.String(),
			InvoiceNo:    p.InvoiceNo,
			NamaLayanan:  layanan,
			NamaCustomer: p.NamaCustomer,
			Nominal:      p.Nominal,
			Keterangan:   p.Keterangan,
			CreatedAt:    p.CreatedAt,
			UpdatedAt:    p.UpdatedAt,
		}
	}

	return dto.GajiResponse{
		ID:        g.ID.String(),
		KodeGaji:  g.KodeGaji,
		TeamID:    g.TeamID.String(),
		TeamName:  g.TeamName,
		TeamSkill: g.TeamSkill,
		TotalGaji: g.TotalGaji,
		Status:    g.Status,
		Catatan:   strings.TrimSpace(g.Catatan),
		Proyek:    proyekDTO,
		CreatedAt: g.CreatedAt,
		UpdatedAt: g.UpdatedAt,
	}
}
