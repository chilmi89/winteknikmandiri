"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Search, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  createGalleryProject,
  deleteGalleryProject,
  listGalleryAdmin,
  updateGalleryProject,
  type GalleryProject,
  type GalleryPayload,
  type CategoryCountItem,
} from "@/lib/galleryService";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import GalleryDeleteDialog from "./GalleryDeleteDialog";
import GalleryDialog from "./GalleryDialog";
import GalleryTable from "./GalleryTable";

type DialogState = { item: GalleryProject | null } | null;

const ALL_CATEGORIES = "__all__";

export function GalleryManager() {
  const [items, setItems] = useState<GalleryProject[]>([]);
  const [categories, setCategories] = useState<CategoryCountItem[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<GalleryProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listGalleryAdmin(selectedCategory, includeInactive);
      if (data) {
        setItems(data.items || []);
        setCategories(data.categories || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memuat galeri proyek. Periksa koneksi lalu coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, includeInactive]);

  useEffect(() => {
    void load();
  }, [load]);

  // Shortcut Ctrl/Cmd + K
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
        it.client.toLowerCase().includes(q) ||
        it.location.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.scope.toLowerCase().includes(q)
    );
  }, [items, search]);

  const existingCategoryList = useMemo(() => {
    return categories.map((c) => c.category);
  }, [categories]);

  async function handleSave(payload: GalleryPayload) {
    if (!dialog) return;

    if (dialog.item) {
      const updated = await updateGalleryProject(dialog.item.id, payload);
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it))
      );
      toast.add({
        title: "Proyek galeri berhasil diperbarui",
        description: `Perubahan "${updated.title}" telah disimpan.`,
        type: "success",
      });
    } else {
      const created = await createGalleryProject(payload);
      setItems((prev) => [created, ...prev]);
      toast.add({
        title: "Proyek galeri berhasil ditambahkan",
        description: `Proyek "${created.title}" telah masuk ke daftar.`,
        type: "success",
      });
    }
    void load();
  }

  async function handleDeleteConfirm() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteGalleryProject(toDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== toDelete.id));
      toast.add({
        title: "Proyek galeri berhasil dihapus",
        description: "Dokumentasi telah dihapus dari halaman publik.",
        type: "success",
      });
      setToDelete(null);
      void load();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menghapus proyek. Silakan coba lagi.";
      setDeleteError(message);
      toast.add({
        title: "Gagal menghapus proyek",
        description: message,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Boolean(search.trim()) || Boolean(selectedCategory) || includeInactive;

  function resetFilters() {
    setSearch("");
    setSelectedCategory("");
    setIncludeInactive(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header Halaman (Persis FAQ, Pilar, Tim) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Galeri Proyek Publik
            </h1>
            <span className="text-xs text-slate-400">{items.length} proyek</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola foto dokumentasi pengerjaan lapangan dan kategori dinamis untuk halaman Galeri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Muat ulang data galeri"
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
            Tambah Proyek
          </Button>
        </div>
      </div>

      {/* Banner Error jika Fetch Gagal */}
      {error && (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Gagal memuat galeri proyek</p>
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

      {/* Tabel & Toolbar */}
      <DataTableShell>
        <DataTableToolbar>
          <DataTableToolbarGroup className="flex-1 flex-wrap gap-2.5">
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
                placeholder="Cari judul, klien, atau lokasi…"
                aria-label="Cari proyek"
                className="h-9 rounded-md border-slate-200 bg-white pr-12 pl-9 text-xs text-slate-700 placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdown Kategori Dinamis */}
            <Select
              value={selectedCategory || ALL_CATEGORIES}
              onValueChange={(val) => {
                setSelectedCategory(val === ALL_CATEGORIES ? "" : (val ?? ""));
              }}
            >
              <SelectTrigger
                aria-label="Filter kategori proyek"
                className="h-9 w-full rounded-md border-slate-200 bg-white text-xs text-slate-600 sm:w-[200px]"
              >
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value={ALL_CATEGORIES}>
                    Semua kategori ({total})
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.category} value={c.category}>
                      {c.category} ({c.count})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

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

        <GalleryTable
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
            Menampilkan {filteredItems.length} dari {items.length} proyek
          </span>
        </div>
      </DataTableShell>

      {/* Dialog Form Tambah / Edit */}
      {dialog && (
        <GalleryDialog
          item={dialog.item}
          existingCategories={existingCategoryList}
          onClose={() => setDialog(null)}
          onSubmit={handleSave}
        />
      )}

      {/* Dialog Konfirmasi Hapus */}
      {toDelete && (
        <GalleryDeleteDialog
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

export default GalleryManager;
