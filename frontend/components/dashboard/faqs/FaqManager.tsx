"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
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
  createFaq,
  deleteFaq,
  FAQ_CATEGORIES,
  listFaqs,
  updateFaq,
  type Faq,
  type FaqPayload,
} from "@/lib/dashboard/faqs";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import FaqDeleteDialog from "./FaqDeleteDialog";
import FaqDialog from "./FaqDialog";
import FaqTable from "./FaqTable";

type DialogState = { faq: Faq | null } | null;

const ALL_CATEGORIES = "__all__";

export function FaqManager() {
  const [items, setItems] = useState<Faq[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [applied, setApplied] = useState({ search: "", category: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestSeq = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce pencarian & kategori agar tidak memanggil data setiap ketikan.
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();
      const nextCategory = category.trim();
      setApplied((previous) =>
        previous.search === nextSearch && previous.category === nextCategory
          ? previous
          : { search: nextSearch, category: nextCategory }
      );
      setOffset(0);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category]);

  // Shortcut Ctrl/Cmd + K untuk fokus ke pencarian.
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

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listFaqs({
        search: applied.search,
        category: applied.category,
        include_inactive: includeInactive,
        limit,
        offset,
      });

      if (seq !== requestSeq.current) return;

      setItems(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total ?? 0);
    } catch (loadError) {
      if (seq !== requestSeq.current) return;
      setItems([]);
      setTotal(0);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data FAQ. Periksa koneksi lalu coba lagi."
      );
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [applied, includeInactive, limit, offset]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const handleSubmit = useCallback(
    async (payload: FaqPayload) => {
      if (dialog?.faq) {
        await updateFaq(dialog.faq.id, payload);
        toast.add({
          title: "FAQ berhasil diperbarui",
          description: "Perubahan sudah tersimpan dan siap tampil di publik.",
          type: "success",
        });
      } else {
        await createFaq(payload);
        toast.add({
          title: "FAQ berhasil ditambahkan",
          description: "Pertanyaan baru sudah masuk ke daftar FAQ.",
          type: "success",
        });
      }

      setDialog(null);
      await load();
    },
    [dialog, load]
  );

  async function handleConfirmDelete() {
    if (!toDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteFaq(toDelete.id);
      toast.add({
        title: "FAQ berhasil dihapus",
        description: "FAQ tidak lagi tampil di halaman publik.",
        type: "success",
      });
      setToDelete(null);
      await load();
    } catch (deleteFailure) {
      const message =
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "Gagal menghapus FAQ. Silakan coba lagi.";
      setDeleteError(message);
      toast.add({ title: "Gagal menghapus FAQ", description: message, type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  const categoryOptions = useMemo(() => {
    const values = new Set<string>(FAQ_CATEGORIES);
    items.forEach((item) => {
      if (item.category) values.add(item.category);
    });
    if (category) values.add(category);
    if (applied.category) values.add(applied.category);

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [items, category, applied.category]);

  const categoryItems = [
    { label: "Semua kategori", value: ALL_CATEGORIES },
    ...categoryOptions.map((value) => ({ label: value, value })),
  ];

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const page = Math.floor(offset / limit) + 1;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + limit, total);

  const hasFilters =
    applied.search !== "" || applied.category !== "" || includeInactive;

  function resetFilters() {
    setSearch("");
    setCategory("");
    setIncludeInactive(false);
    setApplied({ search: "", category: "" });
    setOffset(0);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              FAQ Publik
            </h1>
            <span className="text-xs text-slate-400">{total} data</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pertanyaan yang tampil di bagian FAQ halaman publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Muat ulang data FAQ"
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
            onClick={() => setDialog({ faq: null })}
            className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-4 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
          >
            <Plus aria-hidden="true" />
            Tambah FAQ
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Gagal memuat FAQ</p>
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari pertanyaan atau jawaban…"
                  aria-label="Cari FAQ"
                  className="h-9 rounded-md border-slate-200 bg-white pr-12 pl-9 text-xs text-slate-700 placeholder:text-slate-400"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Hapus kata kunci pencarian"
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 sm:block">
                    Ctrl K
                  </kbd>
                )}
              </div>

              <Select
                items={categoryItems}
                value={category || ALL_CATEGORIES}
                onValueChange={(value) => {
                  setCategory(value === ALL_CATEGORIES ? "" : (value ?? ""));
                }}
              >
                <SelectTrigger
                  aria-label="Filter kategori"
                  className="h-9 w-full rounded-md border-slate-200 bg-white text-xs text-slate-600 sm:w-[176px]"
                >
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    {categoryItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <label className="flex h-9 cursor-pointer items-center gap-2 px-1 text-xs font-medium text-slate-600">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(checked) => {
                    setIncludeInactive(checked);
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

          <FaqTable
            items={items}
            loading={loading}
            onEdit={(faq) => setDialog({ faq })}
            onDelete={(faq) => {
              setDeleteError(null);
              setToDelete(faq);
            }}
            onCreate={() => setDialog({ faq: null })}
            onResetFilters={resetFilters}
            hasFilters={hasFilters}
          />

          <DataTablePagination
            page={page}
            pageCount={pageCount}
            pageStart={pageStart}
            pageEnd={pageEnd}
            total={total}
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

      {dialog !== null && (
        <FaqDialog
          key={dialog.faq?.id ?? "baru"}
          faq={dialog.faq}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
        />
      )}

      {toDelete !== null && (
        <FaqDeleteDialog
          faq={toDelete}
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

export default FaqManager;
