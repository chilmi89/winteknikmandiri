package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"winteknikmandiri-backend/gaji/dto"
	"winteknikmandiri-backend/gaji/model"
)

// GajiRepository menangani query PostgreSQL untuk tabel gaji dan gaji_proyek.
type GajiRepository struct {
	db *sql.DB
}

// NewGajiRepository membuat instance repository baru.
func NewGajiRepository(db *sql.DB) *GajiRepository {
	return &GajiRepository{db: db}
}

// GenerateKodeGaji membuat format GAJI-YYMM-XXXX.
func (r *GajiRepository) GenerateKodeGaji(ctx context.Context) (string, error) {
	prefix := time.Now().Format("0601") // misal '2611'
	query := `SELECT COUNT(*) FROM gaji WHERE kode_gaji LIKE $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, fmt.Sprintf("GAJI-%s-%%", prefix)).Scan(&count)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("GAJI-%s-%04d", prefix, count+1), nil
}


func (r *GajiRepository) ListGaji(
	ctx context.Context,
	teamID string,
	orderID string,
	dateFilter string,
	status string,
	search string,
	page int,
	limit int,
) ([]model.Gaji, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	whereClause := "WHERE g.deleted_at IS NULL"
	var args []any
	argIdx := 1

	if status != "" && status != "all" {
		whereClause += fmt.Sprintf(" AND g.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if teamID != "" {
		if parsed, err := uuid.Parse(teamID); err == nil {
			whereClause += fmt.Sprintf(" AND g.team_id = $%d::uuid", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	if dateFilter != "" {
		whereClause += fmt.Sprintf(" AND DATE(g.created_at) = $%d::date", argIdx)
		args = append(args, dateFilter)
		argIdx++
	}

	if orderID != "" {
		if parsed, err := uuid.Parse(orderID); err == nil {
			whereClause += fmt.Sprintf(" AND EXISTS (SELECT 1 FROM gaji_proyek gp WHERE gp.gaji_id = g.id AND gp.order_id = $%d::uuid)", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	if search != "" {
		s := "%" + search + "%"
		whereClause += fmt.Sprintf(" AND (g.kode_gaji ILIKE $%d OR t.name ILIKE $%d OR g.catatan ILIKE $%d)", argIdx, argIdx, argIdx)
		args = append(args, s)
		argIdx++
	}

	// Hitung Total Data
	countQuery := fmt.Sprintf(`
		SELECT COUNT(DISTINCT g.id)
		FROM gaji g
		JOIN team_members t ON g.team_id = t.id
		%s
	`, whereClause)

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count gaji: %w", err)
	}

	// query Data
	dataQuery := fmt.Sprintf(`
		SELECT
			g.id, g.kode_gaji, g.team_id, t.name as team_name, t.skill as team_skill,
			g.total_gaji, g.status, g.catatan, g.created_at, g.updated_at
		FROM gaji g
		JOIN team_members t ON g.team_id = t.id
		%s
		ORDER BY g.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIdx, argIdx+1)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query gaji: %w", err)
	}
	defer rows.Close()

	items := make([]model.Gaji, 0)
	for rows.Next() {
		var it model.Gaji
		if err := rows.Scan(
			&it.ID, &it.KodeGaji, &it.TeamID, &it.TeamName, &it.TeamSkill,
			&it.TotalGaji, &it.Status, &it.Catatan, &it.CreatedAt, &it.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, it)
	}

	if len(items) > 0 {
		gajiIDs := make([]any, len(items))
		placeholders := make([]string, len(items))
		for i, it := range items {
			gajiIDs[i] = it.ID
			placeholders[i] = fmt.Sprintf("$%d", i+1)
		}

		pQuery := fmt.Sprintf(`
			SELECT
				gp.id, gp.gaji_id, gp.order_id,
				o.invoice_no, o.initial_service, COALESCE(o.customer_name, ''),
				gp.nominal, gp.keterangan, gp.created_at, gp.updated_at
			FROM gaji_proyek gp
			JOIN orders o ON gp.order_id = o.id
			WHERE gp.gaji_id IN (%s)
			ORDER BY gp.created_at ASC
		`, strings.Join(placeholders, ","))

		pRows, err := r.db.QueryContext(ctx, pQuery, gajiIDs...)
		if err == nil {
			defer pRows.Close()
			proyekMap := make(map[uuid.UUID][]model.GajiProyek)
			for pRows.Next() {
				var p model.GajiProyek
				if err := pRows.Scan(
					&p.ID, &p.GajiID, &p.OrderID,
					&p.InvoiceNo, &p.NamaLayanan, &p.NamaCustomer,
					&p.Nominal, &p.Keterangan, &p.CreatedAt, &p.UpdatedAt,
				); err == nil {
					proyekMap[p.GajiID] = append(proyekMap[p.GajiID], p)
				}
			}
			for i := range items {
				items[i].Proyek = proyekMap[items[i].ID]
				if items[i].Proyek == nil {
					items[i].Proyek = make([]model.GajiProyek, 0)
				}
			}
		}
	}

	return items, total, rows.Err()
}

// GetGajiDetail mengambil 1 slip gaji lengkap beserta proyek-proyeknya.
func (r *GajiRepository) GetGajiDetail(ctx context.Context, id uuid.UUID) (*model.Gaji, error) {
	query := `
		SELECT
			g.id, g.kode_gaji, g.team_id, t.name as team_name, t.skill as team_skill,
			g.total_gaji, g.status, g.catatan, g.created_at, g.updated_at
		FROM gaji g
		JOIN team_members t ON g.team_id = t.id
		WHERE g.id = $1::uuid AND g.deleted_at IS NULL
	`
	var it model.Gaji
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID, &it.KodeGaji, &it.TeamID, &it.TeamName, &it.TeamSkill,
		&it.TotalGaji, &it.Status, &it.Catatan, &it.CreatedAt, &it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Ambil rincian proyek dari relasi orders
	pQuery := `
		SELECT
			gp.id, gp.gaji_id, gp.order_id,
			o.invoice_no, o.initial_service, COALESCE(o.customer_name, ''),
			gp.nominal, gp.keterangan, gp.created_at, gp.updated_at
		FROM gaji_proyek gp
		JOIN orders o ON gp.order_id = o.id
		WHERE gp.gaji_id = $1::uuid
		ORDER BY gp.created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, pQuery, it.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	it.Proyek = make([]model.GajiProyek, 0)
	for rows.Next() {
		var p model.GajiProyek
		if err := rows.Scan(
			&p.ID, &p.GajiID, &p.OrderID,
			&p.InvoiceNo, &p.NamaLayanan, &p.NamaCustomer,
			&p.Nominal, &p.Keterangan, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		it.Proyek = append(it.Proyek, p)
	}

	return &it, nil
}

// CreateGaji membuat slip gaji baru & menempelkan proyek-proyeknya.
func (r *GajiRepository) CreateGaji(ctx context.Context, kodeGaji string, teamUUID uuid.UUID, req dto.CreateGajiRequest) (*model.Gaji, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	status := req.Status
	if status == "" {
		status = "draft"
	}

	query := `
		INSERT INTO gaji (kode_gaji, team_id, total_gaji, status, catatan)
		VALUES ($1, $2, 'Rp 0', $3, $4)
		RETURNING id, kode_gaji, team_id, total_gaji, status, catatan, created_at, updated_at
	`
	var it model.Gaji
	err = tx.QueryRowContext(ctx, query, kodeGaji, teamUUID, status, req.Catatan).Scan(
		&it.ID, &it.KodeGaji, &it.TeamID, &it.TotalGaji, &it.Status, &it.Catatan, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert gaji: %w", err)
	}

	// Tempelkan proyek-proyek
	for _, pReq := range req.Proyek {
		orderUUID, err := uuid.Parse(pReq.OrderID)
		if err != nil {
			continue
		}
		pQuery := `
			INSERT INTO gaji_proyek (gaji_id, order_id, nominal, keterangan)
			VALUES ($1, $2, $3, $4)
		`
		_, err = tx.ExecContext(ctx, pQuery, it.ID, orderUUID, pReq.Nominal, pReq.Keterangan)
		if err != nil {
			return nil, fmt.Errorf("insert gaji_proyek: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &it, nil
}

// UpdateGaji mengubah status atau catatan slip gaji, serta menyinkronkan proyek jika disediakan.
func (r *GajiRepository) UpdateGaji(ctx context.Context, current *model.Gaji, req dto.UpdateGajiRequest) (*model.Gaji, error) {
	status := current.Status
	if req.Status != nil {
		status = *req.Status
	}
	catatan := current.Catatan
	if req.Catatan != nil {
		catatan = *req.Catatan
	}
	teamID := current.TeamID
	if req.TeamID != nil {
		if parsed, err := uuid.Parse(*req.TeamID); err == nil {
			teamID = parsed
		}
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `
		UPDATE gaji
		SET team_id = $1, status = $2, catatan = $3, updated_at = NOW()
		WHERE id = $4::uuid AND deleted_at IS NULL
		RETURNING id, kode_gaji, team_id, total_gaji, status, catatan, created_at, updated_at
	`
	var it model.Gaji
	err = tx.QueryRowContext(ctx, query, teamID, status, catatan, current.ID).Scan(
		&it.ID, &it.KodeGaji, &it.TeamID, &it.TotalGaji, &it.Status, &it.Catatan, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Jika req.Proyek disertakan, perbarui daftar proyek secara atomik
	if req.Proyek != nil {
		// Hapus proyek lama
		_, err = tx.ExecContext(ctx, `DELETE FROM gaji_proyek WHERE gaji_id = $1::uuid`, current.ID)
		if err != nil {
			return nil, fmt.Errorf("delete old gaji_proyek: %w", err)
		}

		// Masukkan proyek baru
		for _, pReq := range *req.Proyek {
			orderUUID, err := uuid.Parse(pReq.OrderID)
			if err != nil {
				continue
			}
			pQuery := `
				INSERT INTO gaji_proyek (gaji_id, order_id, nominal, keterangan)
				VALUES ($1, $2, $3, $4)
			`
			_, err = tx.ExecContext(ctx, pQuery, current.ID, orderUUID, pReq.Nominal, pReq.Keterangan)
			if err != nil {
				return nil, fmt.Errorf("insert gaji_proyek: %w", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &it, nil
}

// UpdateTotalGaji mengupdate akumulasi total_gaji di header gaji.
func (r *GajiRepository) UpdateTotalGaji(ctx context.Context, gajiID uuid.UUID, totalStr string) error {
	query := `UPDATE gaji SET total_gaji = $1, updated_at = NOW() WHERE id = $2::uuid`
	_, err := r.db.ExecContext(ctx, query, totalStr, gajiID)
	return err
}

// AttachProyek menempelkan 1 proyek baru ke slip gaji.
func (r *GajiRepository) AttachProyek(ctx context.Context, gajiID uuid.UUID, orderID uuid.UUID, nominal string, ket string) (*model.GajiProyek, error) {
	query := `
		INSERT INTO gaji_proyek (gaji_id, order_id, nominal, keterangan)
		VALUES ($1, $2, $3, $4)
		RETURNING id, gaji_id, order_id, nominal, keterangan, created_at, updated_at
	`
	var p model.GajiProyek
	err := r.db.QueryRowContext(ctx, query, gajiID, orderID, nominal, ket).Scan(
		&p.ID, &p.GajiID, &p.OrderID, &p.Nominal, &p.Keterangan, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// UpdateProyekGaji mengedit nominal proyek.
func (r *GajiRepository) UpdateProyekGaji(ctx context.Context, proyekID uuid.UUID, nominal string, ket string) (*model.GajiProyek, error) {
	query := `
		UPDATE gaji_proyek
		SET nominal = $1, keterangan = $2, updated_at = NOW()
		WHERE id = $3::uuid
		RETURNING id, gaji_id, order_id, nominal, keterangan, created_at, updated_at
	`
	var p model.GajiProyek
	err := r.db.QueryRowContext(ctx, query, nominal, ket, proyekID).Scan(
		&p.ID, &p.GajiID, &p.OrderID, &p.Nominal, &p.Keterangan, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// DeleteProyekGaji melepas proyek dari slip gaji.
func (r *GajiRepository) DeleteProyekGaji(ctx context.Context, proyekID uuid.UUID) (uuid.UUID, error) {
	query := `DELETE FROM gaji_proyek WHERE id = $1::uuid RETURNING gaji_id`
	var gajiID uuid.UUID
	err := r.db.QueryRowContext(ctx, query, proyekID).Scan(&gajiID)
	return gajiID, err
}

// DeleteGaji soft delete slip gaji.
func (r *GajiRepository) DeleteGaji(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE gaji SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}
