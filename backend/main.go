package main

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"

	_ "winteknikmandiri-backend/docs"
	"winteknikmandiri-backend/internal/database"
	"winteknikmandiri-backend/routes"
)

//go:generate go run github.com/swaggo/swag/cmd/swag@v1.16.4 init -g main.go -o docs --parseInternal

// @title           CV Win Teknik Mandiri API
// @version         1.0
// @description     REST API layanan AC, ducting, dan cold storage CV Win Teknik Mandiri.
// @description     Seluruh endpoint mengembalikan JSON. Data disimpan di PostgreSQL dengan query native (database/sql + pgx), tanpa ORM.
// @BasePath        /
// @securityDefinitions.apikey AdminToken
// @in              header
// @name            X-Admin-Token
func main() {
	// Load .env file if available (for local non-docker runs)
	if err := godotenv.Load(); err != nil {
		log.Println("[INFO] No .env file found; using environment variables.")
	}

	ctx := context.Background()

	// Initialize database connection (PostgreSQL native via pgx).
	if _, err := database.Connect(ctx); err != nil {
		log.Printf("[DB WARNING] %v (continuing in offline/standalone mode)", err)
	} else {
		defer database.Close()

		// Schema dikelola lewat file SQL di internal/database/migrations.
		if err := database.RunMigrations(ctx, database.DB); err != nil {
			log.Fatalf("[DB ERROR] Migrasi gagal: %v", err)
		}
	}

	// Setup Gin router
	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 [CV Win Teknik Mandiri API] Listening on :%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
