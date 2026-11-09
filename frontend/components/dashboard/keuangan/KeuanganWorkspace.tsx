"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  Wallet,
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
  getNextKodeJurnal,
  createJurnalAdmin,
  updateJurnalAdmin,
  deleteJurnalAdmin,
  listKategoriAdmin,
  listAvailableOrdersForKeuangan,
  listAvailableGajiForKeuangan,
  type JurnalKeuangan,
  type KategoriKeuangan,
  type KeuanganSummary,
  type CreateJurnalPayload,
  type UpdateJurnalPayload,
  type KeuanganAvailableOrder,
  type KeuanganAvailableGaji,
} from "@/lib/keuangan";
import type { Order } from "@/lib/orders";
import type { Gaji } from "@/lib/gaji";
import { JurnalTable } from "./JurnalTable";
import { CatatFinansialEditor } from "./CatatFinansialEditor";
import { JurnalDeleteDialog } from "./JurnalDeleteDialog";
import { KategoriManager } from "./KategoriManager";
import { LaporanKeuanganPrintModal } from "./LaporanKeuanganPrintModal";

type OpenTab = {
  id: string; // 'new' atau UUID
  title: string;
};

export function KeuanganWorkspace() {
  // Tab Navigasi Aktif: 'jurnal' | 'kategori' | id open tab
  const [activeTab, setActiveTab] = useState<string>("jurnal");
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);

  // Cache data jurnal yang sedang dibuka di tab
  const [openedNotes, setOpenedNotes] = useState<Record<string, JurnalKeuangan>>({});

  // Data List Jurnal Transaksi
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

  // Data Rujukan Opsi (Anti-Duplikasi dengan Database)
  const [categories, setCategories] = useState<KategoriKeuangan[]>([]);
  const [orders, setOrders] = useState<(Order | KeuanganAvailableOrder)[]>([]);
  const [gajiList, setGajiList] = useState<(Gaji | KeuanganAvailableGaji)[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cabangFilter, setCabangFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOption, setSortOption] = useState<"desc" | "asc" | "nominal_desc" | "nominal_asc">("desc");

  // Selection Checkbox State & Print Modal
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const allIds = data.map((d) => d.id);
    if (allIds.every((id) => selectedIds.includes(id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...allIds])));
    }
  };

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete Dialog States
  const [deletingJurnal, setDeletingJurnal] = useState<JurnalKeuangan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Memuat data referensi (Kategori, Proyek Tersedia, Gaji Tersedia)
  const loadReferenceData = useCallback(async () => {
    try {
      const [kat, ordList, gjList] = await Promise.all([
        listKategoriAdmin(),
        listAvailableOrdersForKeuangan(),
        listAvailableGajiForKeuangan(),
      ]);
      setCategories(kat);
      setOrders(ordList);
      setGajiList(gjList);
    } catch (err) {
      console.error("Gagal memuat data referensi keuangan", err);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // Memuat daftar jurnal nota
  const loadJurnal = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        let sortBy = "waktu";
        let sortDir = "desc";
        if (sortOption === "asc") {
          sortDir = "asc";
        } else if (sortOption === "nominal_desc") {
          sortBy = "saldo";
          sortDir = "desc";
        } else if (sortOption === "nominal_asc") {
          sortBy = "saldo";
          sortDir = "asc";
        }

        const res = await listJurnalAdmin({
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          cabang: cabangFilter !== "all" ? cabangFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
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
    [search, statusFilter, cabangFilter, dateFrom, dateTo, sortOption, page, pageSize]
  );

  useEffect(() => {
    loadJurnal();
  }, [loadJurnal]);

  // Buka Tab Nota Baru
  const handleOpenNewTab = async () => {
    if (!openTabs.find((t) => t.id === "new")) {
      const code = await getNextKodeJurnal();
      setOpenTabs((prev) => [...prev, { id: "new", title: `${code} (Baru)` }]);
    }
    setActiveTab("new");
  };

  // Buka Tab Nota Eksisting
  const handleOpenNote = async (item: JurnalKeuangan) => {
    try {
      // Ambil detail lengkap jika belum ada di cache
      const full = await getJurnalDetail(item.id);
      setOpenedNotes((prev) => ({ ...prev, [item.id]: full }));
      if (!openTabs.find((t) => t.id === item.id)) {
        setOpenTabs((prev) => [...prev, { id: item.id, title: full.kode_jurnal }]);
      }
      setActiveTab(item.id);
    } catch {
      toast.add({ title: "Gagal membuka nota", type: "error" });
    }
  };

  // Tutup Tab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTab === id) {
      setActiveTab("jurnal");
    }
  };

  // Simpan Nota Baru
  const handleSaveNew = async (payload: CreateJurnalPayload) => {
    const created = await createJurnalAdmin(payload);
    // Tutup tab new dan buka tab dengan id nota baru
    setOpenTabs((prev) => [
      ...prev.filter((t) => t.id !== "new"),
      { id: created.id, title: created.kode_jurnal },
    ]);
    setOpenedNotes((prev) => ({ ...prev, [created.id]: created }));
    setActiveTab(created.id);
    loadJurnal(true);
    loadReferenceData();
  };

  // Simpan Update Nota Eksisting
  const handleUpdateExisting = async (id: string, payload: UpdateJurnalPayload) => {
    const updated = await updateJurnalAdmin(id, payload);
    setOpenedNotes((prev) => ({ ...prev, [id]: updated }));
    loadJurnal(true);
    loadReferenceData();
  };

  // Konfirmasi Hapus
  const handleConfirmDelete = async () => {
    if (!deletingJurnal) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteJurnalAdmin(deletingJurnal.id);
      toast.add({
        title: "Nota Dihapus",
        description: `Nota ${deletingJurnal.kode_jurnal} berhasil dihapus.`,
        type: "success",
      });
      // Tutup tab jika sedang dibuka
      setOpenTabs((prev) => prev.filter((t) => t.id !== deletingJurnal.id));
      if (activeTab === deletingJurnal.id) {
        setActiveTab("jurnal");
      }
      setDeletingJurnal(null);
      loadJurnal(true);
      loadReferenceData();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus nota");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCabangFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortOption("desc");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    cabangFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sortOption !== "desc";

  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* 1. Header Multi-Tab Workspace */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white px-3 pt-3 rounded-t-xl">
        {/* Tab 1: Jurnal Transaksi */}
        <button
          type="button"
          onClick={() => setActiveTab("jurnal")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "jurnal"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="size-4 text-slate-500" />
          Jurnal Transaksi ({totalCount})
        </button>

        {/* Tab 2: Kategori Akun */}
        <button
          type="button"
          onClick={() => setActiveTab("kategori")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "kategori"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag className="size-4 text-slate-500" />
          Kategori Akun ({categories.length})
        </button>

        {/* Tab-Tab Nota Terbuka (Dinamis) */}
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold cursor-pointer rounded-t-lg transition ${
              activeTab === tab.id
                ? "border-slate-900 bg-slate-50 text-slate-900"
                : "border-transparent bg-slate-50/50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.title}</span>
            <button
              type="button"
              onClick={(e) => handleCloseTab(tab.id, e)}
              className="size-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 2. KONTEN TAB: JURNAL TRANSAKSI (RIWAYAT BUKU KAS) */}
      {activeTab === "jurnal" && (
        <div className="space-y-5">
          {/* Header Baris Judul & Tombol Catat Baru */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Jurnal Transaksi & Buku Kas
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Rekapitulasi mutasi kas operasional dan riwayat pembukuan kas CV Win Teknik Mandiri.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Tombol Print Tunggal */}
              <Button
                type="button"
                variant="outline"
                disabled={selectedIds.length === 0}
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs px-3.5 py-1.5 h-8 rounded-lg shadow-2xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  selectedIds.length === 0
                    ? "Centang minimal satu nota di tabel untuk mencetak laporan PDF"
                    : "Cetak laporan PDF ber-kop surat resmi"
                }
              >
                <Printer className="size-3.5 text-slate-600" />
                Cetak PDF {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
              </Button>

              <Button
                type="button"
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 h-8 rounded-lg shadow-xs transition"
              >
                <Plus className="size-3.5" />
                Catat Transaksi
              </Button>
            </div>
          </div>

          {/* 3 KARTU SUMMARY ARUS KAS TOTAL */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            {/* Total Pemasukan */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowDownRight className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  Total Pemasukan
                </p>
                <p className="text-lg font-bold text-emerald-600 tabular-nums truncate">
                  {summary.total_pemasukan}
                </p>
              </div>
            </div>

            {/* Total Pengeluaran */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
              <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <ArrowUpRight className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  Total Pengeluaran
                </p>
                <p className="text-lg font-bold text-rose-600 tabular-nums truncate">
                  {summary.total_pengeluaran}
                </p>
              </div>
            </div>

            {/* Saldo Bersih */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
              <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Wallet className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  Saldo Bersih Kas
                </p>
                <p className="text-lg font-bold text-slate-900 tabular-nums truncate">
                  {summary.sisa_saldo_kas}
                </p>
              </div>
            </div>
          </div>

          {/* Shell Tabel Jurnal Transaksi */}
          <DataTableShell>
            {/* Toolbar Filter */}
            <div className="border-b border-slate-200/80 bg-white p-4 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari nomor nota (JRN-...), judul transaksi, atau catatan..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 text-xs font-medium"
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

              {/* Baris Filter Bawah: Status, Tanggal Dari & Sampai, Urutan Sort */}
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Filter Status */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Status Nota:
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => {
                      setStatusFilter(val || "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs font-medium">
                      <span>
                        {statusFilter === "all"
                          ? "Semua Status"
                          : statusFilter === "lunas"
                          ? "🟢 Lunas"
                          : "🟡 Draft"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="lunas">🟢 Lunas</SelectItem>
                        <SelectItem value="draft">🟡 Draft (Sementara)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dari Tanggal */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
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

                {/* Sampai Tanggal */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Sampai Tanggal:
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs"
                  />
                </div>

                {/* Urutan Sort */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Urutan:
                  </label>
                  <Select
                    value={sortOption}
                    onValueChange={(val) => {
                      setSortOption((val as "desc" | "asc" | "nominal_desc" | "nominal_asc") || "desc");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs font-medium">
                      <span>
                        {sortOption === "desc"
                          ? "Terbaru (WIB)"
                          : sortOption === "asc"
                          ? "Terlama"
                          : sortOption === "nominal_desc"
                          ? "Saldo Tertinggi"
                          : "Saldo Terendah"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="desc">Terbaru (WIB)</SelectItem>
                        <SelectItem value="asc">Terlama</SelectItem>
                        <SelectItem value="nominal_desc">Saldo Tertinggi</SelectItem>
                        <SelectItem value="nominal_asc">Saldo Terendah</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tabel Transaksi dengan Checkbox Pilihan Cetak */}
            <JurnalTable
              data={data}
              loading={loading}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onOpenNote={handleOpenNote}
              onDelete={(item) => setDeletingJurnal(item)}
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
        </div>
      )}

      {/* 3. KONTEN TAB: KATEGORI AKUN */}
      {activeTab === "kategori" && (
        <KategoriManager onCategoriesChanged={loadReferenceData} />
      )}

      {/* 4. KONTEN TAB BARU: + CATAT BARU */}
      {activeTab === "new" && (
        <CatatFinansialEditor
          jurnal={null}
          categories={categories}
          orders={orders}
          gajiList={gajiList}
          onBackToHistory={() => setActiveTab("jurnal")}
          onSave={handleSaveNew}
        />
      )}

      {/* 5. KONTEN TAB NOTA EKSISTING (JRN-XXXX) */}
      {activeTab !== "jurnal" && activeTab !== "kategori" && activeTab !== "new" && openedNotes[activeTab] && (
        <CatatFinansialEditor
          jurnal={openedNotes[activeTab]}
          categories={categories}
          orders={orders}
          gajiList={gajiList}
          onBackToHistory={() => setActiveTab("jurnal")}
          onSave={handleSaveNew}
          onUpdate={handleUpdateExisting}
        />
      )}

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

      {/* Modal Pratinjau & Cetak Laporan PDF Ber-Kop Surat Resmi WTM */}
      <LaporanKeuanganPrintModal
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        selectedNotes={data.filter((d) => selectedIds.includes(d.id))}
      />
    </div>
  );
}
export default KeuanganWorkspace;
