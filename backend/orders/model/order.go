package model

import (
	"time"

	"github.com/google/uuid"
)

// Order merepresentasikan satu transaksi atau nomor invoice pesanan.
type Order struct {
	ID              uuid.UUID   `json:"id"`
	InvoiceNo       string      `json:"invoice_no"`
	InitialCategory string      `json:"initial_category"`
	InitialService  string      `json:"initial_service"`
	InitialPrice    string      `json:"initial_price"`
	CustomerName    *string     `json:"customer_name,omitempty"`
	CustomerPhone   *string     `json:"customer_phone,omitempty"`
	Address         *string     `json:"address,omitempty"`
	Notes           *string     `json:"notes,omitempty"`
	TotalAmount     string      `json:"total_amount"`
	Status          string      `json:"status"`
	Items           []OrderItem `json:"items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
	DeletedAt       *time.Time  `json:"deleted_at,omitempty"`
}

// OrderItem merepresentasikan baris rincian layanan pada nota invoice.
type OrderItem struct {
	ID        uuid.UUID  `json:"id"`
	OrderID   uuid.UUID  `json:"order_id"`
	ServiceID *uuid.UUID `json:"service_id,omitempty"`
	ItemName  string     `json:"item_name"`
	Price     string     `json:"price"`
	Qty       int        `json:"qty"`
	Unit      string     `json:"unit"`
	Subtotal  string     `json:"subtotal"`
	Notes     *string    `json:"notes,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
