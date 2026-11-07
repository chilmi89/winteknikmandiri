package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"winteknikmandiri-backend/orders/dto"
	"winteknikmandiri-backend/orders/model"
)

// OrderRepository mengelola interaksi tabel orders dan order_items di PostgreSQL.
type OrderRepository struct {
	db *sql.DB
}

// NewOrderRepository membuat instance repository baru.
func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// GenerateInvoiceNo membuat nomor invoice unik dengan format INV-YYMM-XXXX.
func (r *OrderRepository) GenerateInvoiceNo(ctx context.Context) (string, error) {
	prefix := time.Now().Format("0601") // misal '2611' untuk Nov 2026

	query := `
		SELECT COUNT(*)
		FROM orders
		WHERE invoice_no LIKE $1
	`
	var count int
	err := r.db.QueryRowContext(ctx, query, fmt.Sprintf("INV-%s-%%", prefix)).Scan(&count)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("INV-%s-%04d", prefix, count+1), nil
}

// CreateManualOrder dibuat admin dari dashboard setelah chat WA disepakati.
func (r *OrderRepository) CreateManualOrder(ctx context.Context, invoiceNo string, req dto.CreateManualOrderRequest) (*model.Order, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	status := req.Status
	if status == "" {
		status = "negosiasi"
	}

	orderQuery := `
		INSERT INTO orders (
			invoice_no, initial_category, initial_service, initial_price,
			customer_name, customer_phone, address, notes, total_amount, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, invoice_no, initial_category, initial_service, initial_price,
		          customer_name, customer_phone, address, notes, total_amount, status,
		          created_at, updated_at
	`
	var ord model.Order
	err = tx.QueryRowContext(ctx, orderQuery,
		invoiceNo, req.InitialCategory, req.InitialService, req.InitialPrice,
		req.CustomerName, req.CustomerPhone, req.Address, req.Notes, "", status,
	).Scan(
		&ord.ID, &ord.InvoiceNo, &ord.InitialCategory, &ord.InitialService, &ord.InitialPrice,
		&ord.CustomerName, &ord.CustomerPhone, &ord.Address, &ord.Notes, &ord.TotalAmount, &ord.Status,
		&ord.CreatedAt, &ord.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert manual order: %w", err)
	}

	// Masukkan item rincian jika ada
	for _, itReq := range req.Items {
		var svcUUID *uuid.UUID
		if itReq.ServiceID != nil && *itReq.ServiceID != "" {
			if parsed, err := uuid.Parse(*itReq.ServiceID); err == nil {
				svcUUID = &parsed
			}
		}
		qty := itReq.Qty
		if qty <= 0 {
			qty = 1
		}
		unit := itReq.Unit
		if unit == "" {
			unit = "/ unit"
		}

		itemQuery := `
			INSERT INTO order_items (
				order_id, service_id, item_name, price, qty, unit, subtotal, notes
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`
		_, err = tx.ExecContext(ctx, itemQuery,
			ord.ID, svcUUID, itReq.ItemName, itReq.Price, qty, unit, itReq.Subtotal, itReq.Notes,
		)
		if err != nil {
			return nil, fmt.Errorf("insert manual order_item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &ord, nil
}

// ListOrders mengambil daftar order dengan filter status / pencarian opsional.
func (r *OrderRepository) ListOrders(ctx context.Context, status string, search string) ([]model.Order, error) {
	query := `
		SELECT
			id, invoice_no, initial_category, initial_service, initial_price,
			customer_name, customer_phone, address, notes, total_amount, status,
			created_at, updated_at
		FROM orders
		WHERE deleted_at IS NULL
	`
	var args []any
	argIdx := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if search != "" {
		s := "%" + search + "%"
		query += fmt.Sprintf(" AND (invoice_no ILIKE $%d OR customer_name ILIKE $%d OR customer_phone ILIKE $%d OR initial_service ILIKE $%d)", argIdx, argIdx, argIdx, argIdx)
		args = append(args, s)
		argIdx++
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query orders: %w", err)
	}
	defer rows.Close()

	orders := make([]model.Order, 0)
	for rows.Next() {
		var o model.Order
		if err := rows.Scan(
			&o.ID, &o.InvoiceNo, &o.InitialCategory, &o.InitialService, &o.InitialPrice,
			&o.CustomerName, &o.CustomerPhone, &o.Address, &o.Notes, &o.TotalAmount, &o.Status,
			&o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

// GetOrderByIDOrInvoice mengambil order dan seluruh rincian order_items-nya.
func (r *OrderRepository) GetOrderByIDOrInvoice(ctx context.Context, idOrInv string) (*model.Order, error) {
	query := `
		SELECT
			id, invoice_no, initial_category, initial_service, initial_price,
			customer_name, customer_phone, address, notes, total_amount, status,
			created_at, updated_at
		FROM orders
		WHERE (id::text = $1 OR invoice_no = $1) AND deleted_at IS NULL
	`
	var o model.Order
	err := r.db.QueryRowContext(ctx, query, idOrInv).Scan(
		&o.ID, &o.InvoiceNo, &o.InitialCategory, &o.InitialService, &o.InitialPrice,
		&o.CustomerName, &o.CustomerPhone, &o.Address, &o.Notes, &o.TotalAmount, &o.Status,
		&o.CreatedAt, &o.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Ambil rincian order_items
	itemsQuery := `
		SELECT id, order_id, service_id, item_name, price, qty, unit, subtotal, notes, created_at, updated_at
		FROM order_items
		WHERE order_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, itemsQuery, o.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	o.Items = make([]model.OrderItem, 0)
	for rows.Next() {
		var it model.OrderItem
		if err := rows.Scan(
			&it.ID, &it.OrderID, &it.ServiceID, &it.ItemName, &it.Price, &it.Qty, &it.Unit, &it.Subtotal, &it.Notes,
			&it.CreatedAt, &it.UpdatedAt,
		); err != nil {
			return nil, err
		}
		o.Items = append(o.Items, it)
	}

	return &o, nil
}

// UpdateOrder memperbarui header pesanan (status, customer, notes, total).
func (r *OrderRepository) UpdateOrder(ctx context.Context, current *model.Order, req dto.UpdateOrderRequest) (*model.Order, error) {
	cName := current.CustomerName
	if req.CustomerName != nil {
		cName = req.CustomerName
	}
	cPhone := current.CustomerPhone
	if req.CustomerPhone != nil {
		cPhone = req.CustomerPhone
	}
	addr := current.Address
	if req.Address != nil {
		addr = req.Address
	}
	notes := current.Notes
	if req.Notes != nil {
		notes = req.Notes
	}
	total := current.TotalAmount
	if req.TotalAmount != nil {
		total = *req.TotalAmount
	}
	status := current.Status
	if req.Status != nil {
		status = *req.Status
	}

	query := `
		UPDATE orders
		SET
			customer_name = $1, customer_phone = $2, address = $3, notes = $4,
			total_amount = $5, status = $6, updated_at = NOW()
		WHERE id = $7::uuid AND deleted_at IS NULL
		RETURNING id, invoice_no, initial_category, initial_service, initial_price,
		          customer_name, customer_phone, address, notes, total_amount, status,
		          created_at, updated_at
	`
	var o model.Order
	err := r.db.QueryRowContext(ctx, query,
		cName, cPhone, addr, notes, total, status, current.ID,
	).Scan(
		&o.ID, &o.InvoiceNo, &o.InitialCategory, &o.InitialService, &o.InitialPrice,
		&o.CustomerName, &o.CustomerPhone, &o.Address, &o.Notes, &o.TotalAmount, &o.Status,
		&o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

// AddOrderItem menambahkan baris layanan baru pada order.
func (r *OrderRepository) AddOrderItem(ctx context.Context, orderID uuid.UUID, req dto.SaveOrderItemRequest) (*model.OrderItem, error) {
	var svcUUID *uuid.UUID
	if req.ServiceID != nil && *req.ServiceID != "" {
		if parsed, err := uuid.Parse(*req.ServiceID); err == nil {
			svcUUID = &parsed
		}
	}
	qty := req.Qty
	if qty <= 0 {
		qty = 1
	}
	unit := req.Unit
	if unit == "" {
		unit = "/ unit"
	}

	query := `
		INSERT INTO order_items (
			order_id, service_id, item_name, price, qty, unit, subtotal, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, order_id, service_id, item_name, price, qty, unit, subtotal, notes, created_at, updated_at
	`
	var it model.OrderItem
	err := r.db.QueryRowContext(ctx, query,
		orderID, svcUUID, req.ItemName, req.Price, qty, unit, req.Subtotal, req.Notes,
	).Scan(
		&it.ID, &it.OrderID, &it.ServiceID, &it.ItemName, &it.Price, &it.Qty, &it.Unit, &it.Subtotal, &it.Notes,
		&it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

// UpdateOrderItem mengubah harga, nama, atau qty pada baris layanan.
func (r *OrderRepository) UpdateOrderItem(ctx context.Context, itemID uuid.UUID, req dto.SaveOrderItemRequest) (*model.OrderItem, error) {
	var svcUUID *uuid.UUID
	if req.ServiceID != nil && *req.ServiceID != "" {
		if parsed, err := uuid.Parse(*req.ServiceID); err == nil {
			svcUUID = &parsed
		}
	}
	qty := req.Qty
	if qty <= 0 {
		qty = 1
	}
	unit := req.Unit
	if unit == "" {
		unit = "/ unit"
	}

	query := `
		UPDATE order_items
		SET
			service_id = $1, item_name = $2, price = $3, qty = $4, unit = $5,
			subtotal = $6, notes = $7, updated_at = NOW()
		WHERE id = $8::uuid
		RETURNING id, order_id, service_id, item_name, price, qty, unit, subtotal, notes, created_at, updated_at
	`
	var it model.OrderItem
	err := r.db.QueryRowContext(ctx, query,
		svcUUID, req.ItemName, req.Price, qty, unit, req.Subtotal, req.Notes, itemID,
	).Scan(
		&it.ID, &it.OrderID, &it.ServiceID, &it.ItemName, &it.Price, &it.Qty, &it.Unit, &it.Subtotal, &it.Notes,
		&it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

// DeleteOrderItem menghapus baris layanan dari invoice.
func (r *OrderRepository) DeleteOrderItem(ctx context.Context, itemID uuid.UUID) (bool, error) {
	query := `DELETE FROM order_items WHERE id = $1::uuid`
	res, err := r.db.ExecContext(ctx, query, itemID)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

// SoftDeleteOrder menghapus invoice pesanan.
func (r *OrderRepository) SoftDeleteOrder(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE orders SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}
