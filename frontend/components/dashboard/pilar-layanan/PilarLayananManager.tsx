"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Search, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  createPilarLayanan,
  deletePilarLayanan,
  listPilarLayananAdmin,
  updatePilarLayanan,
  type PilarLayananItem,
  type PilarLayananPayload,
} from "@/lib/pilarLayanan";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import PilarLayananDeleteDialog from "./PilarLayananDeleteDialog";
import PilarLayananDialog from "./PilarLayananDialog";
import PilarLayananTable from "./PilarLayananTable";

type DialogState = { item: PilarLayananItem | null } | null;

export function PilarLayananManager() {
  const [items, setItems] = useState<PilarLayananItem[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<PilarLayananItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPilarLayananAdmin(includeInactive);
      setItems(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memuat data pilar layanan. Periksa koneksi lalu coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    void load();
  }, [load]);

  // Shortcut Ctrl/Cmd + K untuk fokus ke search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q)
    );
  }, [items, search]);

  async function handleSave(payload: PilarLayananPayload) {
    if (!dialog) return;

    if (dialog.item) {
      const updated = await updatePilarLayanan(dialog.item.id, payload);
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it))
      );
      toast.add({
        title: "Pilar layanan berhasil diperbarui",
        description: `Perubahan "${updated.title}" telah disimpan.`,
        type: "success",
      });
    } else {
      const created = await createPilarLayanan(payload);
      setItems((prev) => [...prev, created]);
      toast.add({
        title: "Pilar layanan berhasil ditambahkan",
        description: `Pilar "${created.title}" telah masuk ke daftar.`,
        type: "success",
      });
    }
  }

  async function handleDeleteConfirm() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePilarLayanan(toDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== toDelete.id));
      toast.add({
        title: "Pilar layanan berhasil dihapus",
        description: "Kartu pilar tidak lagi tampil di halaman publik.",
        type: "success",
      });
      setToDelete(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menghapus pilar layanan. Silakan coba lagi.";
      setDeleteError(message);
      toast.add({
        title: "Gagal menghapus pilar",
        description: message,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Boolean(search.trim()) || includeInactive;

  const totalCount = filteredItems.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / limit));
  const page = Math.floor(offset / limit) + 1;
  const pageStart = totalCount === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + limit, totalCount);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(offset, offset + limit);
  }, [filteredItems, offset, limit]);

  function resetFilters() {
    setSearch("");
    setIncludeInactive(false);
    setOffset(0);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header Halaman (Persis seperti FAQ) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Pilar Layanan Publik
            </h1>
            <span className="text-xs text-slate-400">{items.length} data</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola 6 kartu pilar yang tampil di section &quot;Pilar Layanan&quot; Beranda situs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Muat ulang data pilar"
            className="h-9 rounded-md border-slate-200 bg-white text-xs font-medium text-slate-600"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Muat ulang</span>
          </Button>

          <Button
            type="button"
            onClick={() => setDialog({ item: null })}
            className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-4 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
          >
            <Plus aria-hidden="true" className="size-4" />
            Tambah Pilar
          </Button>
        </div>
      </div>

      {/* Banner Error jika Fetch Gagal */}
      {error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Gagal memuat pilar layanan</p>
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
              <div className="relative flex-1 sm:max-w-sm">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400"
                />
                <Input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setOffset(0);
                  }}
                  placeholder="Cari pilar layanan…"
                  aria-label="Cari pilar layanan"
                  className="h-9 rounded-md border-slate-200 bg-white pr-12 pl-9 text-xs text-slate-700 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setOffset(0);
                    }}
                    aria-label="Hapus kata kunci pencarian"
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                )}
                {!search && (
                  <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 sm:block">
                    Ctrl K
                  </kbd>
                )}
              </div>

              <label className="flex h-9 cursor-pointer items-center gap-2 px-1 text-xs font-medium text-slate-600">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(checked) => {
                    setIncludeInactive(Boolean(checked));
                    setOffset(0);
                  }}
                />
                Tampilkan non-aktif
              </label>
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
              {loading && items.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Spinner className="size-3" />
                  Memuat…
                </span>
              )}
            </div>
          </DataTableToolbar>

          <PilarLayananTable
            items={paginatedItems}
            loading={loading}
            onEdit={(it) => setDialog({ item: it })}
            onDelete={(it) => {
              setDeleteError(null);
              setToDelete(it);
            }}
            onCreate={() => setDialog({ item: null })}
            onResetFilters={resetFilters}
            hasFilters={hasFilters}
          />

          <DataTablePagination
            page={page}
            pageCount={pageCount}
            pageStart={pageStart}
            pageEnd={pageEnd}
            total={totalCount}
            pageSize={limit}
            loading={loading}
            onPageChange={(nextPage) => setOffset((nextPage - 1) * limit)}
            onPageSizeChange={(size) => {
              setLimit(size);
              setOffset(0);
            }}
          />
        </DataTableShell>
      )}

      {/* Dialog Form Tambah / Edit */}
      {dialog && (
        <PilarLayananDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSave}
        />
      )}

      {/* Dialog Konfirmasi Hapus */}
      {toDelete && (
        <PilarLayananDeleteDialog
          item={toDelete}
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            setToDelete(null);
            setDeleteError(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default PilarLayananManager;
