// Package httpx berisi helper respons HTTP agar format JSON konsisten
// di seluruh endpoint.
package httpx

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/internal/apperr"
)

// JSON menulis payload sebagai JSON dengan status code tertentu.
func JSON(c *gin.Context, status int, payload any) {
	c.JSON(status, payload)
}

// Fail menerjemahkan error aplikasi menjadi respons HTTP yang sesuai.
func Fail(c *gin.Context, err error) {
	var appErr *apperr.Error
	if errors.As(err, &appErr) {
		switch appErr.Kind {
		case apperr.KindValidation:
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Error:   appErr.Message,
				Details: appErr.Details,
			})
		case apperr.KindNotFound:
			c.JSON(http.StatusNotFound, ErrorResponse{Error: appErr.Message})
		case apperr.KindConflict:
			c.JSON(http.StatusConflict, ErrorResponse{Error: appErr.Message})
		case apperr.KindUnavailable:
			c.JSON(http.StatusServiceUnavailable, ErrorResponse{Error: appErr.Message})
		default:
			log.Printf("[ERROR] %v", appErr)
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: appErr.Message})
		}
		return
	}

	log.Printf("[ERROR] %v", err)
	c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Terjadi kesalahan pada server"})
}
