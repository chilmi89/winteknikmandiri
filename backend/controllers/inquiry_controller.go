package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"winteknikmandiri-backend/config"
	"winteknikmandiri-backend/models"
)

type InquiryController struct{}

func NewInquiryController() *InquiryController {
	return &InquiryController{}
}

// Create handles incoming consultation/booking requests
func (ctrl *InquiryController) Create(c *gin.Context) {
	var input models.Inquiry
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validasi gagal",
			"details": err.Error(),
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Database tidak terhubung",
		})
		return
	}

	input.Status = "pending"
	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Gagal menyimpan data inquiry",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Permohonan konsultasi berhasil disimpan",
		"data":    input,
	})
}

// List retrieves all inquiries with basic limit/offset
func (ctrl *InquiryController) List(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Database tidak terhubung",
		})
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	var inquiries []models.Inquiry
	var total int64

	config.DB.Model(&models.Inquiry{}).Count(&total)
	config.DB.Order("created_at desc").Limit(limit).Offset(offset).Find(&inquiries)

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"limit": limit,
		"data":  inquiries,
	})
}
