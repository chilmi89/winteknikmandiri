"use client";

import {
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  MoreVertical,
  Trash2,
  Users,
  Briefcase,
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
import { formatDateTime, formatDate } from "@/lib/dashboard/format";
import type { Gaji } from "@/lib/gaji";
import { toast } from "@/components/ui/toast";

type GajiTableProps = {
  data: Gaji[];
  loading: boolean;
  onEdit: (item: Gaji) => void;
  onDelete: (item: Gaji) => void;
};

export function GajiTable({ data, loading, onEdit, onDelete }: GajiTableProps) {
  const handleCopyWhatsApp = (g: Gaji) => {
    let text = `*SLIP GAJI TIM TEKNISI - CV WIN TEKNIK MANDIRI*\n`;
    text += `No. Slip: *${g.kode_gaji}*\n`;
    text += `Tim Teknisi: *${g.team_name}* (${g.team_skill})\n`;
    text += `Status: *${g.status === "dibayar" ? "LUNAS / DIBAYAR" : "DRAFT (BELUM DIBAYAR)"}*\n`;
    text += `Tanggal Terbit: ${formatDateTime(g.created_at)} WIB\n\n`;

    text += `*Rincian Proyek Dikerjakan:*\n`;
    if (g.proyek && g.proyek.length > 0) {
      g.proyek.forEach((p, idx) => {
        text += `${idx + 1}. ${p.invoice_no} · ${p.nama_layanan}\n`;
        if (p.nama_customer) text += `   Klien: ${p.nama_customer}\n`;
        text += `   Upah Borongan: *${p.nominal}*\n`;
        if (p.keterangan) text += `   Ket: ${p.keterangan}\n`;
      });
    } else {
      text += `(Belum ada rincian proyek)\n`;
    }

    text += `------------------------------------\n`;
    text += `*TOTAL GAJI: ${g.total_gaji}*\n\n`;

    if (g.catatan) {
      text += `Catatan: ${g.catatan}\n\n`;
    }
    text += `Terima kasih atas kerja keras dan profesionalitas tim!`;

    navigator.clipboard.writeText(text);
    toast.add({
      title: "Rincian Slip Gaji Tersalin!",
      description: `Slip ${g.kode_gaji} siap dikirim ke WhatsApp tim.`,
      type: "success",
    });
  };

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-[140px] text-xs font-semibold text-slate-700">
              Kode Gaji
            </TableHead>
            <TableHead className="min-w-[180px] text-xs font-semibold text-slate-700">
              Tim Teknisi
            </TableHead>
            <TableHead className="min-w-[280px] text-xs font-semibold text-slate-700">
              Proyek Dikerjakan
            </TableHead>
            <TableHead className="min-w-[140px] text-xs font-semibold text-slate-700">
              Total Gaji
            </TableHead>
            <TableHead className="w-[120px] text-xs font-semibold text-slate-700">
              Status
            </TableHead>
            <TableHead className="min-w-[150px] text-xs font-semibold text-slate-700">
              Tanggal Dibuat
            </TableHead>
            <TableHead className="w-[120px] text-right text-xs font-semibold text-slate-700">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="size-6 animate-spin rounded-full border-2 border-[#2279cf] border-t-transparent" />
                  <span className="text-xs">Memuat data gaji tim...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Banknote className="size-9 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    Belum ada data slip gaji ditemukan
                  </p>
                  <p className="text-xs text-slate-400">
                    Coba sesuaikan filter pencarian atau buat slip gaji baru.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="group border-b border-slate-100 transition-colors hover:bg-slate-50/80"
              >
                {/* Kode Gaji */}
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                    {item.kode_gaji}
                  </span>
                </TableCell>

                {/* Tim Teknisi */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.team_name || "Tim Teknisi"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.team_skill || "Spesialis HVAC"}
                    </span>
                  </div>
                </TableCell>

                {/* Proyek Dikerjakan */}
                <TableCell>
                  {item.proyek && item.proyek.length > 0 ? (
                    <div className="flex flex-col gap-1.5 py-1">
                      {item.proyek.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1 text-xs border border-slate-200/60"
                        >
                          <div className="truncate max-w-[200px]">
                            <span className="font-semibold text-slate-700">
                              {p.invoice_no}
                            </span>
                            <span className="text-slate-500 ml-1">
                              · {p.nama_layanan}
                            </span>
                          </div>
                          <span className="font-medium text-emerald-700 shrink-0">
                            {p.nominal}
                          </span>
                        </div>
                      ))}
                      {item.proyek.length > 2 && (
                        <span className="text-[11px] font-medium text-slate-400 italic">
                          +{item.proyek.length - 2} proyek lainnya
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Belum ada proyek
                    </span>
                  )}
                </TableCell>

                {/* Total Gaji */}
                <TableCell>
                  <span className="text-sm font-bold text-emerald-600">
                    {item.total_gaji}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {item.status === "dibayar" ? (
                    <StatusBadge tone="success">Dibayar</StatusBadge>
                  ) : (
                    <StatusBadge tone="warning">Draft</StatusBadge>
                  )}
                </TableCell>

                {/* Tanggal Dibuat */}
                <TableCell>
                  <div className="flex flex-col text-xs text-slate-600">
                    <span>{formatDateTime(item.created_at)}</span>
                    <span className="text-[11px] text-slate-400">WIB</span>
                  </div>
                </TableCell>

                {/* Aksi */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyWhatsApp(item)}
                      title="Salin Rincian ke WhatsApp"
                      className="size-8 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      title="Edit Slip Gaji"
                      className="size-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item)}
                      title="Hapus Slip Gaji"
                      className="size-8 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
