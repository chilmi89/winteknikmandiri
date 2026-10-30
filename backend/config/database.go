package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"winteknikmandiri-backend/models"
)

var DB *gorm.DB

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

// InitDatabase initializes the connection to PostgreSQL via GORM
func InitDatabase() *gorm.DB {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "wtm_user")
	password := getEnv("DB_PASSWORD", "wtm_password_secret")
	dbname := getEnv("DB_NAME", "wtm_db")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		host, user, password, dbname, port, sslmode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Printf("[DB WARNING] Failed to connect to PostgreSQL: %v (continuing in offline/standalone mode)", err)
		return nil
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// Auto-Migrate schema
	log.Println("[DB] Running auto-migration for models...")
	if err := db.AutoMigrate(&models.Inquiry{}); err != nil {
		log.Printf("[DB ERROR] AutoMigrate failed: %v", err)
	} else {
		log.Println("[DB] PostgreSQL migration completed successfully.")
	}

	DB = db
	return db
}
