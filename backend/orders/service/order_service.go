package service

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/google/uuid"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/orders/dto"
	"winteknikmandiri-backend/orders/model"
	"winteknikmandiri-backend/orders/repository"
)

// OrderService menangani logika alur order via WA dan nego invoice.
type OrderService struct {
	repo *repository.OrderRepository
}

// NewOrderService membuat instance service baru.
func NewOrderService(repo *repository.OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

// InitiateClickOrder dipanggil saat tombol PESAN di web diklik pelanggan.
// Membuat draft order (status: menunggu_chat) dan menerbitkan invoice otomatis.
func (s *OrderService) InitiateClickOrder(ctx context.Context, req dto.ClickOrderRequest) (*dto.ClickOrderResponse, error) {
	invoiceNo, err := s.repo.GenerateInvoiceNo(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate invoice: %w", err)
	}

	ord, err := s.repo.CreateInitiatedOrder(ctx, invoiceNo, req)
	if err != nil {
		return nil, err
	}

	waPhone := os.Getenv("WA_PHONE")
	if waPhone == "" {
		waPhone = "6281216622840"
	}

	cleanPrice := ""
	if req.Price != "" {
		cleanPrice = fmt.Sprintf(" (%s)", req.Price)
	}

	msgText := fmt.Sprintf(
		"Halo CV Win Teknik Mandiri,\nsaya ingin memesan layanan *%s%s*.\nApakah bisa dibantu untuk jadwal pengerjaannya? Terima kasih.\n\nNo. Invoice: %s",
		req.Service,
		cleanPrice,
		invoiceNo,
	)

	waURL := fmt.Sprintf("https://wa.me/%s?text=%s", waPhone, url.QueryEscape(msgText))

	return &dto.ClickOrderResponse{
		InvoiceNo: invoiceNo,
		OrderID:   ord.ID.String(),
		WaURL:     waURL,
	}, nil
}

// CreateManualOrder dibuat admin dari dashboard saat chat WA sudah masuk & dinegosiasikan.
func (s *OrderService) CreateManualOrder(ctx context.Context, req dto.CreateManualOrderRequest) (*dto.OrderResponse, error) {
	invoiceNo, err := s.repo.GenerateInvoiceNo(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate invoice: %w", err)
	}

	ord, err := s.repo.CreateManualOrder(ctx, invoiceNo, req)
	if err != nil {
		return nil, err
	}

	full, err := s.repo.GetOrderByIDOrInvoice(ctx, ord.ID.String())
	if err != nil || full == nil {
		res := toOrderDTO(ord)
		return &res, nil
	}
	res := toOrderDTO(full)
	return &res, nil
}

// ListOrders mengambil daftar order untuk dashboard dengan filter status / search / date.
func (s *OrderService) ListOrders(ctx context.Context, status string, search string, dateFilter string) ([]dto.OrderResponse, error) {
	items, err := s.repo.ListOrders(ctx, status, search, dateFilter)
	if err != nil {
		return nil, err
	}
	res := make([]dto.OrderResponse, len(items))
	for i, it := range items {
		res[i] = toOrderDTO(&it)
	}
	return res, nil
}

// GetOrderDetail mengambil detail order beserta rincian order_items.
func (s *OrderService) GetOrderDetail(ctx context.Context, idOrInv string) (*dto.OrderResponse, error) {
	it, err := s.repo.GetOrderByIDOrInvoice(ctx, idOrInv)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Pesanan / Invoice tidak ditemukan")
	}
	res := toOrderDTO(it)
	return &res, nil
}

// UpdateOrder memperbarui data header order.
func (s *OrderService) UpdateOrder(ctx context.Context, idStr string, req dto.UpdateOrderRequest) (*dto.OrderResponse, error) {
	it, err := s.repo.GetOrderByIDOrInvoice(ctx, idStr)
	if err != nil {
		return nil, err
	}
	if it == nil {
		return nil, apperr.NotFound("Pesanan / Invoice tidak ditemukan")
	}

	updated, err := s.repo.UpdateOrder(ctx, it, req)
	if err != nil {
		return nil, err
	}
	full, err := s.repo.GetOrderByIDOrInvoice(ctx, updated.ID.String())
	if err != nil || full == nil {
		res := toOrderDTO(updated)
		return &res, nil
	}
	res := toOrderDTO(full)
	return &res, nil
}

// AddOrderItem menambahkan baris item baru ke invoice.
func (s *OrderService) AddOrderItem(ctx context.Context, orderIDStr string, req dto.SaveOrderItemRequest) (*dto.OrderItemResponse, error) {
	orderUUID, err := uuid.Parse(orderIDStr)
	if err != nil {
		return nil, apperr.Validation("Format Order ID tidak valid", err.Error())
	}
	it, err := s.repo.AddOrderItem(ctx, orderUUID, req)
	if err != nil {
		return nil, err
	}
	res := toItemDTO(it)
	return &res, nil
}

// UpdateOrderItem memperbarui baris item.
func (s *OrderService) UpdateOrderItem(ctx context.Context, itemIDStr string, req dto.SaveOrderItemRequest) (*dto.OrderItemResponse, error) {
	itemUUID, err := uuid.Parse(itemIDStr)
	if err != nil {
		return nil, apperr.Validation("Format Item ID tidak valid", err.Error())
	}
	it, err := s.repo.UpdateOrderItem(ctx, itemUUID, req)
	if err != nil {
		return nil, err
	}
	res := toItemDTO(it)
	return &res, nil
}

// DeleteOrderItem menghapus baris item dari invoice.
func (s *OrderService) DeleteOrderItem(ctx context.Context, itemIDStr string) error {
	itemUUID, err := uuid.Parse(itemIDStr)
	if err != nil {
		return apperr.Validation("Format Item ID tidak valid", err.Error())
	}
	deleted, err := s.repo.DeleteOrderItem(ctx, itemUUID)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Baris layanan tidak ditemukan")
	}
	return nil
}

// DeleteOrder menghapus pesanan (soft delete).
func (s *OrderService) DeleteOrder(ctx context.Context, idStr string) error {
	orderUUID, err := uuid.Parse(idStr)
	if err != nil {
		return apperr.Validation("Format Order ID tidak valid", err.Error())
	}
	deleted, err := s.repo.SoftDeleteOrder(ctx, orderUUID)
	if err != nil {
		return err
	}
	if !deleted {
		return apperr.NotFound("Pesanan tidak ditemukan")
	}
	return nil
}

func toOrderDTO(o *model.Order) dto.OrderResponse {
	cName := ""
	if o.CustomerName != nil {
		cName = *o.CustomerName
	}
	cPhone := ""
	if o.CustomerPhone != nil {
		cPhone = *o.CustomerPhone
	}
	addr := ""
	if o.Address != nil {
		addr = *o.Address
	}
	mURL := ""
	if o.MapsURL != nil {
		mURL = *o.MapsURL
	}
	notes := ""
	if o.Notes != nil {
		notes = *o.Notes
	}

	items := make([]dto.OrderItemResponse, len(o.Items))
	for i, it := range o.Items {
		items[i] = toItemDTO(&it)
	}

	return dto.OrderResponse{
		ID:              o.ID.String(),
		InvoiceNo:       o.InvoiceNo,
		InitialCategory: o.InitialCategory,
		InitialService:  o.InitialService,
		InitialPrice:    o.InitialPrice,
		CustomerName:    cName,
		CustomerPhone:   cPhone,
		Address:         addr,
		MapsURL:         mURL,
		Notes:           notes,
		TotalAmount:     o.TotalAmount,
		Status:          o.Status,
		Items:           items,
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}

func toItemDTO(it *model.OrderItem) dto.OrderItemResponse {
	svcID := ""
	if it.ServiceID != nil {
		svcID = it.ServiceID.String()
	}
	notes := ""
	if it.Notes != nil {
		notes = *it.Notes
	}

	return dto.OrderItemResponse{
		ID:        it.ID.String(),
		OrderID:   it.OrderID.String(),
		ServiceID: svcID,
		ItemName:  it.ItemName,
		Price:     it.Price,
		Qty:       it.Qty,
		Unit:      it.Unit,
		Subtotal:  it.Subtotal,
		Notes:     strings.TrimSpace(notes),
		CreatedAt: it.CreatedAt,
		UpdatedAt: it.UpdatedAt,
	}
}
