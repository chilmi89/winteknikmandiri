"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import {
  listJurnalAdmin,
  getJurnalDetail,
  createJurnalAdmin,
  updateJurnalAdmin,
  deleteJurnalAdmin,
  listKategoriAdmin,
  type JurnalKeuangan,
  type KategoriKeuangan,
  type KeuanganSummary,
  type CreateJurnalPayload,
  type UpdateJurnalPayload,
} from "@/lib/keuangan";
import { listOrdersAdmin, type Order } from "@/lib/orders";
import { listGajiAdmin, type Gaji } from "@/lib/gaji";
import { JurnalTable } from "./JurnalTable";
import { JurnalDialog } from "./JurnalDialog";
import { JurnalDeleteDialog } from "./JurnalDeleteDialog";
import { KategoriManager } from "./KategoriManager";

export function KeuanganWorkspace() {
  // Navigation Tabs: 'jurnal' vs 'kategori'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"jurnal" | "kategori">("jurnal");

  // Data Jurnal
  const [data, setData] = useState<JurnalKeuangan[]>([]);
  const [summary, setSummary] = useState<KeuanganSummary>({
    total_pemasukan: "Rp 0",
    total_pengeluaran: "Rp 0",
    sisa_saldo_kas: "Rp 0",
    numeric_pemasukan: 0,
    numeric_pengeluaran: 0,
    numeric_saldo: 0,
    total_transaksi: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Master Options
  const [categories, setCategories] = useState<KategoriKeuangan[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [gajiList, setGajiList] = useState<Gaji[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [pembayaranFilter, setPembayaranFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOption, setSortOption] = useState<"desc" | "asc" | "nominal_desc" | "nominal_asc">("desc");

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState<JurnalKeuangan | null>(null);

  // Delete Dialog States
  const [deletingJurnal, setDeletingJurnal] = useState<JurnalKeuangan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load Categories & Reference Data
  const loadReferenceData = useCallback(async () => {
    try {
      const [kat, ordList, gjRes] = await Promise.all([
        listKategoriAdmin(),
        listOrdersAdmin("", "", ""),
        listGajiAdmin({ limit: 100 }),
      ]);
      setCategories(kat);
      setOrders(ordList);
      setGajiList(gjRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data referensi keuangan", err);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // Load Jurnal Data
  const loadJurnal = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        let sortBy = "tanggal";
        let sortDir = "desc";
        if (sortOption === "asc") {
          sortDir = "asc";
        } else if (sortOption === "nominal_desc") {
          sortBy = "nominal";
          sortDir = "desc";
        } else if (sortOption === "nominal_asc") {
          sortBy = "nominal";
          sortDir = "asc";
        }

        const res = await listJurnalAdmin({
          search: search.trim() || undefined,
          tipe: tipeFilter !== "all" ? tipeFilter : undefined,
          kategori_id: kategoriFilter !== "all" ? kategoriFilter : undefined,
          order_id: orderFilter !== "all" ? orderFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          pembayaran: pembayaranFilter !== "all" ? pembayaranFilter : undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
          page,
          limit: pageSize,
        });

        setData(res.data || []);
        setSummary(res.summary);
        setTotalCount(res.total || 0);
        setTotalPages(res.total_pages || 1);
      } catch (err) {
        toast.add({
          title: "Gagal memuat jurnal",
          description: err instanceof Error ? err.message : "",
          type: "error",
        });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      search,
      tipeFilter,
      kategoriFilter,
      orderFilter,
      dateFrom,
      dateTo,
      pembayaranFilter,
      sortOption,
      page,
      pageSize,
    ]
  );

  useEffect(() => {
    loadJurnal();
  }, [loadJurnal]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setTipeFilter("all");
    setKategoriFilter("all");
    setPembayaranFilter("all");
    setOrderFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortOption("desc");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    tipeFilter !== "all" ||
    kategoriFilter !== "all" ||
    pembayaranFilter !== "all" ||
    orderFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sortOption !== "desc";

  // Create Handler
  const handleCreateJurnal = async (payload: CreateJurnalPayload) => {
    await createJurnalAdmin(payload);
    loadJurnal(true);
  };

  // Update Handler
  const handleUpdateJurnal = async (id: string, payload: UpdateJurnalPayload) => {
    await updateJurnalAdmin(id, payload);
    loadJurnal(true);
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingJurnal) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteJurnalAdmin(deletingJurnal.id);
      toast.add({
        title: "Transaksi Dihapus",
        description: `Transaksi ${deletingJurnal.kode_jurnal} berhasil dihapus.`,
        type: "success",
      });
      setDeletingJurnal(null);
      loadJurnal(true);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus jurnal");
    } finally {
      setIsDeleting(false);
    }
  };

  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Keuangan & Arus Kas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Buku kas keuangan, ringkasan saldo kas, dan pencatatan terintegrasi dengan invoice proyek & slip gaji.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingJurnal(null);
            setDialogOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="size-4" />
          Buat Jurnal Baru
        </Button>
      </div>

      {/* 3 KARTU SUMMARY ARUS KAS (REAL-TIME TOTAL) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Pemasukan */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowDownRight className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pemasukan (In)
            </p>
            <p className="text-xl font-bold text-emerald-600 truncate">
              {summary.total_pemasukan}
            </p>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <ArrowUpRight className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pengeluaran (Out)
            </p>
            <p className="text-xl font-bold text-rose-600 truncate">
              {summary.total_pengeluaran}
            </p>
          </div>
        </div>

        {/* Sisa Saldo Kas / Net */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div
            className={`flex size-11 items-center justify-center rounded-lg ${
              summary.numeric_saldo >= 0
                ? "bg-blue-50 text-[#2279cf]"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            <Wallet className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Saldo Kas Bersih
            </p>
            <p
              className={`text-xl font-bold truncate ${
                summary.numeric_saldo >= 0 ? "text-slate-900" : "text-rose-600"
              }`}
            >
              {summary.sisa_saldo_kas}
            </p>
          </div>
        </div>
      </div>

      {/* Navigasi Multi-Tab Workspace */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveWorkspaceTab("jurnal")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeWorkspaceTab === "jurnal"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="size-4" />
          Buku Kas & Jurnal ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveWorkspaceTab("kategori")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeWorkspaceTab === "kategori"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag className="size-4" />
          Kategori Keuangan ({categories.length})
        </button>
      </div>

      {/* TAB 1: BUKU KAS & JURNAL KEUANGAN */}
      {activeWorkspaceTab === "jurnal" && (
        <DataTableShell>
          {/* Toolbar Filter */}
          <div className="border-b border-slate-200/80 bg-white p-4">
            <div className="flex flex-col gap-3">
              {/* Baris Atas: Search & Tombol Reset/Segarkan */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari kode jurnal, uraian transaksi, atau catatan..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <RotateCcw className="size-3.5" />
                      Reset Filter
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadJurnal()}
                    className="gap-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                    Segarkan
                  </Button>
                </div>
              </div>

              {/* Baris Bawah: Filter Tanggal, Tipe, Kategori, Metode, Proyek, Sort */}
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
                {/* 1. Filter Tipe */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Tipe Arus Kas:
                  </label>
                  <Select
                    value={tipeFilter}
                    onValueChange={(val) => {
                      setTipeFilter(val || "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <span>
                        {tipeFilter === "all"
                          ? "Semua Tipe"
                          : tipeFilter === "pemasukan"
                          ? "🟢 Pemasukan"
                          : "🔴 Pengeluaran"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="pemasukan">🟢 Pemasukan</SelectItem>
                        <SelectItem value="pengeluaran">🔴 Pengeluaran</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Filter Kategori */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Kategori Akun:
                  </label>
                  <Select
                    value={kategoriFilter}
                    onValueChange={(val) => {
                      setKategoriFilter(val || "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <span className="truncate">
                        {kategoriFilter === "all"
                          ? "Semua Kategori"
                          : categories.find((c) => c.id === kategoriFilter)?.nama_kategori || "Kategori"}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectGroup>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nama_kategori} ({c.tipe})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Filter Pembayaran */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Pembayaran:
                  </label>
                  <Select
                    value={pembayaranFilter}
                    onValueChange={(val) => {
                      setPembayaranFilter(val || "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <span>
                        {pembayaranFilter === "all"
                          ? "Semua Metode"
                          : pembayaranFilter === "transfer"
                          ? "Transfer"
                          : pembayaranFilter === "cash"
                          ? "Tunai"
                          : "Kasbon"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Semua Metode</SelectItem>
                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                        <SelectItem value="cash">Cash / Tunai</SelectItem>
                        <SelectItem value="kasbon">Kasbon</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Filter Proyek */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Filter Proyek:
                  </label>
                  <Select
                    value={orderFilter}
                    onValueChange={(val) => {
                      setOrderFilter(val || "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <span className="truncate">
                        {orderFilter === "all"
                          ? "Semua Proyek"
                          : orders.find((o) => o.id === orderFilter)?.invoice_no || "Proyek"}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      <SelectGroup>
                        <SelectItem value="all">Semua Proyek</SelectItem>
                        {orders.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.invoice_no} · {o.initial_service}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 5. Filter Tanggal Mulai */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Dari Tanggal:
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs"
                  />
                </div>

                {/* 6. Urutan Sort */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Urutan (Sort):
                  </label>
                  <Select
                    value={sortOption}
                    onValueChange={(val) => {
                      setSortOption(
                        (val as "desc" | "asc" | "nominal_desc" | "nominal_asc") || "desc"
                      );
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <span>
                        {sortOption === "desc"
                          ? "Tanggal Terbaru"
                          : sortOption === "asc"
                          ? "Tanggal Terlama"
                          : sortOption === "nominal_desc"
                          ? "Nominal Tertinggi"
                          : "Nominal Terendah"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="desc">Tanggal Terbaru</SelectItem>
                        <SelectItem value="asc">Tanggal Terlama</SelectItem>
                        <SelectItem value="nominal_desc">Nominal Tertinggi</SelectItem>
                        <SelectItem value="nominal_asc">Nominal Terendah</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Transaksi Kas */}
          <JurnalTable
            data={data}
            loading={loading}
            onEdit={async (item) => {
              try {
                const full = await getJurnalDetail(item.id);
                setEditingJurnal(full);
              } catch {
                setEditingJurnal(item);
              }
              setDialogOpen(true);
            }}
            onDelete={(item) => {
              setDeletingJurnal(item);
            }}
          />

          {/* Pagination */}
          <DataTablePagination
            page={page}
            pageCount={totalPages}
            pageStart={pageStart}
            pageEnd={pageEnd}
            total={totalCount}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            loading={loading}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </DataTableShell>
      )}

      {/* TAB 2: MASTER KATEGORI KEUANGAN */}
      {activeWorkspaceTab === "kategori" && (
        <KategoriManager onCategoriesChanged={loadReferenceData} />
      )}

      {/* Modal Dialog Buat / Edit Jurnal */}
      <JurnalDialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) setEditingJurnal(null);
        }}
        jurnal={editingJurnal}
        categories={categories}
        orders={orders}
        gajiList={gajiList}
        onSubmitCreate={handleCreateJurnal}
        onSubmitUpdate={handleUpdateJurnal}
      />

      {/* Modal Dialog Konfirmasi Hapus */}
      <JurnalDeleteDialog
        jurnal={deletingJurnal}
        open={Boolean(deletingJurnal)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeletingJurnal(null);
        }}
        onConfirm={handleConfirmDelete}
        busy={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
export default KeuanganWorkspace;
