package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"path"
	"sort"
	"strings"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

const createMigrationsTableSQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
	version    TEXT PRIMARY KEY,
	applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`

// RunMigrations menjalankan seluruh file SQL di folder migrations secara
// berurutan, satu transaksi per file, dan mencatat versi yang sudah jalan.
func RunMigrations(ctx context.Context, db *sql.DB) error {
	if db == nil {
		return ErrUnavailable
	}

	if _, err := db.ExecContext(ctx, createMigrationsTableSQL); err != nil {
		return fmt.Errorf("membuat tabel schema_migrations: %w", err)
	}

	files, err := fs.Glob(migrationFS, "migrations/*.sql")
	if err != nil {
		return fmt.Errorf("membaca daftar migrasi: %w", err)
	}
	sort.Strings(files)

	appliedCount := 0
	for _, file := range files {
		version := strings.TrimSuffix(path.Base(file), ".sql")

		applied, err := isApplied(ctx, db, version)
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		script, err := migrationFS.ReadFile(file)
		if err != nil {
			return fmt.Errorf("membaca migrasi %s: %w", version, err)
		}

		if err := applyMigration(ctx, db, version, string(script)); err != nil {
			return err
		}

		appliedCount++
		log.Printf("[DB] Migrasi %s diterapkan.", version)
	}

	if appliedCount == 0 {
		log.Println("[DB] Semua migrasi sudah terbaru.")
	}
	return nil
}

func isApplied(ctx context.Context, db *sql.DB, version string) (bool, error) {
	var exists bool
	err := db.QueryRowContext(
		ctx,
		`SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)`,
		version,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("cek migrasi %s: %w", version, err)
	}
	return exists, nil
}

func applyMigration(ctx context.Context, db *sql.DB, version, script string) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("mulai transaksi migrasi %s: %w", version, err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, script); err != nil {
		return fmt.Errorf("eksekusi migrasi %s: %w", version, err)
	}

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO schema_migrations (version) VALUES ($1)`,
		version,
	); err != nil {
		return fmt.Errorf("mencatat migrasi %s: %w", version, err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit migrasi %s: %w", version, err)
	}
	return nil
}
