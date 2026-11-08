package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"strconv"
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

// GetLaporanData mengakumulasikan data analitik keuangan untuk 4 periode (harian, mingguan, bulanan, tahunan).
func (r *KeuanganRepository) GetLaporanData(
	ctx context.Context,
	periode string,
	tanggal string,
	startDate string,
	endDate string,
	month int,
	year int,
	orderID string,
	kategoriID string,
	sortDir string,
	page int,
	limit int,
) (*dto.LaporanResponse, error) {
	now := time.Now()
	if year <= 0 {
		year = now.Year()
	}
	if month <= 0 {
		month = int(now.Month())
	}
	if tanggal == "" {
		tanggal = now.Format("2006-01-02")
	}

	whereClause := "WHERE j.deleted_at IS NULL"
	var args []any
	argIdx := 1
	var periodeLabel string

	switch periode {
	case "harian":
		whereClause += fmt.Sprintf(" AND DATE(j.waktu_transaksi) = $%d::date", argIdx)
		args = append(args, tanggal)
		argIdx++
		parsedDate, _ := time.Parse("2006-01-02", tanggal)
		periodeLabel = fmt.Sprintf("Laporan Harian: %s", parsedDate.Format("02 January 2006"))

	case "mingguan":
		if startDate == "" || endDate == "" {
			weekday := int(now.Weekday())
			if weekday == 0 {
				weekday = 7
			}
			monday := now.AddDate(0, 0, -weekday+1)
			sunday := monday.AddDate(0, 0, 6)
			startDate = monday.Format("2006-01-02")
			endDate = sunday.Format("2006-01-02")
		}
		whereClause += fmt.Sprintf(" AND j.waktu_transaksi >= $%d::date AND j.waktu_transaksi < ($%d::date + INTERVAL '1 day')", argIdx, argIdx+1)
		args = append(args, startDate, endDate)
		argIdx += 2
		periodeLabel = fmt.Sprintf("Laporan Mingguan: %s s/d %s", startDate, endDate)

	case "tahunan":
		whereClause += fmt.Sprintf(" AND EXTRACT(YEAR FROM j.waktu_transaksi) = $%d", argIdx)
		args = append(args, year)
		argIdx++
		periodeLabel = fmt.Sprintf("Laporan Tahunan: Tahun %d", year)

	default: // bulanan
		periode = "bulanan"
		whereClause += fmt.Sprintf(" AND EXTRACT(MONTH FROM j.waktu_transaksi) = $%d AND EXTRACT(YEAR FROM j.waktu_transaksi) = $%d", argIdx, argIdx+1)
		args = append(args, month, year)
		argIdx += 2
		monthNames := []string{"", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"}
		mName := "Bulan Ini"
		if month >= 1 && month <= 12 {
			mName = monthNames[month]
		}
		periodeLabel = fmt.Sprintf("Laporan Bulanan: %s %d", mName, year)
	}

	if orderID != "" && orderID != "all" {
		if parsed, err := uuid.Parse(orderID); err == nil {
			whereClause += fmt.Sprintf(" AND ji.order_id = $%d::uuid", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	if kategoriID != "" && kategoriID != "all" {
		if parsed, err := uuid.Parse(kategoriID); err == nil {
			whereClause += fmt.Sprintf(" AND ji.kategori_id = $%d::uuid", argIdx)
			args = append(args, parsed)
			argIdx++
		}
	}

	// 1. Hitung Ringkasan (Summary)
	summaryQuery := fmt.Sprintf(`
		SELECT
			COALESCE(SUM(CASE WHEN ji.tipe = 'pemasukan' THEN ji.amount_numeric ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN ji.tipe = 'pengeluaran' THEN ji.amount_numeric ELSE 0 END), 0),
			COUNT(DISTINCT ji.id)
		FROM jurnal_items ji
		JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
		%s
	`, whereClause)

	var sumIn, sumOut, totalTrx int64
	if err := r.db.QueryRowContext(ctx, summaryQuery, args...).Scan(&sumIn, &sumOut, &totalTrx); err != nil {
		return nil, fmt.Errorf("summary laporan: %w", err)
	}

	netSaldo := sumIn - sumOut
	var marginPct float64
	if sumIn > 0 {
		marginPct = math.Round((float64(netSaldo)/float64(sumIn))*1000) / 10
	}

	// 2. Query Data Grafik Batang Berdasarkan Periode
	var chartPoints []dto.ChartBarPoint

	switch periode {
	case "harian":
		// Jam 08:00 sampai 20:00
		hourLabels := []string{"08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"}
		chartMapIn := make(map[int]int64)
		chartMapOut := make(map[int]int64)

		cQuery := fmt.Sprintf(`
			SELECT
				EXTRACT(HOUR FROM j.waktu_transaksi)::int as hr,
				COALESCE(SUM(CASE WHEN ji.tipe = 'pemasukan' THEN ji.amount_numeric ELSE 0 END), 0),
				COALESCE(SUM(CASE WHEN ji.tipe = 'pengeluaran' THEN ji.amount_numeric ELSE 0 END), 0)
			FROM jurnal_items ji
			JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
			%s
			GROUP BY hr
		`, whereClause)

		cRows, _ := r.db.QueryContext(ctx, cQuery, args...)
		if cRows != nil {
			defer cRows.Close()
			for cRows.Next() {
				var hr int
				var inVal, outVal int64
				if err := cRows.Scan(&hr, &inVal, &outVal); err == nil {
					chartMapIn[hr] = inVal
					chartMapOut[hr] = outVal
				}
			}
		}

		chartPoints = make([]dto.ChartBarPoint, len(hourLabels))
		hours := []int{8, 10, 12, 14, 16, 18, 20}
		for i, h := range hours {
			inV := chartMapIn[h] + chartMapIn[h+1]
			outV := chartMapOut[h] + chartMapOut[h+1]
			salV := inV - outV
			chartPoints[i] = dto.ChartBarPoint{
				Label:          hourLabels[i],
				Pemasukan:      inV,
				Pengeluaran:    outV,
				Saldo:          salV,
				PemasukanStr:   fmt.Sprintf("Rp %s", formatRupiah(inV)),
				PengeluaranStr: fmt.Sprintf("Rp %s", formatRupiah(outV)),
				SaldoStr:       formatSaldo(salV),
			}
		}

	case "mingguan":
		dayLabels := []string{"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"}
		chartMapIn := make(map[int]int64)
		chartMapOut := make(map[int]int64)

		cQuery := fmt.Sprintf(`
			SELECT
				EXTRACT(ISODOW FROM j.waktu_transaksi)::int as dow,
				COALESCE(SUM(CASE WHEN ji.tipe = 'pemasukan' THEN ji.amount_numeric ELSE 0 END), 0),
				COALESCE(SUM(CASE WHEN ji.tipe = 'pengeluaran' THEN ji.amount_numeric ELSE 0 END), 0)
			FROM jurnal_items ji
			JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
			%s
			GROUP BY dow
		`, whereClause)

		cRows, _ := r.db.QueryContext(ctx, cQuery, args...)
		if cRows != nil {
			defer cRows.Close()
			for cRows.Next() {
				var dow int
				var inVal, outVal int64
				if err := cRows.Scan(&dow, &inVal, &outVal); err == nil {
					chartMapIn[dow] = inVal
					chartMapOut[dow] = outVal
				}
			}
		}

		chartPoints = make([]dto.ChartBarPoint, 7)
		for i := 1; i <= 7; i++ {
			inV := chartMapIn[i]
			outV := chartMapOut[i]
			salV := inV - outV
			chartPoints[i-1] = dto.ChartBarPoint{
				Label:          dayLabels[i-1],
				Pemasukan:      inV,
				Pengeluaran:    outV,
				Saldo:          salV,
				PemasukanStr:   fmt.Sprintf("Rp %s", formatRupiah(inV)),
				PengeluaranStr: fmt.Sprintf("Rp %s", formatRupiah(outV)),
				SaldoStr:       formatSaldo(salV),
			}
		}

	case "tahunan":
		monthNames := []string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"}
		chartMapIn := make(map[int]int64)
		chartMapOut := make(map[int]int64)

		cQuery := fmt.Sprintf(`
			SELECT
				EXTRACT(MONTH FROM j.waktu_transaksi)::int as m,
				COALESCE(SUM(CASE WHEN ji.tipe = 'pemasukan' THEN ji.amount_numeric ELSE 0 END), 0),
				COALESCE(SUM(CASE WHEN ji.tipe = 'pengeluaran' THEN ji.amount_numeric ELSE 0 END), 0)
			FROM jurnal_items ji
			JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
			%s
			GROUP BY m
		`, whereClause)

		cRows, _ := r.db.QueryContext(ctx, cQuery, args...)
		if cRows != nil {
			defer cRows.Close()
			for cRows.Next() {
				var m int
				var inVal, outVal int64
				if err := cRows.Scan(&m, &inVal, &outVal); err == nil {
					chartMapIn[m] = inVal
					chartMapOut[m] = outVal
				}
			}
		}

		chartPoints = make([]dto.ChartBarPoint, 12)
		for i := 1; i <= 12; i++ {
			inV := chartMapIn[i]
			outV := chartMapOut[i]
			salV := inV - outV
			chartPoints[i-1] = dto.ChartBarPoint{
				Label:          monthNames[i-1],
				Pemasukan:      inV,
				Pengeluaran:    outV,
				Saldo:          salV,
				PemasukanStr:   fmt.Sprintf("Rp %s", formatRupiah(inV)),
				PengeluaranStr: fmt.Sprintf("Rp %s", formatRupiah(outV)),
				SaldoStr:       formatSaldo(salV),
			}
		}

	default: // bulanan
		weekLabels := []string{"Minggu I", "Minggu II", "Minggu III", "Minggu IV", "Minggu V"}
		chartMapIn := make(map[int]int64)
		chartMapOut := make(map[int]int64)

		cQuery := fmt.Sprintf(`
			SELECT
				(FLOOR((EXTRACT(DAY FROM j.waktu_transaksi) - 1) / 7) + 1)::int as wk,
				COALESCE(SUM(CASE WHEN ji.tipe = 'pemasukan' THEN ji.amount_numeric ELSE 0 END), 0),
				COALESCE(SUM(CASE WHEN ji.tipe = 'pengeluaran' THEN ji.amount_numeric ELSE 0 END), 0)
			FROM jurnal_items ji
			JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
			%s
			GROUP BY wk
		`, whereClause)

		cRows, _ := r.db.QueryContext(ctx, cQuery, args...)
		if cRows != nil {
			defer cRows.Close()
			for cRows.Next() {
				var wk int
				var inVal, outVal int64
				if err := cRows.Scan(&wk, &inVal, &outVal); err == nil {
					chartMapIn[wk] = inVal
					chartMapOut[wk] = outVal
				}
			}
		}

		chartPoints = make([]dto.ChartBarPoint, 5)
		for i := 1; i <= 5; i++ {
			inV := chartMapIn[i]
			outV := chartMapOut[i]
			salV := inV - outV
			chartPoints[i-1] = dto.ChartBarPoint{
				Label:          weekLabels[i-1],
				Pemasukan:      inV,
				Pengeluaran:    outV,
				Saldo:          salV,
				PemasukanStr:   fmt.Sprintf("Rp %s", formatRupiah(inV)),
				PengeluaranStr: fmt.Sprintf("Rp %s", formatRupiah(outV)),
				SaldoStr:       formatSaldo(salV),
			}
		}
	}

	// 3. Kategori Breakdown
	kategoriBreakdown := make([]dto.KategoriBreakdown, 0)
	kbQuery := fmt.Sprintf(`
		SELECT
			COALESCE(k.nama_kategori, 'Umum') as kat,
			ji.tipe,
			COALESCE(SUM(ji.amount_numeric), 0) as tot
		FROM jurnal_items ji
		JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
		LEFT JOIN kategori_keuangan k ON ji.kategori_id = k.id
		%s
		GROUP BY kat, ji.tipe
		ORDER BY tot DESC
		LIMIT 6
	`, whereClause)

	kbRows, _ := r.db.QueryContext(ctx, kbQuery, args...)
	if kbRows != nil {
		defer kbRows.Close()
		for kbRows.Next() {
			var kat, tip string
			var tot int64
			if err := kbRows.Scan(&kat, &tip, &tot); err == nil {
				var pct float64
				if tip == "pemasukan" && sumIn > 0 {
					pct = math.Round((float64(tot)/float64(sumIn))*1000) / 10
				} else if tip == "pengeluaran" && sumOut > 0 {
					pct = math.Round((float64(tot)/float64(sumOut))*1000) / 10
				}
				kategoriBreakdown = append(kategoriBreakdown, dto.KategoriBreakdown{
					Kategori:      kat,
					Tipe:          tip,
					Total:         fmt.Sprintf("Rp %s", formatRupiah(tot)),
					AmountNumeric: tot,
					Percentage:    pct,
				})
			}
		}
	}

	// 4. Query Items List dengan Pagination
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	orderDir := "DESC"
	if strings.ToUpper(sortDir) == "ASC" {
		orderDir = "ASC"
	}

	tableQuery := fmt.Sprintf(`
		SELECT
			ji.id, ji.jurnal_id, j.kode_jurnal, j.waktu_transaksi,
			ji.tipe, ji.deskripsi, COALESCE(k.nama_kategori, 'Umum') as nama_kategori,
			ji.metode_pembayaran, ji.nominal, ji.amount_numeric,
			ji.sumber, COALESCE(o.invoice_no, '') as invoice_no, COALESCE(g.kode_gaji, '') as kode_gaji
		FROM jurnal_items ji
		JOIN jurnal_keuangan j ON ji.jurnal_id = j.id
		LEFT JOIN kategori_keuangan k ON ji.kategori_id = k.id
		LEFT JOIN orders o ON ji.order_id = o.id
		LEFT JOIN gaji g ON ji.gaji_id = g.id
		%s
		ORDER BY j.waktu_transaksi %s, ji.created_at %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderDir, orderDir, argIdx, argIdx+1)

	pagedArgs := append(args, limit, offset)
	tRows, err := r.db.QueryContext(ctx, tableQuery, pagedArgs...)
	if err != nil {
		return nil, fmt.Errorf("query table laporan: %w", err)
	}
	defer tRows.Close()

	items := make([]dto.LaporanItemRow, 0)
	for tRows.Next() {
		var row dto.LaporanItemRow
		if err := tRows.Scan(
			&row.ID, &row.JurnalID, &row.KodeJurnal, &row.WaktuTransaksi,
			&row.Tipe, &row.Deskripsi, &row.NamaKategori,
			&row.MetodePembayaran, &row.Nominal, &row.AmountNumeric,
			&row.Sumber, &row.InvoiceNo, &row.KodeGaji,
		); err == nil {
			items = append(items, row)
		}
	}

	totalPages := int(math.Ceil(float64(totalTrx) / float64(limit)))

	return &dto.LaporanResponse{
		Periode:      periode,
		PeriodeLabel: periodeLabel,
		Summary: dto.LaporanSummary{
			TotalPemasukan:     fmt.Sprintf("Rp %s", formatRupiah(sumIn)),
			TotalPengeluaran:   fmt.Sprintf("Rp %s", formatRupiah(sumOut)),
			SaldoBersih:        formatSaldo(netSaldo),
			NumericPemasukan:   sumIn,
			NumericPengeluaran: sumOut,
			NumericSaldo:       netSaldo,
			ProfitMarginPct:    marginPct,
			TotalTransaksi:     totalTrx,
		},
		Chart:             chartPoints,
		KategoriBreakdown: kategoriBreakdown,
		Total:             totalTrx,
		Page:              page,
		Limit:             limit,
		TotalPages:        totalPages,
		Items:             items,
	}, nil
}

func formatRupiah(n int64) string {
	if n < 0 {
		n = -n
	}
	in := strconv.FormatInt(n, 10)
	var out []byte
	l := len(in)
	for i, c := range in {
		out = append(out, byte(c))
		if (l-i-1)%3 == 0 && i != l-1 {
			out = append(out, '.')
		}
	}
	if len(out) == 0 {
		return "0"
	}
	return string(out)
}

func formatSaldo(n int64) string {
	if n < 0 {
		return fmt.Sprintf("-Rp %s", formatRupiah(-n))
	}
	return fmt.Sprintf("Rp %s", formatRupiah(n))
}
