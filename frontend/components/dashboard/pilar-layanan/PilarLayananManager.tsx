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
  const [includeInactive, setIncludeInactive] = useState(true);
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

  const hasFilters = Boolean(search.trim());

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Pilar Layanan Publik
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Kelola 6 kartu pilar yang tampil di section &quot;Pilar Layanan&quot; Beranda situs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            aria-label="Muat ulang data pilar layanan"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ item: null })}
            className="bg-[#A82020] text-white hover:bg-[#8e1919]"
          >
            <Plus className="size-3.5" />
            Tambah Pilar
          </Button>
        </div>
      </div>

      {/* Banner Error jika Fetch Gagal */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-rose-900"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-600" />
          <div className="flex-1 text-xs">
            <p className="font-semibold">Gagal memuat pilar layanan</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={load}
            className="border-rose-300 text-rose-900 hover:bg-rose-100"
          >
            Coba lagi
          </Button>
        </div>
      )}

      {/* Tabel & Toolbar */}
      <DataTableShell>
        <DataTableToolbar>
          <DataTableToolbarGroup className="w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pilar layanan..."
                aria-label="Cari pilar layanan"
                className="h-9 w-full pl-9 pr-8 text-xs bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(c) => setIncludeInactive(Boolean(c))}
              />
              <span>Sertakan Non-aktif</span>
            </label>
          </DataTableToolbarGroup>
        </DataTableToolbar>

        <PilarLayananTable
          items={filteredItems}
          loading={loading}
          onEdit={(it) => setDialog({ item: it })}
          onDelete={(it) => setToDelete(it)}
          onCreate={() => setDialog({ item: null })}
          onResetFilters={() => setSearch("")}
          hasFilters={hasFilters}
        />
      </DataTableShell>

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
