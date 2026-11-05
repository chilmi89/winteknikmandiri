"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  createInquiry,
  deleteInquiry,
  inquiryStatusMeta,
  inquiryStatusOrder,
  listInquiries,
  updateInquiry,
  type Inquiry,
  type InquiryPayload,
  type InquiryStatus,
} from "@/lib/dashboard/inquiries";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import InquiryDeleteDialog from "./InquiryDeleteDialog";
import InquiryDialog from "./InquiryDialog";
import InquiriesTable from "./InquiriesTable";

type DialogState = { inquiry: Inquiry | null } | null;
type StatusFilter = "all" | InquiryStatus;

export function InquiriesManager() {
  const [data, setData] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<Inquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listInquiries();
      setData(result);
    } catch (loadError) {
      setData([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat permohonan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    return data
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }
        if (!query) return true;

        return (
          item.name.toLowerCase().includes(query) ||
          item.service.toLowerCase().includes(query) ||
          item.phone.toLowerCase().includes(query) ||
          item.address.toLowerCase().includes(query) ||
          item.notes.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [data, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = filteredData.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = Math.min(safePage * pageSize, filteredData.length);
  const paginatedData = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  const statusItems = [
    { label: "Semua status", value: "all" },
    ...inquiryStatusOrder.map((status) => ({
      label: inquiryStatusMeta[status].label,
      value: status,
    })),
  ];

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }

  async function handleSubmit(payload: InquiryPayload) {
    if (dialog?.inquiry) {
      const updated = await updateInquiry(dialog.inquiry.id, payload);
      setData((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.add({
        title: "Permohonan berhasil diperbarui",
        description: "Perubahan data sudah tersimpan.",
        type: "success",
      });
    } else {
      const created = await createInquiry(payload);
      setData((previous) => [created, ...previous]);
      toast.add({
        title: "Permohonan berhasil ditambahkan",
        description: "Data baru masuk ke daftar permohonan.",
        type: "success",
      });
    }

    setDialog(null);
    setPage(1);
  }

  async function handleStatusChange(
    inquiry: Inquiry,
    nextStatus: InquiryStatus
  ) {
    if (inquiry.status === nextStatus) return;

    setUpdatingStatusId(inquiry.id);
    try {
      const updated = await updateInquiry(inquiry.id, {
        name: inquiry.name,
        phone: inquiry.phone,
        service: inquiry.service,
        address: inquiry.address,
        notes: inquiry.notes,
        status: nextStatus,
      });

      setData((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.add({
        title: "Status diperbarui",
        description: `${inquiry.name} sekarang berstatus ${inquiryStatusMeta[nextStatus].label}.`,
        type: "success",
      });
    } catch (statusError) {
      toast.add({
        title: "Gagal memperbarui status",
        description:
          statusError instanceof Error
            ? statusError.message
            : "Silakan coba lagi.",
        type: "error",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteInquiry(toDelete.id);
      setData((previous) => previous.filter((item) => item.id !== toDelete.id));
      toast.add({
        title: "Permohonan berhasil dihapus",
        description: "Data permohonan sudah dihapus dari daftar.",
        type: "success",
      });
      setToDelete(null);
    } catch (deleteFailure) {
      const message =
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "Gagal menghapus permohonan. Silakan coba lagi.";
      setDeleteError(message);
      toast.add({
        title: "Gagal menghapus permohonan",
        description: message,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Permohonan Masuk
            </h1>
            <span className="text-xs text-slate-400">{data.length} data</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola dan tindak lanjuti permintaan service, pengadaan, dan
            instalasi AC dari pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Muat ulang data permohonan"
            className="h-9 rounded-md border-slate-200 bg-white text-xs font-medium text-slate-600"
          >
            <RefreshCw
              aria-hidden="true"
              className={loading ? "animate-spin" : undefined}
            />
            <span className="hidden sm:inline">Muat ulang</span>
          </Button>
          <Button
            type="button"
            onClick={() => setDialog({ inquiry: null })}
            className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-4 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
          >
            <Plus aria-hidden="true" />
            Tambah
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Gagal memuat permohonan</p>
              <p className="mt-0.5 text-xs leading-relaxed text-rose-600">
                {error}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            className="h-8 self-start rounded-md border-rose-200 bg-white text-xs font-medium text-rose-700 hover:bg-rose-50 sm:self-auto"
          >
            Coba lagi
          </Button>
        </div>
      ) : (
        <DataTableShell>
          <DataTableToolbar>
            <DataTableToolbarGroup className="flex-1">
              <div className="relative flex-1 sm:max-w-md">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari pelanggan, layanan, alamat…"
                  aria-label="Cari permohonan"
                  className="h-9 rounded-md border-slate-200 bg-white pr-10 pl-9 text-xs text-slate-700 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    aria-label="Hapus kata kunci pencarian"
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                )}
              </div>

              <Select
                items={statusItems}
                value={statusFilter}
                onValueChange={(value) => {
                  if (!value) return;
                  setStatusFilter(value as StatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter status permohonan"
                  className="h-9 w-full rounded-md border-slate-200 bg-white text-xs text-slate-600 sm:w-[160px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </DataTableToolbarGroup>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-slate-500 transition-colors hover:text-slate-800"
                >
                  Reset
                </button>
              )}
              {loading && data.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Spinner className="size-3" />
                  Memuat…
                </span>
              )}
            </div>
          </DataTableToolbar>

          <InquiriesTable
            items={paginatedData}
            loading={loading}
            updatingStatusId={updatingStatusId}
            onEdit={(inquiry) => setDialog({ inquiry })}
            onDelete={(inquiry) => {
              setDeleteError(null);
              setToDelete(inquiry);
            }}
            onStatusChange={handleStatusChange}
            onCreate={() => setDialog({ inquiry: null })}
            onResetFilters={resetFilters}
            hasFilters={hasFilters}
          />

          <DataTablePagination
            page={safePage}
            pageCount={totalPages}
            pageStart={pageStart}
            pageEnd={pageEnd}
            total={filteredData.length}
            pageSize={pageSize}
            loading={loading}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </DataTableShell>
      )}

      {dialog !== null && (
        <InquiryDialog
          key={dialog.inquiry?.id ?? "baru"}
          inquiry={dialog.inquiry}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
        />
      )}

      {toDelete !== null && (
        <InquiryDeleteDialog
          inquiry={toDelete}
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            setToDelete(null);
            setDeleteError(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default InquiriesManager;
