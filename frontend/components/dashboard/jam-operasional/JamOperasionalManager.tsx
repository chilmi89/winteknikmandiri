"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Search, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  createJamOperasional,
  deleteJamOperasional,
  listJamOperasionalAdmin,
  updateJamOperasional,
  updateJamOperasionalSetting,
  type JamOperasionalItem,
  type JamOperasionalPayload,
  type JamOperasionalSetting,
  type JamOperasionalSettingPayload,
  defaultJamOperasionalSetting,
} from "@/lib/jamOperasional";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import JamOperasionalDeleteDialog from "./JamOperasionalDeleteDialog";
import JamOperasionalDialog from "./JamOperasionalDialog";
import JamOperasionalSettingCard from "./JamOperasionalSettingCard";
import JamOperasionalTable from "./JamOperasionalTable";

type DialogState = { item: JamOperasionalItem | null } | null;

export function JamOperasionalManager() {
  const [items, setItems] = useState<JamOperasionalItem[]>([]);
  const [setting, setSetting] = useState<JamOperasionalSetting>(defaultJamOperasionalSetting);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<JamOperasionalItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bundle = await listJamOperasionalAdmin(includeInactive);
      if (bundle) {
        setItems(bundle.items || []);
        if (bundle.setting) {
          setSetting(bundle.setting);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memuat jadwal operasional. Periksa koneksi lalu coba lagi.";
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
        it.day_label.toLowerCase().includes(q) ||
        it.hours.toLowerCase().includes(q)
    );
  }, [items, search]);

  async function handleSaveItem(payload: JamOperasionalPayload) {
    if (!dialog) return;

    if (dialog.item) {
      const updated = await updateJamOperasional(dialog.item.id, payload);
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it))
      );
      toast.add({
        title: "Jadwal berhasil diperbarui",
        description: `Jadwal "${updated.day_label}" telah disimpan.`,
        type: "success",
      });
    } else {
      const created = await createJamOperasional(payload);
      setItems((prev) => [...prev, created]);
      toast.add({
        title: "Jadwal berhasil ditambahkan",
        description: `Jadwal "${created.day_label}" telah masuk ke daftar.`,
        type: "success",
      });
    }
  }

  async function handleDeleteConfirm() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteJamOperasional(toDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== toDelete.id));
      toast.add({
        title: "Jadwal berhasil dihapus",
        description: "Jadwal tidak lagi tampil di halaman publik.",
        type: "success",
      });
      setToDelete(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menghapus jadwal. Silakan coba lagi.";
      setDeleteError(message);
      toast.add({
        title: "Gagal menghapus jadwal",
        description: message,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveSetting(payload: JamOperasionalSettingPayload) {
    try {
      const updated = await updateJamOperasionalSetting(payload);
      setSetting(updated);
      toast.add({
        title: "Pengaturan berhasil disimpan",
        description: "Teks header & catatan kaki telah diperbarui.",
        type: "success",
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui pengaturan.";
      toast.add({
        title: "Gagal menyimpan",
        description: message,
        type: "error",
      });
    }
  }

  const hasFilters = Boolean(search.trim()) || includeInactive;

  function resetFilters() {
    setSearch("");
    setIncludeInactive(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Jam Operasional Publik
            </h1>
            <span className="text-xs text-slate-400">{items.length} jadwal</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola jadwal kerja resmi yang tampil di halaman Kontak &amp; Footer situs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Muat ulang jadwal"
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
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Banner Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Gagal memuat jadwal</p>
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
      )}

      {/* Tabel Baris Jadwal */}
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari hari atau jam kerja…"
                aria-label="Cari jadwal"
                className="h-9 rounded-md border-slate-200 bg-white pr-12 pl-9 text-xs text-slate-700 placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              )}
            </div>

            <label className="flex h-9 cursor-pointer items-center gap-2 px-1 text-xs font-medium text-slate-600">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(checked) => setIncludeInactive(Boolean(checked))}
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

        <JamOperasionalTable
          items={filteredItems}
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

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>
            Menampilkan {filteredItems.length} dari {items.length} jadwal
          </span>
        </div>
      </DataTableShell>

      {/* Kartu Setting Judul, Badge & Catatan Kaki */}
      <JamOperasionalSettingCard
        setting={setting}
        onSave={handleSaveSetting}
      />

      {/* Modal Dialog Tambah / Edit */}
      {dialog && (
        <JamOperasionalDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSaveItem}
        />
      )}

      {/* Modal Dialog Hapus */}
      {toDelete && (
        <JamOperasionalDeleteDialog
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

export default JamOperasionalManager;
