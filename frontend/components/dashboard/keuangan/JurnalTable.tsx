"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Edit2,
  FileText,
  Receipt,
  Trash2,
  Wallet,
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
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";
import { formatDate } from "@/lib/dashboard/format";
import type { JurnalKeuangan } from "@/lib/keuangan";

type JurnalTableProps = {
  data: JurnalKeuangan[];
  loading: boolean;
  onEdit: (item: JurnalKeuangan) => void;
  onDelete: (item: JurnalKeuangan) => void;
};

export function JurnalTable({
  data,
  loading,
  onEdit,
  onDelete,
}: JurnalTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-[120px] text-xs font-semibold text-slate-700">
              Tanggal
            </TableHead>
            <TableHead className="w-[130px] text-xs font-semibold text-slate-700">
              Kode Jurnal
            </TableHead>
            <TableHead className="min-w-[260px] text-xs font-semibold text-slate-700">
              Uraian & Kategori
            </TableHead>
            <TableHead className="w-[130px] text-xs font-semibold text-slate-700">
              Arus Kas
            </TableHead>
            <TableHead className="w-[120px] text-xs font-semibold text-slate-700">
              Metode
            </TableHead>
            <TableHead className="min-w-[140px] text-xs font-semibold text-slate-700">
              Nominal (Rp)
            </TableHead>
            <TableHead className="w-[110px] text-xs font-semibold text-slate-700">
              Status
            </TableHead>
            <TableHead className="w-[90px] text-right text-xs font-semibold text-slate-700">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-48 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  <span className="text-xs">Memuat data jurnal kas...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-48 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Receipt className="size-9 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    Belum ada transaksi jurnal pada filter ini
                  </p>
                  <p className="text-xs text-slate-400">
                    Sesuaikan filter atau klik tombol <strong>+ Buat Jurnal</strong> untuk mencatat kas.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const isIncome = item.tipe === "pemasukan";
              return (
                <TableRow
                  key={item.id}
                  className="group border-b border-slate-100 transition-colors hover:bg-slate-50/80"
                >
                  {/* Tanggal */}
                  <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(item.tanggal)}
                  </TableCell>

                  {/* Kode Jurnal */}
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
                      {item.kode_jurnal}
                    </span>
                  </TableCell>

                  {/* Uraian & Kategori */}
                  <TableCell>
                    <div className="flex flex-col py-0.5">
                      <span className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.judul}
                      </span>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[11px] font-medium text-slate-700">
                          {item.nama_kategori || "Umum"}
                        </span>

                        {item.sumber === "proyek" && item.invoice_no && (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-semibold text-blue-700 border border-blue-200">
                            Proyek: {item.invoice_no}
                          </span>
                        )}

                        {item.sumber === "gaji" && item.kode_gaji && (
                          <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.2 text-[10px] font-semibold text-purple-700 border border-purple-200">
                            Gaji: {item.kode_gaji}
                          </span>
                        )}

                        {item.catatan && (
                          <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]">
                            — {item.catatan}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Arus Kas */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="size-3.5" />
                      ) : (
                        <ArrowUpRight className="size-3.5" />
                      )}
                      {isIncome ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </TableCell>

                  {/* Metode Pembayaran */}
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700 capitalize">
                      {item.metode_pembayaran === "transfer"
                        ? "Transfer"
                        : item.metode_pembayaran === "cash"
                        ? "Tunai"
                        : "Kasbon"}
                    </span>
                  </TableCell>

                  {/* Nominal */}
                  <TableCell>
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? `+ ${item.nominal}` : `- ${item.nominal}`}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {item.status === "lunas" ? (
                      <StatusBadge tone="success">Lunas</StatusBadge>
                    ) : (
                      <StatusBadge tone="warning">Pending</StatusBadge>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        title="Edit Jurnal"
                        className="size-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        title="Hapus Jurnal"
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
