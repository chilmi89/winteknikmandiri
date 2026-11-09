package routes

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	authrouter "winteknikmandiri-backend/auth/router"
	faqcontroller "winteknikmandiri-backend/faqs/controller"
	faqrepository "winteknikmandiri-backend/faqs/repository"
	faqrouter "winteknikmandiri-backend/faqs/router"
	faqservice "winteknikmandiri-backend/faqs/service"
	gajirouter "winteknikmandiri-backend/gaji/router"
	galleryrouter "winteknikmandiri-backend/gallery/router"
	companystatsrouter "winteknikmandiri-backend/company_stats/router"
	healthcontroller "winteknikmandiri-backend/health/controller"
	healthrouter "winteknikmandiri-backend/health/router"
	homeherocontroller "winteknikmandiri-backend/home_hero/controller"
	homeherorepository "winteknikmandiri-backend/home_hero/repository"
	homeherorouter "winteknikmandiri-backend/home_hero/router"
	homeheroservice "winteknikmandiri-backend/home_hero/service"
	inquirycontroller "winteknikmandiri-backend/inquiries/controller"
	inquiryrepository "winteknikmandiri-backend/inquiries/repository"
	inquiryrouter "winteknikmandiri-backend/inquiries/router"
	inquiryservice "winteknikmandiri-backend/inquiries/service"
	"winteknikmandiri-backend/internal/database"
	"winteknikmandiri-backend/internal/httpx"
	jamrouter "winteknikmandiri-backend/jam_operasional/router"
	katalogrouter "winteknikmandiri-backend/katalog_layanan/router"
	keuanganrouter "winteknikmandiri-backend/keuangan/router"
	orderrouter "winteknikmandiri-backend/orders/router"
	pilarrouter "winteknikmandiri-backend/pilar_layanan/router"
	servicecontroller "winteknikmandiri-backend/services/controller"
	servicerepository "winteknikmandiri-backend/services/repository"
	servicerouter "winteknikmandiri-backend/services/router"
	serviceservice "winteknikmandiri-backend/services/service"
	sosmedrouter "winteknikmandiri-backend/sosial_media/router"
	teamrouter "winteknikmandiri-backend/teams/router"
	userrouter "winteknikmandiri-backend/users/router"
	visimisirouter "winteknikmandiri-backend/visi_misi/router"
)

// SetupRouter merakit middleware, dependency per fitur, dan seluruh route.
func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Dokumentasi API (OpenAPI 3 / Swagger UI).
	// Matikan di production dengan SWAGGER_ENABLED=false.
	if swaggerEnabled() {
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// Health check (root, bukan /api/v1).
	healthCtrl := healthcontroller.NewHealthController(database.DB)
	healthrouter.RegisterRoutes(r, healthCtrl)

	v1 := r.Group("/api/v1")
	authrouter.RegisterAuthRoutes(v1, database.DB)
	registerInquiryRoutes(v1)
	registerFAQRoutes(v1)
	registerServiceRoutes(v1)
	registerHomeHeroRoutes(v1)
	registerPilarLayananRoutes(v1)
	registerJamOperasionalRoutes(v1)
	registerSosialMediaRoutes(v1)
	registerVisiMisiRoutes(v1)
	registerTeamMemberRoutes(v1)
	registerGalleryRoutes(v1)
	registerKatalogRoutes(v1)
	registerOrderRoutes(v1)
	registerGajiRoutes(v1)
	registerKeuanganRoutes(v1)
	registerCompanyStatRoutes(v1)
	userrouter.RegisterUserRoutes(v1, database.DB)

	r.NoRoute(func(c *gin.Context) {
		httpx.JSON(c, http.StatusNotFound, httpx.ErrorResponse{Error: "Endpoint tidak ditemukan"})
	})

	return r
}

// registerInquiryRoutes merakit layer fitur inquiries.
func registerInquiryRoutes(rg *gin.RouterGroup) {
	repo := inquiryrepository.NewInquiryRepository(database.DB)
	svc := inquiryservice.NewInquiryService(repo)
	ctrl := inquirycontroller.NewInquiryController(svc)
	inquiryrouter.RegisterRoutes(rg, ctrl)
}

// registerFAQRoutes merakit layer fitur FAQ.
func registerFAQRoutes(rg *gin.RouterGroup) {
	repo := faqrepository.NewFAQRepository(database.DB)
	svc := faqservice.NewFAQService(repo)
	ctrl := faqcontroller.NewFAQController(svc)
	faqrouter.RegisterRoutes(rg, ctrl)
}

// registerServiceRoutes merakit layer fitur Layanan.
func registerServiceRoutes(rg *gin.RouterGroup) {
	repo := servicerepository.NewServiceRepository(database.DB)
	svc := serviceservice.NewServiceService(repo)
	ctrl := servicecontroller.NewServiceController(svc)
	servicerouter.RegisterRoutes(rg, ctrl)
}

// registerHomeHeroRoutes merakit layer fitur Home Hero banner.
func registerHomeHeroRoutes(rg *gin.RouterGroup) {
	repo := homeherorepository.NewHomeHeroRepository(database.DB)
	svc := homeheroservice.NewHomeHeroService(repo)
	ctrl := homeherocontroller.NewHomeHeroController(svc)
	homeherorouter.RegisterRoutes(rg, ctrl)
}

// registerPilarLayananRoutes merakit layer fitur Pilar Layanan homepage.
func registerPilarLayananRoutes(rg *gin.RouterGroup) {
	pilarrouter.RegisterPilarLayananRoutes(rg, database.DB)
}

// registerJamOperasionalRoutes merakit layer fitur Jam Operasional.
func registerJamOperasionalRoutes(rg *gin.RouterGroup) {
	jamrouter.RegisterJamOperasionalRoutes(rg, database.DB)
}

// registerSosialMediaRoutes merakit layer fitur Sosial Media.
func registerSosialMediaRoutes(rg *gin.RouterGroup) {
	sosmedrouter.RegisterSosialMediaRoutes(rg, database.DB)
}

// registerVisiMisiRoutes merakit layer fitur Visi & Misi Perusahaan.
func registerVisiMisiRoutes(rg *gin.RouterGroup) {
	visimisirouter.RegisterVisiMisiRoutes(rg, database.DB)
}

// registerTeamMemberRoutes merakit layer fitur Tim Teknisi.
func registerTeamMemberRoutes(rg *gin.RouterGroup) {
	teamrouter.RegisterTeamMemberRoutes(rg, database.DB)
}

// registerGalleryRoutes merakit layer fitur Galeri Proyek.
func registerGalleryRoutes(rg *gin.RouterGroup) {
	galleryrouter.RegisterGalleryRoutes(rg, database.DB)
}

// registerKatalogRoutes merakit layer fitur Katalog Kategori & Item Layanan.
func registerKatalogRoutes(rg *gin.RouterGroup) {
	katalogrouter.RegisterKatalogRoutes(rg, database.DB)
}

// registerOrderRoutes merakit layer fitur Pesanan & Invoice Nego.
func registerOrderRoutes(rg *gin.RouterGroup) {
	orderrouter.RegisterOrderRoutes(rg, database.DB)
}

// registerGajiRoutes merakit layer fitur Penggajian Tim Multi-Proyek.
func registerGajiRoutes(rg *gin.RouterGroup) {
	gajirouter.RegisterGajiRoutes(rg, database.DB)
}

// registerKeuanganRoutes merakit layer fitur Manajemen Keuangan & Jurnal Kas.
func registerKeuanganRoutes(rg *gin.RouterGroup) {
	keuanganrouter.RegisterKeuanganRoutes(rg, database.DB)
}

// registerCompanyStatRoutes merakit layer fitur Statistik Pencapaian Perusahaan.
func registerCompanyStatRoutes(rg *gin.RouterGroup) {
	companystatsrouter.RegisterCompanyStatRoutes(rg, database.DB)
}

// swaggerEnabled membaca SWAGGER_ENABLED; default aktif bila tidak diset.
func swaggerEnabled() bool {
	value, ok := os.LookupEnv("SWAGGER_ENABLED")
	if !ok {
		return true
	}
	return !strings.EqualFold(strings.TrimSpace(value), "false")
}
