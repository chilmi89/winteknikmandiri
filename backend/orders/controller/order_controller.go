package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
	"winteknikmandiri-backend/internal/httpx"
	"winteknikmandiri-backend/orders/dto"
	"winteknikmandiri-backend/orders/service"
)

// OrderController menangani HTTP request untuk modul pesanan & invoice.
type OrderController struct {
	svc *service.OrderService
}

// NewOrderController membuat instance controller baru.
func NewOrderController(svc *service.OrderService) *OrderController {
	return &OrderController{svc: svc}
}

// ClickOrder godoc
// @Summary     Inisiasi order otomatis saat pelanggan klik tombol Pesan di web
// @Description Membuat invoice status menunggu_chat dan mengembalikan URL WhatsApp resmi.
// @Tags        orders
// @Accept      json
// @Produce     json
// @Param       body body dto.ClickOrderRequest true "Data klik layanan"
// @Success     200 {object} dto.ClickOrderResponse
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/orders/click [post]
func (ctrl *OrderController) ClickOrder(c *gin.Context) {
	var req dto.ClickOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.InitiateClickOrder(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

// CreateManualOrder godoc
// @Summary     Buat invoice pesanan baru secara manual oleh admin
// @Description Dibuat admin saat chat WhatsApp masuk & kesepakatan nego dicatat.
// @Tags        orders
// @Accept      json
// @Produce     json
// @Param       body body dto.CreateManualOrderRequest true "Payload order manual"
// @Success     201 {object} dto.OrderEnvelope
// @Failure     400 {object} httpx.ErrorResponse
// @Router      /api/v1/orders [post]
func (ctrl *OrderController) CreateManualOrder(c *gin.Context) {
	var req dto.CreateManualOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	res, err := ctrl.svc.CreateManualOrder(c.Request.Context(), req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, dto.OrderEnvelope{
		Message: "Pesanan & invoice berhasil dibuat",
		Data:    *res,
	})
}

// ListOrders godoc
// @Summary     Daftar pesanan & invoice
// @Tags        orders
// @Produce     json
// @Param       status query string false "Filter status (menunggu_chat, negosiasi, deal, selesai)"
// @Param       search query string false "Cari no invoice / digit belakang / nama / telepon"
// @Param       date query string false "Filter tanggal spesifik YYYY-MM-DD"
// @Success     200 {object} dto.ListOrderEnvelope
// @Router      /api/v1/orders [get]
func (ctrl *OrderController) ListOrders(c *gin.Context) {
	status := c.Query("status")
	search := c.Query("search")
	dateFilter := c.Query("date")
	items, err := ctrl.svc.ListOrders(c.Request.Context(), status, search, dateFilter)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.ListOrderEnvelope{
		Message: "Daftar pesanan berhasil dimuat",
		Data:    items,
	})
}

// GetOrderDetail godoc
// @Summary     Detail satu invoice & rincian layanannya
// @Tags        orders
// @Produce     json
// @Param       id path string true "ID Order atau No Invoice (mis. INV-2611-0001)"
// @Success     200 {object} dto.OrderEnvelope
// @Router      /api/v1/orders/{id} [get]
func (ctrl *OrderController) GetOrderDetail(c *gin.Context) {
	idOrInv := c.Param("id")
	item, err := ctrl.svc.GetOrderDetail(c.Request.Context(), idOrInv)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.OrderEnvelope{
		Message: "Detail invoice berhasil dimuat",
		Data:    *item,
	})
}

// UpdateOrder godoc
// @Summary     Perbarui header pesanan (Data Klien, Status, Total)
// @Tags        orders
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Order (UUID)"
// @Param       body body dto.UpdateOrderRequest true "Data update"
// @Success     200 {object} dto.OrderEnvelope
// @Router      /api/v1/orders/{id} [put]
func (ctrl *OrderController) UpdateOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	updated, err := ctrl.svc.UpdateOrder(c.Request.Context(), id, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.OrderEnvelope{
		Message: "Pesanan berhasil diperbarui",
		Data:    *updated,
	})
}

// AddOrderItem godoc
// @Summary     Tambah layanan ke invoice (Katalog / Custom)
// @Tags        orders
// @Accept      json
// @Produce     json
// @Param       id path string true "ID Order (UUID)"
// @Param       body body dto.SaveOrderItemRequest true "Data baris layanan"
// @Success     201 {object} dto.OrderItemResponse
// @Router      /api/v1/orders/{id}/items [post]
func (ctrl *OrderController) AddOrderItem(c *gin.Context) {
	orderID := c.Param("id")
	var req dto.SaveOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	item, err := ctrl.svc.AddOrderItem(c.Request.Context(), orderID, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, item)
}

// UpdateOrderItem godoc
// @Summary     Ubah harga nego / qty baris layanan pada invoice
// @Tags        orders
// @Accept      json
// @Produce     json
// @Param       item_id path string true "ID Order Item (UUID)"
// @Param       body body dto.SaveOrderItemRequest true "Data update item"
// @Success     200 {object} dto.OrderItemResponse
// @Router      /api/v1/orders/items/{item_id} [put]
func (ctrl *OrderController) UpdateOrderItem(c *gin.Context) {
	itemID := c.Param("item_id")
	var req dto.SaveOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.Fail(c, apperr.Validation("Validasi gagal", err.Error()))
		return
	}
	item, err := ctrl.svc.UpdateOrderItem(c.Request.Context(), itemID, req)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

// DeleteOrderItem godoc
// @Summary     Hapus baris layanan dari invoice
// @Tags        orders
// @Produce     json
// @Param       item_id path string true "ID Order Item (UUID)"
// @Success     200 {object} dto.OrderMessageResponse
// @Router      /api/v1/orders/items/{item_id} [delete]
func (ctrl *OrderController) DeleteOrderItem(c *gin.Context) {
	itemID := c.Param("item_id")
	if err := ctrl.svc.DeleteOrderItem(c.Request.Context(), itemID); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.OrderMessageResponse{
		Message: "Baris layanan berhasil dihapus dari invoice",
	})
}

// DeleteOrder godoc
// @Summary     Hapus invoice pesanan (soft delete)
// @Tags        orders
// @Produce     json
// @Param       id path string true "ID Order (UUID)"
// @Success     200 {object} dto.OrderMessageResponse
// @Router      /api/v1/orders/{id} [delete]
func (ctrl *OrderController) DeleteOrder(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.svc.DeleteOrder(c.Request.Context(), id); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.JSON(http.StatusOK, dto.OrderMessageResponse{
		Message: "Pesanan berhasil dihapus",
	})
}
