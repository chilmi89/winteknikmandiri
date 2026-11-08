package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"winteknikmandiri-backend/keuangan/controller"
	"winteknikmandiri-backend/keuangan/repository"
	"winteknikmandiri-backend/keuangan/service"
)

// RegisterKeuanganRoutes mendaftarkan seluruh endpoint untuk modul manajemen keuangan.
func RegisterKeuanganRoutes(rg *gin.RouterGroup, db *sql.DB) {
	repo := repository.NewKeuanganRepository(db)
	svc := service.NewKeuanganService(repo)
	ctrl := controller.NewKeuanganController(svc)

	keuanganGroup := rg.Group("/keuangan")
	{
		// 0. Laporan Finansial 4 Periode
		keuanganGroup.GET("/laporan", ctrl.GetLaporan)

		// 1. Kategori Keuangan
		kategoriGroup := keuanganGroup.Group("/kategori")
		{
			kategoriGroup.GET("", ctrl.ListKategori)
			kategoriGroup.POST("", ctrl.CreateKategori)
			kategoriGroup.PUT("/:id", ctrl.UpdateKategori)
			kategoriGroup.DELETE("/:id", ctrl.DeleteKategori)
		}

		// 2. Jurnal Keuangan
		jurnalGroup := keuanganGroup.Group("/jurnal")
		{
			jurnalGroup.GET("", ctrl.ListJurnal)
			jurnalGroup.GET("/next-code", ctrl.GetNextKodeJurnal)
			jurnalGroup.GET("/:id", ctrl.GetJurnalByID)
			jurnalGroup.POST("", ctrl.CreateJurnal)
			jurnalGroup.PUT("/:id", ctrl.UpdateJurnal)
			jurnalGroup.DELETE("/:id", ctrl.DeleteJurnal)
		}
	}
}
