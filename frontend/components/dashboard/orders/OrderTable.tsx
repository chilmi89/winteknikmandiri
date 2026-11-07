"use client";

import { useState } from "react";
import { Search, X, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/lib/orders";
import { StatusBadge, type StatusTone } from "@/components/dashboard/data-table/StatusBadge";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import { formatDate } from "@/lib/dashboard/format";

type OrderTableProps = {
  items: Order[];
  loading: boolean;
  onOpenTab: (order: Order) => void;
  onDelete: (order: Order) => void;
};

const STATUS_TONES: Record<string, StatusTone> = {
  menunggu_chat: "neutral",
  belum_diproses: "neutral",
  negosiasi: "warning",
  deal: "success",
  dikerjakan: "info",
  selesai: "success",
  batal: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  menunggu_chat: "Menunggu Chat WA",
  belum_diproses: "Menunggu Chat WA",
  negosiasi: "Negosiasi",
  deal: "Deal",
  dikerjakan: "Dikerjakan",
  selesai: "Selesai",
  batal: "Dibatalkan",
};

export function OrderTable({ items, loading, onOpenTab, onDelete }: OrderTableProps) {
  if (loading && items.length === 0) {
    return <DataTableSkeleton columns={7} rows={6} />;
  }

  if (!loading && items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold text-slate-800">Belum ada pesanan masuk</p>
        <p className="text-xs text-slate-500 mt-1">
          Setiap kali pelanggan klik tombol Pesan di web, nomor invoice otomatis terbuat di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-slate-50 border-slate-200">
            <TableHead className="h-10 w-[16%] px-4 text-xs font-medium text-slate-500">
              No. Invoice
            </TableHead>
            <TableHead className="h-10 w-[24%] px-4 text-xs font-medium text-slate-500">
              Layanan Awal (Web)
            </TableHead>
            <TableHead className="h-10 w-[18%] px-4 text-xs font-medium text-slate-500">
              Pelanggan
            </TableHead>
            <TableHead className="h-10 w-[14%] px-4 text-xs font-medium text-slate-500">
              Total Fiks
            </TableHead>
            <TableHead className="h-10 w-[14%] px-4 text-xs font-medium text-slate-500">
              Status
            </TableHead>
            <TableHead className="h-10 w-[14%] px-4 text-right text-xs font-medium text-slate-500">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((order) => {
            const tone = STATUS_TONES[order.status] || "neutral";
            const label = STATUS_LABELS[order.status] || order.status;

            return (
              <TableRow
                key={order.id}
                className="border-slate-100 transition-colors hover:bg-slate-50/70"
              >
                {/* No. Invoice */}
                <TableCell className="w-[16%] px-4 py-3.5 align-middle">
                  <button
                    type="button"
                    onClick={() => onOpenTab(order)}
                    className="font-mono text-xs font-bold text-[#A82020] hover:underline"
                  >
                    {order.invoice_no}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {formatDate(order.created_at)}
                  </p>
                </TableCell>

                {/* Layanan Awal */}
                <TableCell className="w-[24%] px-4 py-3.5 align-middle whitespace-normal">
                  <p className="text-[13px] font-semibold text-slate-800 line-clamp-1">
                    {order.initial_service}
                  </p>
                  <span className="text-[11px] text-slate-500 line-clamp-1">
                    {order.initial_category || "Umum"} · {order.initial_price}
                  </span>
                </TableCell>

                {/* Pelanggan */}
                <TableCell className="w-[18%] px-4 py-3.5 align-middle whitespace-normal">
                  {order.customer_name ? (
                    <p className="text-xs font-medium text-slate-800 line-clamp-1">
                      {order.customer_name}
                    </p>
                  ) : (
                    <span className="text-xs italic text-slate-400">Belum diinput (Nego)</span>
                  )}
                  {order.customer_phone && (
                    <p className="text-[10.5px] font-mono text-slate-500">
                      {order.customer_phone}
                    </p>
                  )}
                </TableCell>

                {/* Total Fiks */}
                <TableCell className="w-[14%] px-4 py-3.5 align-middle whitespace-nowrap font-mono text-xs font-bold text-slate-800">
                  {order.total_amount || order.initial_price}
                </TableCell>

                {/* Status */}
                <TableCell className="w-[14%] px-4 py-3.5 align-middle whitespace-nowrap">
                  <StatusBadge tone={tone}>{label}</StatusBadge>
                </TableCell>

                {/* Aksi */}
                <TableCell className="w-[14%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onOpenTab(order)}
                      className="h-7 text-xs px-2.5 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Buka Tab ↗
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => onDelete(order)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default OrderTable;
