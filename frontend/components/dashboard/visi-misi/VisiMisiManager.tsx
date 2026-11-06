"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Compass,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Target,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  createMisi,
  deleteMisi,
  fetchVisiMisi,
  updateMisi,
  updateVisiSetting,
  type MisiItem,
  type MisiPayload,
  type VisiSetting,
  defaultVisiSetting,
} from "@/lib/visiMisi";
import MisiDialog from "./MisiDialog";
import MisiDeleteDialog from "./MisiDeleteDialog";

type DialogState = { item: MisiItem | null } | null;

export function VisiMisiManager() {
  const [visi, setVisi] = useState<VisiSetting>(defaultVisiSetting);
  const [visiEyebrow, setVisiEyebrow] = useState(defaultVisiSetting.visi_eyebrow);
  const [visiText, setVisiText] = useState(defaultVisiSetting.visi_text);
  const [savingVisi, setSavingVisi] = useState(false);

  const [items, setItems] = useState<MisiItem[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<MisiItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bundle = await fetchVisiMisi(includeInactive);
      if (bundle) {
        setVisi(bundle.visi);
        setVisiEyebrow(bundle.visi.visi_eyebrow || "Visi Perusahaan");
        setVisiText(bundle.visi.visi_text || "");
        setItems(bundle.misi || []);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat data visi dan misi. Periksa koneksi lalu coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredMisi = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.tagline.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q)
    );
  }, [items, search]);

  async function handleSaveVisi(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = visiText.trim();
    if (trimmed.length < 5) {
      toast.add({
        title: "Visi terlalu pendek",
        description: "Teks visi minimal 5 karakter.",
        type: "error",
      });
      return;
    }

    setSavingVisi(true);
    try {
      const updated = await updateVisiSetting(trimmed, visiEyebrow.trim() || "Visi Perusahaan");
      setVisi(updated);
      toast.add({
        title: "Visi diperbarui",
        description: "Kutipan visi perusahaan berhasil disimpan.",
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Gagal menyimpan visi",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSavingVisi(false);
    }
  }

  async function handleCreateMisi(payload: MisiPayload) {
    const created = await createMisi(payload);
    setItems((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
    toast.add({
      title: "Misi ditambahkan",
      description: `Butir misi ${created.title} berhasil disimpan.`,
      type: "success",
    });
  }

  async function handleUpdateMisi(id: string, payload: MisiPayload) {
    const updated = await updateMisi(id, payload);
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? updated : it))
        .sort((a, b) => a.sort_order - b.sort_order)
    );
    toast.add({
      title: "Perubahan disimpan",
      description: `Data misi ${updated.title} berhasil diperbarui.`,
      type: "success",
    });
  }

  async function handleDeleteMisi() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMisi(toDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== toDelete.id));
      toast.add({
        title: "Misi dihapus",
        description: `Butir misi ${toDelete.title} telah dihapus.`,
        type: "success",
      });
      setToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus misi.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(it: MisiItem) {
    const nextState = !it.is_active;
    try {
      const updated = await updateMisi(it.id, { is_active: nextState });
      setItems((prev) => prev.map((x) => (x.id === it.id ? updated : x)));
      toast.add({
        title: nextState ? "Misi diaktifkan" : "Misi dinonaktifkan",
        description: `Status ${it.title} berhasil diubah.`,
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

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Visi & Misi Perusahaan
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
            <Compass className="size-3" />
            Halaman Tentang Kami
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Kelola kutipan visi utama perusahaan dan kartu butir-butir misi yang tampil di website publik.
        </p>
      </div>

      {/* Bagian 1: Editor Teks Visi Perusahaan */}
      <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[#A82020]/10 text-[#A82020]">
              <Compass className="size-3.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Visi Perusahaan
              </h2>
              <p className="text-xs text-slate-500">
                Kutipan besar yang menjadi fondasi dan arah komitmen teknis
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveVisi} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label
                htmlFor="visi-eyebrow"
                className="text-[12px] font-semibold text-slate-700 block mb-1"
              >
                Label Eyebrow
              </label>
              <Input
                id="visi-eyebrow"
                value={visiEyebrow}
                onChange={(e) => setVisiEyebrow(e.target.value)}
                placeholder="Visi Perusahaan"
                className="h-9.5 text-xs rounded-lg border-slate-300"
                disabled={savingVisi}
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="visi-text"
                className="text-[12px] font-semibold text-slate-700 block mb-1"
              >
                Kutipan Teks Visi
              </label>
              <Textarea
                id="visi-text"
                rows={2}
                value={visiText}
                onChange={(e) => setVisiText(e.target.value)}
                placeholder="Menghadirkan layanan tata udara..."
                className="text-xs rounded-lg border-slate-300"
                disabled={savingVisi}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={savingVisi}
              className="gap-2 bg-[#A82020] text-xs font-semibold text-white hover:bg-[#8e1919]"
            >
              {savingVisi ? (
                <>
                  <Spinner className="size-3.5 text-white" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Simpan Teks Visi</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Bagian 2: Kartu Butir Misi Perusahaan */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[#2279cf]/10 text-[#2279cf]">
              <Target className="size-3.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Butir-Butir Misi ({items.length} Kartu)
              </h2>
              <p className="text-xs text-slate-500">
                Prosedur pengerjaan teknis yang ditampilkan dalam format kartu 2x2
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setDialog({ item: null })}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-[#2279cf] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1b64ad] sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Tambah Misi</span>
          </Button>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau tagline misi..."
              className="h-8.5 pl-9 pr-8 text-xs"
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
            <p className="text-xs text-slate-500">Memuat data visi dan misi...</p>
          </div>
        ) : filteredMisi.length === 0 ? (
          /* State: Empty */
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
            <Target className="size-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {search ? "Tidak ada hasil pencarian" : "Belum ada butir misi"}
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {search
                ? "Coba kata kunci pencarian yang lain."
                : "Klik tombol Tambah Misi untuk menambahkan kartu misi perusahaan."}
            </p>
          </div>
        ) : (
          /* State: Grid of Cards (Persis gaya screenshot) */
          <div className="grid gap-5 sm:grid-cols-2">
            {filteredMisi.map((m) => (
              <div
                key={m.id}
                className={`group relative flex flex-col justify-between rounded-xl border bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md ${
                  m.is_active
                    ? "border-slate-200/90 hover:border-slate-300"
                    : "border-slate-200 bg-slate-50/50 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold text-[#A82020]">
                      {m.code || "01"}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      {m.tagline || "STANDAR CV WTM"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                    {m.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {m.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => void handleToggleActive(m)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                        m.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          m.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      {m.is_active ? "Aktif" : "Nonaktif"}
                    </span>

                    <span className="font-mono text-[10px] text-slate-400">
                      Urutan: {m.sort_order}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDialog({ item: m })}
                      className="inline-flex size-7.5 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      title="Edit misi"
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setToDelete(m)}
                      className="inline-flex size-7.5 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Hapus misi"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Tambah / Edit Misi */}
      {dialog ? (
        <MisiDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={async (payload) => {
            if (dialog.item) {
              await handleUpdateMisi(dialog.item.id, payload);
            } else {
              await handleCreateMisi(payload);
            }
          }}
        />
      ) : null}

      {/* Modal Dialog Konfirmasi Hapus Misi */}
      {toDelete ? (
        <MisiDeleteDialog
          item={toDelete}
          busy={deleting}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={() => void handleDeleteMisi()}
        />
      ) : null}
    </div>
  );
}
export default VisiMisiManager;
