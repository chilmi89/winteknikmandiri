"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Edit2,
  Eye,
  Plus,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";
import {
  listCompanyStatsAdmin,
  createCompanyStat,
  updateCompanyStat,
  toggleCompanyStat,
  deleteCompanyStat,
  type CompanyStatItem,
  type CreateCompanyStatPayload,
  type UpdateCompanyStatPayload,
} from "@/lib/companyStats";
import { CompanyStatDialog } from "./CompanyStatDialog";
import { CompanyStatDeleteDialog } from "./CompanyStatDeleteDialog";

export function CompanyStatsManager() {
  const [data, setData] = useState<CompanyStatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CompanyStatItem | null>(null);

  // Delete Dialog State
  const [deletingItem, setDeletingItem] = useState<CompanyStatItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const items = await listCompanyStatsAdmin();
      setData(items);
    } catch {
      toast.add({ title: "Gagal memuat data statistik", type: "error" });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload: CreateCompanyStatPayload) => {
    await createCompanyStat(payload);
    toast.add({ title: "Statistik Ditambahkan", type: "success" });
    loadData(true);
  };

  const handleUpdate = async (id: string, payload: UpdateCompanyStatPayload) => {
    await updateCompanyStat(id, payload);
    toast.add({ title: "Statistik Diperbarui", type: "success" });
    loadData(true);
  };

  const handleToggle = async (item: CompanyStatItem) => {
    try {
      await toggleCompanyStat(item.id);
      toast.add({
        title: "Status Diperbarui",
        description: `Statistik ${item.label} sekarang ${!item.is_active ? "Aktif" : "Nonaktif"}.`,
        type: "success",
      });
      loadData(true);
    } catch {
      toast.add({ title: "Gagal mengubah status", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteCompanyStat(deletingItem.id);
      toast.add({ title: "Statistik Dihapus", type: "success" });
      setDeletingItem(null);
      loadData(true);
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

  const activeStats = data.filter((d) => d.is_active);

  return (
    <div className="space-y-6">
      {/* 1. Header Pengelola */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Statistik Pencapaian Perusahaan
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola angka kredibilitas dan rekam jejak yang tampil dinamis di halaman Beranda, Tentang Kami, dan Galeri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>

          <Button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setDialogOpen(true);
            }}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Plus className="size-4" />
            Tambah Statistik
          </Button>
        </div>
      </div>

      {/* 2. Pratinjau Tampilan Live di Web Publik (Sesuai Gambar Referensi) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-[#2279cf]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Pratinjau Tampilan di Web Publik (Beranda, Tentang Kami, Galeri)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {activeStats.length} Kartu Aktif Tampil
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border border-slate-100 rounded-xl bg-white overflow-hidden py-4">
          {activeStats.map((stat, idx) => (
            <div key={stat.id} className="flex flex-col items-center justify-center p-4 text-center">
              <div className="flex items-center font-black tracking-tight text-3xl sm:text-4xl text-[#0A2540] font-sans">
                <span>{stat.value.replace("+", "")}</span>
                {stat.has_plus && <span className="text-[#A82020] ml-0.5">+</span>}
              </div>
              <span className="mt-2 text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tabel Manajemen Data Statistik */}
      <DataTableShell>
        <div className="border-b border-slate-200/80 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900">
            Daftar Kartu Statistik ({data.length} Total)
          </h3>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-16 text-center text-xs font-bold text-slate-700">Urutan</TableHead>
                <TableHead className="min-w-[180px] text-xs font-bold text-slate-700">Label Statistik</TableHead>
                <TableHead className="w-28 text-center text-xs font-bold text-slate-700">Nilai Display</TableHead>
                <TableHead className="w-28 text-center text-xs font-bold text-slate-700">Target Hitung</TableHead>
                <TableHead className="min-w-[260px] text-xs font-bold text-slate-700">Keterangan / Deskripsi</TableHead>
                <TableHead className="w-24 text-center text-xs font-bold text-slate-700">Status</TableHead>
                <TableHead className="w-28 text-right text-xs font-bold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      <span className="text-xs">Memuat data statistik...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-400 text-xs">
                    Belum ada data statistik pencapaian.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    {/* Urutan */}
                    <TableCell className="text-center font-bold text-slate-500 text-xs">
                      #{item.sort_order}
                    </TableCell>

                    {/* Label */}
                    <TableCell className="text-sm font-bold text-slate-900">
                      {item.label}
                    </TableCell>

                    {/* Nilai Display */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-xs text-slate-900">
                        {item.value}
                      </span>
                    </TableCell>

                    {/* Target Hitung */}
                    <TableCell className="text-center font-mono text-xs font-semibold text-slate-600">
                      {item.target_number}
                    </TableCell>

                    {/* Keterangan */}
                    <TableCell className="text-xs text-slate-500 line-clamp-2 max-w-sm">
                      {item.keterangan || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        className="inline-flex items-center gap-1 focus:outline-none"
                        title="Klik untuk mengubah status aktif"
                      >
                        {item.is_active ? (
                          <StatusBadge tone="success">Aktif</StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">Nonaktif</StatusBadge>
                        )}
                      </button>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setDialogOpen(true);
                          }}
                          className="size-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingItem(item)}
                          className="size-8 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>

      {/* Modal Dialog Form (Create / Edit) */}
      <CompanyStatDialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) setEditingItem(null);
        }}
        stat={editingItem}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />

      {/* Modal Dialog Konfirmasi Hapus */}
      <CompanyStatDeleteDialog
        item={deletingItem}
        open={Boolean(deletingItem)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeletingItem(null);
        }}
        onConfirm={handleDelete}
        busy={isDeleting}
      />
    </div>
  );
}
export default CompanyStatsManager;
