"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Search, TriangleAlert, X, FolderPlus } from "lucide-react";
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
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  listCategoriesAdmin,
  listItemsAdmin,
  updateCategory,
  updateItem,
  type ServiceCategory,
  type ServiceCategoryPayload,
  type ServiceItem,
  type ServiceItemPayload,
} from "@/lib/katalogLayanan";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import ServiceCategoryDialog from "./ServiceCategoryDialog";
import ServiceItemDialog from "./ServiceItemDialog";
import ServiceItemTable from "./ServiceItemTable";
import ServiceCategoryTable from "./ServiceCategoryTable";
import ServiceItemDeleteDialog from "./ServiceItemDeleteDialog";

const ALL_CATEGORIES = "__all__";

export function KatalogManager() {
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [itemDialog, setItemDialog] = useState<{ item: ServiceItem | null } | null>(null);
  const [catDialog, setCatDialog] = useState<{ cat: ServiceCategory | null } | null>(null);
  const [toDeleteItem, setToDeleteItem] = useState<ServiceItem | null>(null);
  const [toDeleteCat, setToDeleteCat] = useState<ServiceCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, itms] = await Promise.all([
        listCategoriesAdmin(includeInactive),
        listItemsAdmin(selectedCategory, includeInactive),
      ]);
      setCategories(cats);
      setItems(itms);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat katalog layanan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, includeInactive]);

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
        (it.category_name && it.category_name.toLowerCase().includes(q))
    );
  }, [items, search]);

  // Handle Item Save
  async function handleSaveItem(payload: ServiceItemPayload) {
    if (!itemDialog) return;
    if (itemDialog.item) {
      const updated = await updateItem(itemDialog.item.id, payload);
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      toast.add({
        title: "Layanan berhasil diperbarui",
        description: `Perubahan "${updated.title}" telah disimpan.`,
        type: "success",
      });
    } else {
      const created = await createItem(payload);
      setItems((prev) => [created, ...prev]);
      toast.add({
        title: "Layanan berhasil ditambahkan",
        description: `Layanan "${created.title}" telah masuk ke katalog.`,
        type: "success",
      });
    }
    void load();
  }

  // Handle Item Delete
  async function handleDeleteItemConfirm() {
    if (!toDeleteItem) return;
    setDeleting(true);
    try {
      await deleteItem(toDeleteItem.id);
      setItems((prev) => prev.filter((it) => it.id !== toDeleteItem.id));
      toast.add({
        title: "Layanan berhasil dihapus",
        description: "Layanan tidak lagi tampil di halaman publik.",
        type: "success",
      });
      setToDeleteItem(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus layanan.";
      toast.add({ title: "Gagal menghapus", description: msg, type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  // Handle Category Save
  async function handleSaveCategory(payload: ServiceCategoryPayload) {
    if (!catDialog) return;
    if (catDialog.cat) {
      const updated = await updateCategory(catDialog.cat.id, payload);
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.add({
        title: "Kategori berhasil diperbarui",
        description: `Kategori "${updated.name}" telah disimpan.`,
        type: "success",
      });
    } else {
      const created = await createCategory(payload);
      setCategories((prev) => [...prev, created]);
      toast.add({
        title: "Kategori berhasil ditambahkan",
        description: `Kategori "${created.name}" telah dibuat.`,
        type: "success",
      });
    }
    void load();
  }

  // Handle Category Delete
  async function handleDeleteCatConfirm(cat: ServiceCategory) {
    if (!confirm(`Hapus kategori "${cat.name}"? Semua layanan di bawah kategori ini juga akan ikut terhapus.`)) return;
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.add({
        title: "Kategori berhasil dihapus",
        description: "Kategori dan seluruh layanannya telah dihapus.",
        type: "success",
      });
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus kategori.";
      toast.add({ title: "Gagal menghapus", description: msg, type: "error" });
    }
  }

  const hasFilters = Boolean(search.trim()) || Boolean(selectedCategory) || includeInactive;

  return (
    <div className="flex flex-col gap-5">
      {/* Header Halaman (Persis Galeri, FAQ, Tim) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Katalog Layanan Publik
            </h1>
            <span className="text-xs text-slate-400">
              {items.length} layanan · {categories.length} kategori
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Single Source of Truth: Kelola kategori dan kartu layanan untuk halaman /layanan, Produk Beranda, dan Tabel Tarif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Muat ulang katalog"
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
            variant="outline"
            size="sm"
            onClick={() => setCatDialog({ cat: null })}
            className="h-9 gap-1.5 border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FolderPlus aria-hidden="true" className="size-4" />
            + Kategori
          </Button>

          <Button
            type="button"
            onClick={() => setItemDialog({ item: null })}
            className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-4 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
          >
            <Plus aria-hidden="true" className="size-4" />
            Tambah Layanan
          </Button>
        </div>
      </div>

      {/* Tab Switcher: Item Layanan vs Kategori */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("items")}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "items"
              ? "border-[#A82020] text-[#A82020]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Daftar Layanan ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-[#A82020] text-[#A82020]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Kategori Layanan ({categories.length})
        </button>
      </div>

      {/* Banner Error jika Fetch Gagal */}
      {error && (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Gagal memuat katalog</p>
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

      {/* VIEW 1: TABEL ITEM LAYANAN */}
      {activeTab === "items" && (
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau deskripsi layanan…"
                  className="h-9 rounded-md border-slate-200 bg-white pr-12 pl-9 text-xs text-slate-700 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-700"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Kategori */}
              <Select
                value={selectedCategory || ALL_CATEGORIES}
                onValueChange={(val) => setSelectedCategory(val === ALL_CATEGORIES ? "" : (val ?? ""))}
              >
                <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white text-xs text-slate-600 sm:w-[200px]">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value={ALL_CATEGORIES}>
                      Semua kategori
                    </SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} · {c.name}
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
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setIncludeInactive(false);
                  }}
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

          <ServiceItemTable
            items={filteredItems}
            loading={loading}
            onEdit={(it) => setItemDialog({ item: it })}
            onDelete={(it) => setToDeleteItem(it)}
            onCreate={() => setItemDialog({ item: null })}
            onResetFilters={() => {
              setSearch("");
              setSelectedCategory("");
              setIncludeInactive(false);
            }}
            hasFilters={hasFilters}
          />

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>
              Menampilkan {filteredItems.length} dari {items.length} layanan
            </span>
          </div>
        </DataTableShell>
      )}

      {/* VIEW 2: TABEL KATEGORI LAYANAN */}
      {activeTab === "categories" && (
        <ServiceCategoryTable
          items={categories}
          loading={loading}
          onEdit={(cat) => setCatDialog({ cat })}
          onDelete={handleDeleteCatConfirm}
          onCreate={() => setCatDialog({ cat: null })}
        />
      )}

      {/* Modal Item Layanan Dialog */}
      {itemDialog && (
        <ServiceItemDialog
          item={itemDialog.item}
          categories={categories}
          onClose={() => setItemDialog(null)}
          onSubmit={handleSaveItem}
        />
      )}

      {/* Modal Kategori Layanan Dialog */}
      {catDialog && (
        <ServiceCategoryDialog
          category={catDialog.cat}
          onClose={() => setCatDialog(null)}
          onSubmit={handleSaveCategory}
        />
      )}

      {/* Modal Hapus Item Layanan */}
      {toDeleteItem && (
        <ServiceItemDeleteDialog
          item={toDeleteItem}
          busy={deleting}
          onCancel={() => setToDeleteItem(null)}
          onConfirm={handleDeleteItemConfirm}
        />
      )}
    </div>
  );
}

export default KatalogManager;
