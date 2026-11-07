package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/orders/controller"
	"winteknikmandiri-backend/orders/repository"
	"winteknikmandiri-backend/orders/service"
)

// RegisterOrderRoutes mendaftarkan seluruh endpoint untuk alur order via WA & nego invoice.
func RegisterOrderRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewOrderRepository(db)
	svc := service.NewOrderService(repo)
	ctrl := controller.NewOrderController(svc)

	orderGroup := rg.Group("/orders")
	{
		orderGroup.POST("", ctrl.CreateManualOrder)
		orderGroup.GET("", ctrl.ListOrders)
		orderGroup.GET("/:id", ctrl.GetOrderDetail)
		orderGroup.PUT("/:id", ctrl.UpdateOrder)
		orderGroup.DELETE("/:id", ctrl.DeleteOrder)

		orderGroup.POST("/:id/items", ctrl.AddOrderItem)
		orderGroup.PUT("/items/:item_id", ctrl.UpdateOrderItem)
		orderGroup.DELETE("/items/:item_id", ctrl.DeleteOrderItem)
	}
}
