"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  FolderPlus,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/dashboard/dialogs/FormDialog";
import { ConfirmDialog } from "@/components/dashboard/dialogs/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  listKategoriAdmin,
  createKategoriAdmin,
  updateKategoriAdmin,
  deleteKategoriAdmin,
  type KategoriKeuangan,
} from "@/lib/keuangan";

export function KategoriManager({ onCategoriesChanged }: { onCategoriesChanged?: () => void }) {
  const [categories, setCategories] = useState<KategoriKeuangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pemasukan" | "pengeluaran">("all");

  // Dialog Form (Create / Edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KategoriKeuangan | null>(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [tipe, setTipe] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [deskripsi, setDeskripsi] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete Dialog
  const [deletingItem, setDeletingItem] = useState<KategoriKeuangan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await listKategoriAdmin();
      setCategories(data);
    } catch {
      toast.add({ title: "Gagal memuat kategori", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateDialog = () => {
    setEditingItem(null);
    setNamaKategori("");
    setTipe("pemasukan");
    setDeskripsi("");
    setError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: KategoriKeuangan) => {
    setEditingItem(item);
    setNamaKategori(item.nama_kategori);
    setTipe(item.tipe);
    setDeskripsi(item.deskripsi || "");
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKategori.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (editingItem) {
        await updateKategoriAdmin(editingItem.id, {
          nama_kategori: namaKategori.trim(),
          tipe,
          deskripsi: deskripsi.trim(),
        });
        toast.add({ title: "Kategori Diperbarui", type: "success" });
      } else {
        await createKategoriAdmin({
          nama_kategori: namaKategori.trim(),
          tipe,
          deskripsi: deskripsi.trim(),
        });
        toast.add({ title: "Kategori Dibuat", type: "success" });
      }
      setDialogOpen(false);
      loadCategories();
      onCategoriesChanged?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteKategoriAdmin(deletingItem.id);
      toast.add({ title: "Kategori Dihapus", type: "success" });
      setDeletingItem(null);
      loadCategories();
      onCategoriesChanged?.();
    } catch (err: unknown) {
      toast.add({
        title: "Gagal menghapus",
        description: err instanceof Error ? err.message : "",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === "all") return true;
    return c.tipe === activeTab;
  });

  return (
    <div className="space-y-4">
      {/* Header Kategori */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Master Kategori Akun Keuangan
          </h3>
          <p className="text-xs text-slate-500">
            Kelola kategori akun untuk mengelompokkan pos pemasukan dan pengeluaran kas operasional.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Tab Tipe */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pemasukan")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                activeTab === "pemasukan" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pengeluaran")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                activeTab === "pengeluaran" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pengeluaran
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={openCreateDialog}
            className="gap-1.5 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
          >
            <Plus className="size-3.5" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Grid Kategori List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Memuat kategori akun...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Belum ada kategori akun keuangan pada filter ini.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isIncome = cat.tipe === "pemasukan";
            return (
              <div
                key={cat.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="size-3" />
                      ) : (
                        <ArrowUpRight className="size-3" />
                      )}
                      {isIncome ? "Pemasukan" : "Pengeluaran"}
                    </span>

                    {cat.is_system && (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.2">
                        Sistem
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2 text-sm font-semibold text-slate-900">
                    {cat.nama_kategori}
                  </h4>
                  {cat.deskripsi && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {cat.deskripsi}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(cat)}
                    className="size-7 p-0 text-slate-500 hover:text-slate-900"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  {!cat.is_system && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingItem(cat)}
                      className="size-7 p-0 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog Create / Edit */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? "Edit Kategori Keuangan" : "Tambah Kategori Baru"}
        description="Kelola nama pos pemasukan atau pengeluaran operasional perusahaan."
        icon={<Tag className="size-4" />}
        busy={busy}
        error={error}
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={busy}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {busy ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Buat Kategori"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tipe Kategori <span className="text-rose-500">*</span>
            </label>
            <Select
              value={tipe}
              onValueChange={(val) => setTipe((val as "pemasukan" | "pengeluaran") || "pemasukan")}
            >
              <SelectTrigger className="w-full text-xs">
                <span>
                  {tipe === "pemasukan"
                    ? "🟢 Pemasukan (Kas Masuk)"
                    : "🔴 Pengeluaran (Kas Keluar)"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="pemasukan">🟢 Pemasukan (Kas Masuk)</SelectItem>
                  <SelectItem value="pengeluaran">🔴 Pengeluaran (Kas Keluar)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Operasional Kendaraan & Bensin"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              className="text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Deskripsi Singkat (Opsional)
            </label>
            <Input
              type="text"
              placeholder="Keterangan transaksi pos ini"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="text-xs text-slate-600"
            />
          </div>
        </form>
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeletingItem(null);
        }}
        title="Hapus Kategori Akun?"
        description={
          <span>
            Apakah Anda yakin ingin menghapus kategori{" "}
            <strong className="text-slate-900">{deletingItem?.nama_kategori}</strong>?
          </span>
        }
        confirmLabel="Ya, Hapus Kategori"
        cancelLabel="Batal"
        busy={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
