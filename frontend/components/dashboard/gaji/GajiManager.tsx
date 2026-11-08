"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
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
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import {
  listGajiAdmin,
  createGaji,
  updateGaji,
  attachProyekGaji,
  updateProyekNominal,
  deleteProyekFromGaji,
  deleteGaji,
  type Gaji,
  type CreateGajiPayload,
  type UpdateGajiPayload,
} from "@/lib/gaji";
import {
  listTeamMembersAdmin,
  type TeamMemberItem,
} from "@/lib/teamMembers";
import { listOrdersAdmin, type Order } from "@/lib/orders";
import { GajiTable } from "./GajiTable";
import { GajiDialog } from "./GajiDialog";
import { GajiDeleteDialog } from "./GajiDeleteDialog";

export function GajiManager() {
  const [data, setData] = useState<Gaji[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Data rujukan untuk dropdown relasi
  const [teamList, setTeamList] = useState<TeamMemberItem[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);

  // Filter state
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all"); // Filter Proyek
  const [dateFilter, setDateFilter] = useState(""); // Filter Tanggal (YYYY-MM-DD)
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingGaji, setEditingGaji] = useState<Gaji | null>(null);

  // Delete dialog state
  const [deletingGaji, setDeletingGaji] = useState<Gaji | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load team members and orders for relation options
  useEffect(() => {
    async function loadRelations() {
      try {
        const [teams, orders] = await Promise.all([
          listTeamMembersAdmin(false),
          listOrdersAdmin("", "", ""),
        ]);
        setTeamList(teams);
        setOrderList(orders);
      } catch (err) {
        console.error("Gagal memuat opsi relasi tim/proyek", err);
      }
    }
    loadRelations();
  }, []);

  // Load gaji data from backend
  const loadGajiData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await listGajiAdmin({
          team_id: teamFilter !== "all" ? teamFilter : undefined,
          order_id: orderFilter !== "all" ? orderFilter : undefined,
          date: dateFilter || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search.trim() || undefined,
          page,
          limit: pageSize,
        });
        setData(res.data || []);
        setTotalCount(res.total || 0);
        setTotalPages(res.total_pages || 1);
      } catch (err) {
        toast.add({
          title: "Gagal memuat slip gaji",
          description: err instanceof Error ? err.message : "Periksa server",
          type: "error",
        });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [teamFilter, orderFilter, dateFilter, statusFilter, search, page, pageSize]
  );

  useEffect(() => {
    loadGajiData();
  }, [loadGajiData]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setTeamFilter("all");
    setOrderFilter("all");
    setDateFilter("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    teamFilter !== "all" ||
    orderFilter !== "all" ||
    dateFilter !== "" ||
    statusFilter !== "all";

  // Create handler
  const handleCreateGaji = async (payload: CreateGajiPayload) => {
    await createGaji(payload);
    toast.add({
      title: "Slip Gaji Dibuat",
      description: "Slip gaji tim baru berhasil diterbitkan.",
      type: "success",
    });
    loadGajiData(true);
  };

  // Update handler
  const handleUpdateGaji = async (
    id: string,
    header: UpdateGajiPayload,
    proyekList: {
      id?: string;
      order_id: string;
      nominal: string;
      keterangan: string;
    }[],
    deletedProyekIds: string[]
  ) => {
    // 1. Update header
    await updateGaji(id, header);

    // 2. Hapus proyek yang ditandai delete
    for (const dId of deletedProyekIds) {
      await deleteProyekFromGaji(dId);
    }

    // 3. Update atau tambahkan proyek baru
    for (const p of proyekList) {
      if (p.id) {
        await updateProyekNominal(p.id, p.nominal, p.keterangan);
      } else if (p.order_id) {
        await attachProyekGaji(id, {
          order_id: p.order_id,
          nominal: p.nominal,
          keterangan: p.keterangan,
        });
      }
    }

    toast.add({
      title: "Slip Gaji Diperbarui",
      description: "Perubahan rincian proyek & upah berhasil disimpan.",
      type: "success",
    });
    loadGajiData(true);
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingGaji) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteGaji(deletingGaji.id);
      toast.add({
        title: "Slip Gaji Dihapus",
        description: `Slip ${deletingGaji.kode_gaji} berhasil dihapus.`,
        type: "success",
      });
      setDeletingGaji(null);
      loadGajiData(true);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Gagal menghapus slip gaji"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Hitung metric ringkasan
  const summaryMetrics = useMemo(() => {
    let dibayarCount = 0;
    let draftCount = 0;
    for (const g of data) {
      if (g.status === "dibayar") dibayarCount++;
      else draftCount++;
    }
    return { dibayarCount, draftCount };
  }, [data]);

  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Penggajian Tim Teknisi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola upah borongan proyek untuk tim teknisi berdasarkan order invoice deal.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingGaji(null);
            setShowDialog(true);
          }}
          className="inline-flex items-center gap-2 bg-[#2279cf] px-4 py-2 font-medium text-white shadow-sm transition hover:bg-[#1b62a6]"
        >
          <Plus className="size-4" />
          Buat Slip Gaji
        </Button>
      </div>

      {/* Ringkasan Singkat Kartu */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-[#2279cf]">
            <Banknote className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Slip Terbit</p>
            <p className="text-xl font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Gaji Dibayar (Lunas)</p>
            <p className="text-xl font-bold text-emerald-600">
              {summaryMetrics.dibayarCount}{" "}
              <span className="text-xs font-normal text-slate-400">slip</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Gaji Draft (Proses)</p>
            <p className="text-xl font-bold text-amber-600">
              {summaryMetrics.draftCount}{" "}
              <span className="text-xs font-normal text-slate-400">slip</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar Area */}
      <DataTableShell>
        <div className="border-b border-slate-200/80 bg-white p-4">
          <div className="flex flex-col gap-3">
            {/* Baris Filter Atas: Search & Tombol Reset */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari kode gaji, nama tim, atau catatan..."
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
                  onClick={() => loadGajiData()}
                  className="gap-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                  Segarkan
                </Button>
              </div>
            </div>

            {/* Baris Filter Bawah: Filter by Proyek, Tanggal, Tim, Status */}
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. Filter by Proyek */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Filter by Proyek:
                </label>
                <Select
                  value={orderFilter}
                  onValueChange={(val) => {
                    setOrderFilter(val || "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Semua Proyek" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectGroup>
                      <SelectItem value="all">Semua Proyek</SelectItem>
                      {orderList.map((ord) => (
                        <SelectItem key={ord.id} value={ord.id}>
                          {ord.invoice_no} · {ord.initial_service || "Layanan"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Filter by Tanggal */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Filter by Tanggal:
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs"
                  />
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFilter("");
                        setPage(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Filter by Tim Teknisi */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Filter by Tim:
                </label>
                <Select
                  value={teamFilter}
                  onValueChange={(val) => {
                    setTeamFilter(val || "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Semua Tim" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Semua Tim</SelectItem>
                      {teamList.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Filter by Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Filter by Status:
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val || "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="draft">🟡 Draft (Belum Bayar)</SelectItem>
                      <SelectItem value="dibayar">🟢 Dibayar (Lunas)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Data Gaji */}
        <GajiTable
          data={data}
          loading={loading}
          onEdit={(item) => {
            setEditingGaji(item);
            setShowDialog(true);
          }}
          onDelete={(item) => {
            setDeletingGaji(item);
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
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </DataTableShell>

      {/* Modal Buat / Edit Slip Gaji */}
      <GajiDialog
        open={showDialog}
        onOpenChange={(isOpen) => {
          setShowDialog(isOpen);
          if (!isOpen) setEditingGaji(null);
        }}
        gaji={editingGaji}
        teamList={teamList}
        orderList={orderList}
        onSubmitCreate={handleCreateGaji}
        onSubmitUpdate={handleUpdateGaji}
      />

      {/* Modal Konfirmasi Hapus */}
      <GajiDeleteDialog
        gaji={deletingGaji}
        open={Boolean(deletingGaji)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeletingGaji(null);
        }}
        onConfirm={handleConfirmDelete}
        busy={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
export default GajiManager;
