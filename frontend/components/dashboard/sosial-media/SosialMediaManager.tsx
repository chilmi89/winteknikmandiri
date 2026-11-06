"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Globe,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  createSosialMedia,
  deleteSosialMedia,
  fetchSosialMediaList,
  updateSosialMedia,
  type SosialMediaItem,
  type SosialMediaPayload,
} from "@/lib/sosialMedia";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/SocialIcons";
import SosialMediaDialog from "./SosialMediaDialog";
import SosialMediaDeleteDialog from "./SosialMediaDeleteDialog";

type DialogState = { item: SosialMediaItem | null } | null;

export function SosialMediaManager() {
  const [items, setItems] = useState<SosialMediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<SosialMediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSosialMediaList(includeInactive);
      setItems(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memuat data sosial media. Periksa koneksi lalu coba lagi.";
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
        it.nama.toLowerCase().includes(q) ||
        it.link.toLowerCase().includes(q) ||
        it.icon.toLowerCase().includes(q)
    );
  }, [items, search]);

  async function handleCreate(payload: SosialMediaPayload) {
    const created = await createSosialMedia(payload);
    setItems((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
    toast.add({
      title: "Sosial media ditambahkan",
      description: `Kanal ${created.nama} berhasil disimpan ke sistem.`,
      type: "success",
    });
  }

  async function handleUpdate(id: string, payload: SosialMediaPayload) {
    const updated = await updateSosialMedia(id, payload);
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? updated : it))
        .sort((a, b) => a.sort_order - b.sort_order)
    );
    toast.add({
      title: "Perubahan disimpan",
      description: `Data kanal ${updated.nama} berhasil diperbarui.`,
      type: "success",
    });
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSosialMedia(toDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== toDelete.id));
      toast.add({
        title: "Sosial media dihapus",
        description: `Kanal ${toDelete.nama} telah dinonaktifkan.`,
        type: "success",
      });
      setToDelete(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus sosial media.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(it: SosialMediaItem) {
    const nextState = !it.is_active;
    try {
      const updated = await updateSosialMedia(it.id, { is_active: nextState });
      setItems((prev) => prev.map((x) => (x.id === it.id ? updated : x)));
      toast.add({
        title: nextState ? "Kanal diaktifkan" : "Kanal dinonaktifkan",
        description: `Status ${it.nama} berhasil diubah.`,
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Gagal mengubah status",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    }
  }

  function getPlatformIcon(iconName: string) {
    const key = iconName.toLowerCase();
    if (key.includes("instagram")) return <InstagramIcon className="size-5" />;
    if (key.includes("tiktok")) return <TikTokIcon className="size-5" />;
    if (key.includes("facebook")) return <FacebookIcon className="size-5" />;
    return <Globe className="size-5" />;
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sosial Media
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
              <Share2 className="size-3" />
              {items.length} Kanal
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola tautan WhatsApp, Instagram, Facebook, TikTok, dan kanal resmi lainnya.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setDialog({ item: null })}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[#2279cf] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1b64ad] sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Tambah Sosmed</span>
        </Button>
      </div>

      {/* Toolbar Pencarian & Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari platform atau link..."
            className="h-9 pl-9 pr-8 text-xs"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
            <Checkbox
              checked={includeInactive}
              onCheckedChange={(checked) => setIncludeInactive(Boolean(checked))}
            />
            <span>Tampilkan Nonaktif</span>
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="h-8 gap-1.5 text-xs font-semibold text-slate-700"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* State: Error */}
      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs">
          <TriangleAlert className="size-5 shrink-0 text-rose-600" />
          <p className="flex-1">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
            className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            Coba Lagi
          </Button>
        </div>
      ) : null}

      {/* State: Loading */}
      {loading ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-white p-8">
          <Spinner className="size-6 text-[#2279cf]" />
          <p className="text-xs text-slate-500">Memuat daftar sosial media...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* State: Empty */
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
          <Share2 className="size-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            {search ? "Tidak ada hasil pencarian" : "Belum ada sosial media"}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {search
              ? "Coba kata kunci pencarian yang lain."
              : "Klik tombol Tambah Sosmed untuk mendaftarkan akun media sosial resmi."}
          </p>
          {!search ? (
            <Button
              type="button"
              onClick={() => setDialog({ item: null })}
              className="mt-4 gap-2 bg-[#2279cf] text-xs font-semibold text-white hover:bg-[#1b64ad]"
            >
              <Plus className="size-3.5" />
              <span>Tambah Sekarang</span>
            </Button>
          ) : null}
        </div>
      ) : (
        /* State: Grid of Cards (Persis gaya gambar) */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((it) => {
            return (
              <div
                key={it.id}
                className={`group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md ${
                  it.is_active
                    ? "border-slate-200/90 hover:border-slate-300"
                    : "border-slate-200 bg-slate-50/50 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-800 transition-colors group-hover:border-[#2279cf]/30 group-hover:bg-[#2279cf]/5 group-hover:text-[#2279cf]">
                        {getPlatformIcon(it.icon || it.nama)}
                      </div>

                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          MEDIA SOSIAL RESMI
                        </span>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {it.nama}
                        </h3>
                      </div>
                    </div>

                    <a
                      href={it.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Buka tautan eksternal"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </div>

                  <div className="mt-3.5 border-t border-slate-100 pt-3">
                    <p className="line-clamp-1 font-mono text-[11px] text-slate-500 truncate" title={it.link}>
                      {it.link}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => void handleToggleActive(it)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                        it.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          it.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      {it.is_active ? "Aktif" : "Nonaktif"}
                    </span>

                    <span className="font-mono text-[10px] text-slate-400">
                      Urutan: {it.sort_order}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDialog({ item: it })}
                      className="inline-flex size-7.5 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      title="Edit data"
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setToDelete(it)}
                      className="inline-flex size-7.5 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog Tambah / Edit */}
      {dialog ? (
        <SosialMediaDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={async (payload) => {
            if (dialog.item) {
              await handleUpdate(dialog.item.id, payload);
            } else {
              await handleCreate(payload);
            }
          }}
        />
      ) : null}

      {/* Modal Dialog Konfirmasi Hapus */}
      {toDelete ? (
        <SosialMediaDeleteDialog
          item={toDelete}
          busy={deleting}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
export default SosialMediaManager;
