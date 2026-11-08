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

// KeuanganRepository menangani query PostgreSQL untuk kategori_keuangan, jurnal_keuangan, dan jurnal_items.
type KeuanganRepository struct {
	db *sql.DB
}

// NewKeuanganRepository membuat instance repository baru.
func NewKeuanganRepository(db *sql.DB) *KeuanganRepository {
	return &KeuanganRepository{db: db}
}

// ---------- 1. MASTER KATEGORI KEUANGAN ----------

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

func (r *KeuanganRepository) DeleteKategori(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE kategori_keuangan SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

// ---------- 2. BUKU KAS & JURNAL KEUANGAN (HEADER - ITEMS) ----------

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

// ListJurnal mengambil daftar nota kas dengan summary total & pagination.
func (r *KeuanganRepository) ListJurnal(
	ctx context.Context,
	search string,
	status string,
	cabang string,
	dateFrom string,
	dateTo string,
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

	if status != "" && status != "all" {
		whereClause += fmt.Sprintf(" AND j.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if cabang != "" && cabang != "all" {
		whereClause += fmt.Sprintf(" AND j.cabang = $%d", argIdx)
		args = append(args, cabang)
		argIdx++
	}

	if dateFrom != "" {
		whereClause += fmt.Sprintf(" AND DATE(j.waktu_transaksi) >= $%d::date", argIdx)
		args = append(args, dateFrom)
		argIdx++
	}

	if dateTo != "" {
		whereClause += fmt.Sprintf(" AND DATE(j.waktu_transaksi) <= $%d::date", argIdx)
		args = append(args, dateTo)
		argIdx++
	}

	if search != "" {
		s := "%" + search + "%"
		whereClause += fmt.Sprintf(` AND (
			j.kode_jurnal ILIKE $%d OR
			j.judul ILIKE $%d OR
			j.catatan ILIKE $%d
		)`, argIdx, argIdx, argIdx)
		args = append(args, s)
		argIdx++
	}

	// Hitung Summary Akumulasi (Pemasukan, Pengeluaran, Total)
	summaryQuery := fmt.Sprintf(`
		SELECT
			COUNT(DISTINCT j.id),
			COALESCE(SUM(j.numeric_pemasukan), 0),
			COALESCE(SUM(j.numeric_pengeluaran), 0)
		FROM jurnal_keuangan j
		%s
	`, whereClause)

	var totalCount int64
	var totalIn int64
	var totalOut int64
	if err := r.db.QueryRowContext(ctx, summaryQuery, args...).Scan(&totalCount, &totalIn, &totalOut); err != nil {
		return nil, 0, 0, 0, fmt.Errorf("summary jurnal: %w", err)
	}

	// Sorting
	orderBy := "j.waktu_transaksi DESC, j.created_at DESC"
	dir := "DESC"
	if strings.ToUpper(sortDir) == "ASC" {
		dir = "ASC"
	}
	switch sortBy {
	case "tanggal", "waktu":
		orderBy = fmt.Sprintf("j.waktu_transaksi %s", dir)
	case "nominal", "saldo":
		orderBy = fmt.Sprintf("j.numeric_saldo %s", dir)
	case "judul":
		orderBy = fmt.Sprintf("j.judul %s", dir)
	}

	// Query Nota
	dataQuery := fmt.Sprintf(`
		SELECT
			j.id, j.kode_jurnal, j.judul, j.waktu_transaksi, j.cabang, j.status,
			j.total_pemasukan, j.total_pengeluaran, j.saldo_bersih,
			j.numeric_pemasukan, j.numeric_pengeluaran, j.numeric_saldo,
			j.catatan, j.created_at, j.updated_at
		FROM jurnal_keuangan j
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
			&it.ID, &it.KodeJurnal, &it.Judul, &it.WaktuTransaksi, &it.Cabang, &it.Status,
			&it.TotalPemasukan, &it.TotalPengeluaran, &it.SaldoBersih,
			&it.NumericPemasukan, &it.NumericPengeluaran, &it.NumericSaldo,
			&it.Catatan, &it.CreatedAt, &it.UpdatedAt,
		); err != nil {
			return nil, 0, 0, 0, err
		}
		items = append(items, it)
	}

	// Batch-load items untuk setiap nota yang ada di halaman ini
	if len(items) > 0 {
		jurnalIDs := make([]any, len(items))
		placeholders := make([]string, len(items))
		for i, it := range items {
			jurnalIDs[i] = it.ID
			placeholders[i] = fmt.Sprintf("$%d", i+1)
		}

		itemQuery := fmt.Sprintf(`
			SELECT
				ji.id, ji.jurnal_id, ji.tipe, ji.deskripsi,
				ji.kategori_id, COALESCE(k.nama_kategori, 'Umum') as nama_kategori,
				ji.metode_pembayaran, ji.nominal, ji.amount_numeric,
				ji.sumber, ji.order_id, COALESCE(o.invoice_no, '') as invoice_no,
				ji.gaji_id, COALESCE(g.kode_gaji, '') as kode_gaji,
				ji.catatan, ji.created_at, ji.updated_at
			FROM jurnal_items ji
			LEFT JOIN kategori_keuangan k ON ji.kategori_id = k.id
			LEFT JOIN orders o ON ji.order_id = o.id
			LEFT JOIN gaji g ON ji.gaji_id = g.id
			WHERE ji.jurnal_id IN (%s)
			ORDER BY ji.created_at ASC
		`, strings.Join(placeholders, ","))

		itemRows, err := r.db.QueryContext(ctx, itemQuery, jurnalIDs...)
		if err == nil {
			defer itemRows.Close()
			itemMap := make(map[uuid.UUID][]model.JurnalItem)
			for itemRows.Next() {
				var itm model.JurnalItem
				if err := itemRows.Scan(
					&itm.ID, &itm.JurnalID, &itm.Tipe, &itm.Deskripsi,
					&itm.KategoriID, &itm.NamaKategori,
					&itm.MetodePembayaran, &itm.Nominal, &itm.AmountNumeric,
					&itm.Sumber, &itm.OrderID, &itm.InvoiceNo,
					&itm.GajiID, &itm.KodeGaji,
					&itm.Catatan, &itm.CreatedAt, &itm.UpdatedAt,
				); err == nil {
					itemMap[itm.JurnalID] = append(itemMap[itm.JurnalID], itm)
				}
			}
			for i := range items {
				items[i].Items = itemMap[items[i].ID]
				if items[i].Items == nil {
					items[i].Items = make([]model.JurnalItem, 0)
				}
			}
		}
	}

	return items, totalCount, totalIn, totalOut, rows.Err()
}

// GetJurnalByID mengambil satu nota jurnal kas lengkap beserta baris-baris rinciannya.
func (r *KeuanganRepository) GetJurnalByID(ctx context.Context, id uuid.UUID) (*model.JurnalKeuangan, error) {
	query := `
		SELECT
			j.id, j.kode_jurnal, j.judul, j.waktu_transaksi, j.cabang, j.status,
			j.total_pemasukan, j.total_pengeluaran, j.saldo_bersih,
			j.numeric_pemasukan, j.numeric_pengeluaran, j.numeric_saldo,
			j.catatan, j.created_at, j.updated_at
		FROM jurnal_keuangan j
		WHERE j.id = $1::uuid AND j.deleted_at IS NULL
	`
	var it model.JurnalKeuangan
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&it.ID, &it.KodeJurnal, &it.Judul, &it.WaktuTransaksi, &it.Cabang, &it.Status,
		&it.TotalPemasukan, &it.TotalPengeluaran, &it.SaldoBersih,
		&it.NumericPemasukan, &it.NumericPengeluaran, &it.NumericSaldo,
		&it.Catatan, &it.CreatedAt, &it.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Ambil rincian items
	itemQuery := `
		SELECT
			ji.id, ji.jurnal_id, ji.tipe, ji.deskripsi,
			ji.kategori_id, COALESCE(k.nama_kategori, 'Umum') as nama_kategori,
			ji.metode_pembayaran, ji.nominal, ji.amount_numeric,
			ji.sumber, ji.order_id, COALESCE(o.invoice_no, '') as invoice_no,
			ji.gaji_id, COALESCE(g.kode_gaji, '') as kode_gaji,
			ji.catatan, ji.created_at, ji.updated_at
		FROM jurnal_items ji
		LEFT JOIN kategori_keuangan k ON ji.kategori_id = k.id
		LEFT JOIN orders o ON ji.order_id = o.id
		LEFT JOIN gaji g ON ji.gaji_id = g.id
		WHERE ji.jurnal_id = $1::uuid
		ORDER BY ji.created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, itemQuery, it.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	it.Items = make([]model.JurnalItem, 0)
	for rows.Next() {
		var itm model.JurnalItem
		if err := rows.Scan(
			&itm.ID, &itm.JurnalID, &itm.Tipe, &itm.Deskripsi,
			&itm.KategoriID, &itm.NamaKategori,
			&itm.MetodePembayaran, &itm.Nominal, &itm.AmountNumeric,
			&itm.Sumber, &itm.OrderID, &itm.InvoiceNo,
			&itm.GajiID, &itm.KodeGaji,
			&itm.Catatan, &itm.CreatedAt, &itm.UpdatedAt,
		); err != nil {
			return nil, err
		}
		it.Items = append(it.Items, itm)
	}

	return &it, nil
}

// CreateJurnal membuat nota kas baru beserta rincian barisnya dalam 1 transaksi DB.
func (r *KeuanganRepository) CreateJurnal(
	ctx context.Context,
	kodeJurnal string,
	judul string,
	waktuTransaksi time.Time,
	cabang string,
	status string,
	catatan string,
	items []model.JurnalItem,
	totInStr string,
	totOutStr string,
	saldoStr string,
	numIn int64,
	numOut int64,
	numSaldo int64,
) (*model.JurnalKeuangan, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if cabang == "" {
		cabang = "Workshop Pusat Kediri"
	}
	if status == "" {
		status = "draft"
	}
	if judul == "" {
		judul = fmt.Sprintf("Rekap Kas %s", waktuTransaksi.Format("02 Jan 2006"))
	}

	query := `
		INSERT INTO jurnal_keuangan (
			kode_jurnal, judul, waktu_transaksi, cabang, status,
			total_pemasukan, total_pengeluaran, saldo_bersih,
			numeric_pemasukan, numeric_pengeluaran, numeric_saldo, catatan
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`
	var id uuid.UUID
	err = tx.QueryRowContext(
		ctx, query,
		kodeJurnal, judul, waktuTransaksi, cabang, status,
		totInStr, totOutStr, saldoStr,
		numIn, numOut, numSaldo, catatan,
	).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("insert header jurnal: %w", err)
	}

	// Insert Items
	itemQuery := `
		INSERT INTO jurnal_items (
			jurnal_id, tipe, deskripsi, kategori_id, metode_pembayaran,
			nominal, amount_numeric, sumber, order_id, gaji_id, catatan
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	for _, itm := range items {
		_, err = tx.ExecContext(
			ctx, itemQuery,
			id, itm.Tipe, itm.Deskripsi, itm.KategoriID, itm.MetodePembayaran,
			itm.Nominal, itm.AmountNumeric, itm.Sumber, itm.OrderID, itm.GajiID, itm.Catatan,
		)
		if err != nil {
			return nil, fmt.Errorf("insert jurnal_items: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return r.GetJurnalByID(ctx, id)
}

// UpdateJurnal memperbarui nota kas dan menyinkronkan rincian barisnya dalam 1 transaksi DB.
func (r *KeuanganRepository) UpdateJurnal(
	ctx context.Context,
	current *model.JurnalKeuangan,
	judul string,
	waktuTransaksi time.Time,
	cabang string,
	status string,
	catatan string,
	items *[]model.JurnalItem,
	totInStr string,
	totOutStr string,
	saldoStr string,
	numIn int64,
	numOut int64,
	numSaldo int64,
) (*model.JurnalKeuangan, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `
		UPDATE jurnal_keuangan
		SET judul = $1, waktu_transaksi = $2, cabang = $3, status = $4,
		    total_pemasukan = $5, total_pengeluaran = $6, saldo_bersih = $7,
		    numeric_pemasukan = $8, numeric_pengeluaran = $9, numeric_saldo = $10,
		    catatan = $11, updated_at = NOW()
		WHERE id = $12::uuid AND deleted_at IS NULL
	`
	_, err = tx.ExecContext(
		ctx, query,
		judul, waktuTransaksi, cabang, status,
		totInStr, totOutStr, saldoStr,
		numIn, numOut, numSaldo,
		catatan, current.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("update header jurnal: %w", err)
	}

	if items != nil {
		// Hapus item lama
		_, err = tx.ExecContext(ctx, `DELETE FROM jurnal_items WHERE jurnal_id = $1::uuid`, current.ID)
		if err != nil {
			return nil, fmt.Errorf("delete old items: %w", err)
		}

		// Insert item baru
		itemQuery := `
			INSERT INTO jurnal_items (
				jurnal_id, tipe, deskripsi, kategori_id, metode_pembayaran,
				nominal, amount_numeric, sumber, order_id, gaji_id, catatan
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		`
		for _, itm := range *items {
			_, err = tx.ExecContext(
				ctx, itemQuery,
				current.ID, itm.Tipe, itm.Deskripsi, itm.KategoriID, itm.MetodePembayaran,
				itm.Nominal, itm.AmountNumeric, itm.Sumber, itm.OrderID, itm.GajiID, itm.Catatan,
			)
			if err != nil {
				return nil, fmt.Errorf("insert new items: %w", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return r.GetJurnalByID(ctx, current.ID)
}

// DeleteJurnal soft-delete nota kas beserta seluruh rinciannya.
func (r *KeuanganRepository) DeleteJurnal(ctx context.Context, id uuid.UUID) (bool, error) {
	query := `UPDATE jurnal_keuangan SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}
