package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"

	"winteknikmandiri-backend/config"
	"winteknikmandiri-backend/routes"
)

func main() {
	// Load .env file if available (for local non-docker runs)
	if err := godotenv.Load(); err != nil {
		log.Println("[INFO] No .env file found; using environment variables.")
	}

	// Initialize database connection
	config.InitDatabase()

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
