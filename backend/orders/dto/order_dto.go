package dto

import "time"

// OrderResponse representasi satu invoice/pesanan lengkap dengan item-itemnya.
type OrderResponse struct {
	ID              string              `json:"id"`
	InvoiceNo       string              `json:"invoice_no"`
	InitialCategory string              `json:"initial_category"`
	InitialService  string              `json:"initial_service"`
	InitialPrice    string              `json:"initial_price"`
	CustomerName    string              `json:"customer_name"`
	CustomerPhone   string              `json:"customer_phone"`
	Address         string              `json:"address"`
	Notes           string              `json:"notes"`
	TotalAmount     string              `json:"total_amount"`
	Status          string              `json:"status"`
	Items           []OrderItemResponse `json:"items"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
}

// OrderItemResponse representasi baris item pada invoice.
type OrderItemResponse struct {
	ID        string    `json:"id"`
	OrderID   string    `json:"order_id"`
	ServiceID string    `json:"service_id,omitempty"`
	ItemName  string    `json:"item_name"`
	Price     string    `json:"price"`
	Qty       int       `json:"qty"`
	Unit      string    `json:"unit"`
	Subtotal  string    `json:"subtotal"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ClickOrderRequest dipanggil saat klien klik tombol "PESAN" di web.
type ClickOrderRequest struct {
	CategoryID string `json:"category_id"`
	ServiceID  string `json:"service_id"`
	Category   string `json:"category" binding:"required"`
	Service    string `json:"service" binding:"required"`
	Price      string `json:"price"`
}

// ClickOrderResponse respon balik berisi invoice dan URL WhatsApp terformat rapi.
type ClickOrderResponse struct {
	InvoiceNo string `json:"invoice_no"`
	OrderID   string `json:"order_id"`
	WaURL     string `json:"wa_url"`
}

// UpdateOrderRequest admin mengupdate data header order (nama, WA, alamat, status, total).
type UpdateOrderRequest struct {
	CustomerName  *string `json:"customer_name"`
	CustomerPhone *string `json:"customer_phone"`
	Address       *string `json:"address"`
	Notes         *string `json:"notes"`
	TotalAmount   *string `json:"total_amount"`
	Status        *string `json:"status"`
}

// SaveOrderItemRequest payload tambah/ubah baris rincian layanan pada invoice.
type SaveOrderItemRequest struct {
	ServiceID *string `json:"service_id"`
	ItemName  string  `json:"item_name" binding:"required"`
	Price     string  `json:"price"`
	Qty       int     `json:"qty"`
	Unit      string  `json:"unit"`
	Subtotal  string  `json:"subtotal"`
	Notes     *string `json:"notes"`
}

// OrderEnvelope pembungkus single order response.
type OrderEnvelope struct {
	Message string        `json:"message,omitempty"`
	Data    OrderResponse `json:"data"`
}

// ListOrderEnvelope pembungkus list order response.
type ListOrderEnvelope struct {
	Message string          `json:"message,omitempty"`
	Data    []OrderResponse `json:"data"`
}

// OrderMessageResponse pesan sukses sederhana.
type OrderMessageResponse struct {
	Message string `json:"message"`
}
