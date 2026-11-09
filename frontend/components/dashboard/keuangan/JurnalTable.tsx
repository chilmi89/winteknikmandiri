"use client";

import {
  Clock,
  Edit2,
  Receipt,
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
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";
import { formatDateTime } from "@/lib/dashboard/format";
import type { JurnalKeuangan } from "@/lib/keuangan";

type JurnalTableProps = {
  data: JurnalKeuangan[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenNote: (item: JurnalKeuangan) => void;
  onDelete: (item: JurnalKeuangan) => void;
};

export function JurnalTable({
  data,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenNote,
  onDelete,
}: JurnalTableProps) {
  const allSelected = data.length > 0 && data.every((it) => selectedIds.includes(it.id));

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50">
            {/* Checkbox Pilih Semua Sebelum Tanggal & Waktu */}
            <TableHead className="w-[45px] text-center px-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Pilih semua nota"
              />
            </TableHead>
            <TableHead className="min-w-[160px] text-xs font-bold text-slate-700">
              Tanggal & Waktu (WIB)
            </TableHead>
            <TableHead className="w-[140px] text-xs font-bold text-slate-700">
              No. Nota
            </TableHead>
            <TableHead className="min-w-[260px] text-xs font-bold text-slate-700">
              Laporan & Rincian
            </TableHead>
            <TableHead className="min-w-[120px] text-right text-xs font-semibold text-slate-700">
              Pemasukan
            </TableHead>
            <TableHead className="min-w-[120px] text-right text-xs font-semibold text-slate-700">
              Pengeluaran
            </TableHead>
            <TableHead className="min-w-[130px] text-right text-xs font-semibold text-slate-700">
              Saldo Bersih
            </TableHead>
            <TableHead className="w-[110px] text-xs font-bold text-slate-700">
              Status
            </TableHead>
            <TableHead className="w-[90px] text-right text-xs font-bold text-slate-700">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  <span className="text-xs">Memuat daftar jurnal transaksi...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Receipt className="size-9 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">
                    Belum ada nota jurnal kas pada filter ini
                  </p>
                  <p className="text-xs text-slate-400">
                    Klik tombol <strong>+ Catat Transaksi Baru</strong> untuk membuka lembar kas baru.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const saldoNum = item.numeric_saldo || 0;
              const isSelected = selectedIds.includes(item.id);

              return (
                <TableRow
                  key={item.id}
                  className={`group border-b border-slate-100 transition-colors cursor-pointer ${
                    isSelected ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50/80"
                  }`}
                  onClick={() => onOpenNote(item)}
                >
                  {/* Checkbox Baris Sebelum Tanggal & Waktu */}
                  <TableCell
                    className="text-center px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(item.id)}
                      aria-label={`Pilih nota ${item.kode_jurnal}`}
                    />
                  </TableCell>

                  {/* Tanggal & Waktu WIB */}
                  <TableCell className="text-xs text-slate-700 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" />
                      <span>{formatDateTime(item.waktu_transaksi)}</span>
                      <span className="text-[10px] font-bold text-slate-400">WIB</span>
                    </div>
                  </TableCell>

                  {/* Kode Jurnal */}
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-900">
                      {item.kode_jurnal}
                    </span>
                  </TableCell>

                  {/* Laporan & Rincian */}
                  <TableCell>
                    <div className="flex flex-col py-0.5">
                      <span className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-slate-700 transition">
                        {item.judul || `Rekap Kas ${item.kode_jurnal}`}
                      </span>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="text-[11px] text-slate-400">
                          {item.items ? item.items.length : 0} transaksi
                        </span>
                        {item.catatan && (
                          <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]">
                            — {item.catatan}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Total Pemasukan */}
                  <TableCell className="text-right">
                    <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap tabular-nums">
                      {item.total_pemasukan || "Rp 0"}
                    </span>
                  </TableCell>

                  {/* Total Pengeluaran */}
                  <TableCell className="text-right">
                    <span className="text-xs font-semibold text-rose-600 whitespace-nowrap tabular-nums">
                      {item.total_pengeluaran || "Rp 0"}
                    </span>
                  </TableCell>

                  {/* Saldo Bersih */}
                  <TableCell className="text-right">
                    <span
                      className={`text-xs font-bold whitespace-nowrap tabular-nums ${
                        saldoNum >= 0 ? "text-slate-900" : "text-rose-600"
                      }`}
                    >
                      {item.saldo_bersih || "Rp 0"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {item.status === "lunas" ? (
                      <StatusBadge tone="success">Lunas</StatusBadge>
                    ) : (
                      <StatusBadge tone="warning">Draft</StatusBadge>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenNote(item)}
                        title="Buka Lembar Transaksi"
                        className="size-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        title="Hapus Nota"
                        className="size-8 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
