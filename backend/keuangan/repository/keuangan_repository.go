package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"winteknikmandiri-backend/keuangan/dto"
	"winteknikmandiri-backend/keuangan/model"
)

// KeuanganRepository menangani query PostgreSQL untuk kategori_keuangan dan jurnal_keuangan.
type KeuanganRepository struct {
	db *sql.DB
}

// NewKeuanganRepository membuat instance repository baru.
func NewKeuanganRepository(db *sql.DB) *KeuanganRepository {
	return &KeuanganRepository{db: db}
}

// ---------- 1. MASTER KATEGORI KEUANGAN ----------

// ListKategori mengambil daftar kategori keuangan (opsional filter tipe pemasukan/pengeluaran).
func (r *KeuanganRepository) ListKategori(ctx context.Context, tipe string) ([]model.KategoriKeuangan, error) {
	query := `
		SELECT id, nama_kategori, tipe, deskripsi, is_system, created_at, updated_at
		FROM kategori_keuangan
		WHERE deleted_at IS NULL
	`
	var args []any
	if tipe != "" && tipe != "all" {
		query += " AND tipe = $1"
		args = append(args, tipe)
	}
	query += " ORDER BY is_system DESC, nama_kategori ASC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.KategoriKeuangan, 0)
	for rows.Next() {
		var k model.KategoriKeuangan
		if err := rows.Scan(&k.ID, &k.NamaKategori, &k.Tipe, &k.Deskripsi, &k.IsSystem, &k.CreatedAt, &k.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, k)
	}
	return items, rows.Err()
}

// GetKategoriByID mengambil satu kategori berdasarkan ID.
func (r *KeuanganRepository) GetKategoriByID(ctx context.Context, id uuid.UUID) (*model.KategoriKeuangan, error) {
	query := `
		SELECT id, nama_kategori, tipe, deskripsi, is_system, created_at, updated_at
		FROM kategori_keuangan
		WHERE id = $1::uuid AND deleted_at IS NULL
	`
	var k model.KategoriKeuangan
	err := r.db.QueryRowContext(ctx, query, id).Scan(&k.ID, &k.NamaKategori, &k.Tipe, &k.Deskripsi, &k.IsSystem, &k.CreatedAt, &k.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &k, nil
}

// CreateKategori membuat kategori keuangan baru.
func (r *KeuanganRepository) CreateKategori(ctx context.Context, req dto.CreateKategoriRequest) (*model.KategoriKeuangan, error) {
	query := `
		INSERT INTO kategori_keuangan (nama_kategori, tipe, deskripsi, is_system)
		VALUES ($1, $2, $3, FALSE)
		RETURNING id, nama_kategori, tipe, deskripsi, is_system, created_at, updated_at
	`
	var k model.KategoriKeuangan
	err := r.db.QueryRowContext(ctx, query, req.NamaKategori, req.Tipe, req.Deskripsi).Scan(
		&k.ID, &k.NamaKategori, &k.Tipe, &k.Deskripsi, &k.IsSystem, &k.CreatedAt, &k.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &k, nil
}

// UpdateKategori memperbarui nama atau deskripsi kategori.
func (r *KeuanganRepository) UpdateKategori(ctx context.Context, current *model.KategoriKeuangan, req dto.UpdateKategoriRequest) (*model.KategoriKeuangan, error) {
	nama := current.NamaKategori
	if req.NamaKategori != nil {
		nama = *req.NamaKategori
	}
	tipe := current.Tipe
	if req.Tipe != nil {
		tipe = *req.Tipe
	}
	deskripsi := current.Deskripsi
	if req.Deskripsi != nil {
		deskripsi = *req.Deskripsi
	}

	query := `
		UPDATE kategori_keuangan
		SET nama_kategori = $1, tipe = $2, deskripsi = $3, updated_at = NOW()
		WHERE id = $4::uuid AND deleted_at IS NULL
		RETURNING id, nama_kategori, tipe, deskripsi, is_system, created_at, updated_at
	`
	var k model.KategoriKeuangan
	err := r.db.QueryRowContext(ctx, query, nama, tipe, deskripsi, current.ID).Scan(
		&k.ID, &k.NamaKategori, &k.Tipe, &k.Deskripsi, &k.IsSystem, &k.CreatedAt, &k.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &k, nil
}

// DeleteKategori menghapus kategori keuangan (soft delete).
func (r *KeuanganRepository) DeleteKategori(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE kategori_keuangan SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

// ---------- 2. BUKU KAS & JURNAL KEUANGAN ----------

// GenerateKodeJurnal membuat format JRN-YYMM-XXXX.
func (r *KeuanganRepository) GenerateKodeJurnal(ctx context.Context) (string, error) {
	prefix := time.Now().Format("0601") // misal '2611'
	query := `SELECT COUNT(*) FROM jurnal_keuangan WHERE kode_jurnal LIKE $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, fmt.Sprintf("JRN-%s-%%", prefix)).Scan(&count)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("JRN-%s-%04d", prefix, count+1), nil
}

// ListJurnal mengambil daftar transaksi jurnal dengan filter dinamis, pagination, dan summary total.
func (r *KeuanganRepository) ListJurnal(
	ctx context.Context,
	search string,
	tipe string,
	kategoriID string,
	orderID string,
	gajiID string,
	dateFrom string,
	dateTo string,
	pembayaran string,
	status string,
	sortBy string,
	sortDir string,
	page int,
	limit int,
) ([]model.JurnalKeuangan, int64, int64, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	whereClause := "WHERE j.deleted_at IS NULL"
	var args []any
	argIdx := 1

	if tipe != "" && tipe != "all" {
		whereClause += fmt.Sprintf(" AND j.tipe = $%d", argIdx)
		args = append(args, tipe)
		argIdx++
	}

	if kategoriID != "" && kategoriID != "all" {
		if parsed, err := uuid.Parse(kategoriID); err == nil {
			whereClause += fmt.Sprintf(" AND j.kategori_id = $%d::uuid", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	if orderID != "" && orderID != "all" {
		if parsed, err := uuid.Parse(orderID); err == nil {
			whereClause += fmt.Sprintf(" AND j.order_id = $%d::uuid", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	if gajiID != "" && gajiID != "all" {
		if parsed, err := uuid.Parse(gajiID); err == nil {
			whereClause += fmt.Sprintf(" AND j.gaji_id = $%d::uuid", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	if dateFrom != "" {
		whereClause += fmt.Sprintf(" AND j.tanggal >= $%d::date", argIdx)
		args = append(args, dateFrom)
		argIdx++
	}

	if dateTo != "" {
		whereClause += fmt.Sprintf(" AND j.tanggal <= $%d::date", argIdx)
		args = append(args, dateTo)
		argIdx++
	}

	if pembayaran != "" && pembayaran != "all" {
		whereClause += fmt.Sprintf(" AND j.metode_pembayaran = $%d", argIdx)
		args = append(args, pembayaran)
		argIdx++
	}

	if status != "" && status != "all" {
		whereClause += fmt.Sprintf(" AND j.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if search != "" {
		s := "%" + search + "%"
		whereClause += fmt.Sprintf(` AND (
			j.kode_jurnal ILIKE $%d OR
			j.judul ILIKE $%d OR
			j.catatan ILIKE $%d OR
			COALESCE(k.nama_kategori, '') ILIKE $%d OR
			COALESCE(o.invoice_no, '') ILIKE $%d OR
			COALESCE(g.kode_gaji, '') ILIKE $%d
		)`, argIdx, argIdx, argIdx, argIdx, argIdx, argIdx)
		args = append(args, s)
		argIdx++
	}

	// 1. Hitung Total & Summary Akumulasi (Pemasukan, Pengeluaran)
	summaryQuery := fmt.Sprintf(`
		SELECT
			COUNT(DISTINCT j.id),
			COALESCE(SUM(CASE WHEN j.tipe = 'pemasukan' AND j.status != 'batal' THEN j.amount_numeric ELSE 0 END), 0) as total_in,
			COALESCE(SUM(CASE WHEN j.tipe = 'pengeluaran' AND j.status != 'batal' THEN j.amount_numeric ELSE 0 END), 0) as total_out
		FROM jurnal_keuangan j
		LEFT JOIN kategori_keuangan k ON j.kategori_id = k.id
		LEFT JOIN orders o ON j.order_id = o.id
		LEFT JOIN gaji g ON j.gaji_id = g.id
		%s
	`, whereClause)

	var totalCount int64
	var totalIn int64
	var totalOut int64
	if err := r.db.QueryRowContext(ctx, summaryQuery, args...).Scan(&totalCount, &totalIn, &totalOut); err != nil {
		return nil, 0, 0, 0, fmt.Errorf("summary jurnal: %w", err)
	}

	// 2. Sorting clause
	orderBy := "j.tanggal DESC, j.created_at DESC"
	dir := "DESC"
	if strings.ToUpper(sortDir) == "ASC" {
		dir = "ASC"
	}
	switch sortBy {
	case "tanggal":
		orderBy = fmt.Sprintf("j.tanggal %s, j.created_at %s", dir, dir)
	case "nominal":
		orderBy = fmt.Sprintf("j.amount_numeric %s", dir)
	case "judul":
		orderBy = fmt.Sprintf("j.judul %s", dir)
	}

	// 3. Query Data Halaman Ini
	dataQuery := fmt.Sprintf(`
		SELECT
			j.id, j.kode_jurnal, j.tipe, j.judul,
			j.kategori_id, COALESCE(k.nama_kategori, 'Umum') as nama_kategori,
			j.metode_pembayaran, j.nominal, j.amount_numeric, j.status,
			TO_CHAR(j.tanggal, 'YYYY-MM-DD') as tanggal, j.sumber,
			j.order_id, COALESCE(o.invoice_no, '') as invoice_no,
			j.gaji_id, COALESCE(g.kode_gaji, '') as kode_gaji,
			j.catatan, j.created_at, j.updated_at
		FROM jurnal_keuangan j
		LEFT JOIN kategori_keuangan k ON j.kategori_id = k.id
		LEFT JOIN orders o ON j.order_id = o.id
		LEFT JOIN gaji g ON j.gaji_id = g.id
		%s
		ORDER BY %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderBy, argIdx, argIdx+1)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, 0, 0, fmt.Errorf("query list jurnal: %w", err)
	}
	defer rows.Close()

	items := make([]model.JurnalKeuangan, 0)
	for rows.Next() {
		var it model.JurnalKeuangan
		if err := rows.Scan(
			&it.ID, &it.KodeJurnal, &it.Tipe, &it.Judul,
			&it.KategoriID, &it.NamaKategori,
			&it.MetodePembayaran, &it.Nominal, &it.AmountNumeric, &it.Status,
			&it.Tanggal, &it.Sumber,
			&it.OrderID, &it.InvoiceNo,
			&it.GajiID, &it.KodeGaji,
			&it.Catatan, &it.CreatedAt, &it.UpdatedAt,
		); err != nil {
			return nil, 0, 0, 0, err
		}
		items = append(items, it)
	}

	return items, totalCount, totalIn, totalOut, rows.Err()
}

// GetJurnalByID mengambil satu transaksi jurnal lengkap dengan relasinya.
func (r *KeuanganRepository) GetJurnalByID(ctx context.Context, id uuid.UUID) (*model.JurnalKeuangan, error) {
	query := `
		SELECT
			j.id, j.kode_jurnal, j.tipe, j.judul,
			j.kategori_id, COALESCE(k.nama_kategori, 'Umum') as nama_kategori,
			j.metode_pembayaran, j.nominal, j.amount_numeric, j.status,
			TO_CHAR(j.tanggal, 'YYYY-MM-DD') as tanggal, j.sumber,
			j.order_id, COALESCE(o.invoice_no, '') as invoice_no,
			j.gaji_id, COALESCE(g.kode_gaji, '') as kode_gaji,
			j.catatan, j.created_at, j.updated_at
		FROM jurnal_keuangan j
		LEFT JOIN kategori_keuangan k ON j.kategori_id = k.id
		LEFT JOIN orders o ON j.order_id = o.id
		LEFT JOIN gaji g ON j.gaji_id = g.id
		WHERE j.id = $1::uuid AND j.deleted_at IS NULL
	`
	var it model.JurnalKeuangan
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID, &it.KodeJurnal, &it.Tipe, &it.Judul,
		&it.KategoriID, &it.NamaKategori,
		&it.MetodePembayaran, &it.Nominal, &it.AmountNumeric, &it.Status,
		&it.Tanggal, &it.Sumber,
		&it.OrderID, &it.InvoiceNo,
		&it.GajiID, &it.KodeGaji,
		&it.Catatan, &it.CreatedAt, &it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &it, nil
}

// CreateJurnal membuat entri transaksi jurnal baru.
func (r *KeuanganRepository) CreateJurnal(
	ctx context.Context,
	kodeJurnal string,
	amountNumeric int64,
	kategoriUUID *uuid.UUID,
	orderUUID *uuid.UUID,
	gajiUUID *uuid.UUID,
	req dto.CreateJurnalRequest,
) (*model.JurnalKeuangan, error) {
	status := req.Status
	if status == "" {
		status = "lunas"
	}
	pembayaran := req.MetodePembayaran
	if pembayaran == "" {
		pembayaran = "transfer"
	}
	tanggal := req.Tanggal
	if tanggal == "" {
		tanggal = time.Now().Format("2006-01-02")
	}
	sumber := req.Sumber
	if sumber == "" {
		sumber = "manual"
	}

	query := `
		INSERT INTO jurnal_keuangan (
			kode_jurnal, tipe, judul, kategori_id, metode_pembayaran,
			nominal, amount_numeric, status, tanggal, sumber,
			order_id, gaji_id, catatan
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, $11, $12, $13)
		RETURNING id, kode_jurnal, tipe, judul, kategori_id, metode_pembayaran,
		          nominal, amount_numeric, status, TO_CHAR(tanggal, 'YYYY-MM-DD'), sumber,
		          order_id, gaji_id, catatan, created_at, updated_at
	`
	var it model.JurnalKeuangan
	err := r.db.QueryRowContext(
		ctx, query,
		kodeJurnal, req.Tipe, req.Judul, kategoriUUID, pembayaran,
		req.Nominal, amountNumeric, status, tanggal, sumber,
		orderUUID, gajiUUID, req.Catatan,
	).Scan(
		&it.ID, &it.KodeJurnal, &it.Tipe, &it.Judul, &it.KategoriID, &it.MetodePembayaran,
		&it.Nominal, &it.AmountNumeric, &it.Status, &it.Tanggal, &it.Sumber,
		&it.OrderID, &it.GajiID, &it.Catatan, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert jurnal: %w", err)
	}

	return r.GetJurnalByID(ctx, it.ID)
}

// UpdateJurnal memperbarui entri transaksi jurnal kas.
func (r *KeuanganRepository) UpdateJurnal(
	ctx context.Context,
	current *model.JurnalKeuangan,
	amountNumeric int64,
	kategoriUUID *uuid.UUID,
	orderUUID *uuid.UUID,
	gajiUUID *uuid.UUID,
	req dto.UpdateJurnalRequest,
) (*model.JurnalKeuangan, error) {
	tipe := current.Tipe
	if req.Tipe != nil {
		tipe = *req.Tipe
	}
	judul := current.Judul
	if req.Judul != nil {
		judul = *req.Judul
	}
	pembayaran := current.MetodePembayaran
	if req.MetodePembayaran != nil {
		pembayaran = *req.MetodePembayaran
	}
	nominal := current.Nominal
	if req.Nominal != nil {
		nominal = *req.Nominal
	}
	status := current.Status
	if req.Status != nil {
		status = *req.Status
	}
	tanggal := current.Tanggal
	if req.Tanggal != nil {
		tanggal = *req.Tanggal
	}
	sumber := current.Sumber
	if req.Sumber != nil {
		sumber = *req.Sumber
	}
	catatan := current.Catatan
	if req.Catatan != nil {
		catatan = *req.Catatan
	}

	query := `
		UPDATE jurnal_keuangan
		SET tipe = $1, judul = $2, kategori_id = $3, metode_pembayaran = $4,
		    nominal = $5, amount_numeric = $6, status = $7, tanggal = $8::date,
		    sumber = $9, order_id = $10, gaji_id = $11, catatan = $12, updated_at = NOW()
		WHERE id = $13::uuid AND deleted_at IS NULL
	`
	_, err := r.db.ExecContext(
		ctx, query,
		tipe, judul, kategoriUUID, pembayaran,
		nominal, amountNumeric, status, tanggal,
		sumber, orderUUID, gajiUUID, catatan, current.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("update jurnal: %w", err)
	}

	return r.GetJurnalByID(ctx, current.ID)
}

// DeleteJurnal soft-delete satu transaksi jurnal keuangan.
func (r *KeuanganRepository) DeleteJurnal(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE jurnal_keuangan SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}
