// Package database mengelola koneksi PostgreSQL native (tanpa ORM)
// menggunakan database/sql + driver pgx v5.
package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // driver "pgx" untuk database/sql
)

// ErrUnavailable dikembalikan saat database belum/tidak terhubung.
var ErrUnavailable = errors.New("database tidak terhubung")

// DB adalah connection pool global. Nilainya boleh nil bila database gagal
// terhubung (mode offline), sehingga handler wajib menangani ErrUnavailable.
var DB *sql.DB

// Config menampung parameter koneksi PostgreSQL.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

// DSN membangun connection string format keyword/value untuk pgx.
func (c Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Jakarta",
		c.Host, c.Port, c.User, c.Password, c.Name, c.SSLMode,
	)
}

// LoadConfig membaca konfigurasi database dari environment variable.
func LoadConfig() Config {
	return Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "wtm_user"),
		Password: getEnv("DB_PASSWORD", "Wtm_S3cur3#P0stgr3s!2026"),
		Name:     getEnv("DB_NAME", "wtm_db"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}
}

// Connect membuka connection pool dan memastikan koneksi benar-benar hidup.
func Connect(ctx context.Context) (*sql.DB, error) {
	cfg := LoadConfig()

	db, err := sql.Open("pgx", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("membuka koneksi postgres: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(time.Hour)
	db.SetConnMaxIdleTime(15 * time.Minute)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := db.PingContext(pingCtx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping postgres di %s:%s/%s: %w", cfg.Host, cfg.Port, cfg.Name, err)
	}

	DB = db
	log.Printf("[DB] Terhubung ke PostgreSQL %s:%s/%s", cfg.Host, cfg.Port, cfg.Name)
	return db, nil
}

// Close menutup connection pool global.
func Close() {
	if DB == nil {
		return
	}
	if err := DB.Close(); err != nil {
		log.Printf("[DB WARNING] Gagal menutup koneksi: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
