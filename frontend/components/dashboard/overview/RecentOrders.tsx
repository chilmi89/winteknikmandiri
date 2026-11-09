"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/data-table/StatusBadge";
import type { Order } from "@/lib/orders";
import { formatDate } from "@/lib/dashboard/format";

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
  menunggu_chat: "Menunggu Chat",
  belum_diproses: "Menunggu Chat",
  negosiasi: "Negosiasi",
  deal: "Deal",
  dikerjakan: "Dikerjakan",
  selesai: "Selesai",
  batal: "Dibatalkan",
};

type RecentOrdersProps = {
  items: Order[];
  loading?: boolean;
};

export function RecentOrders({ items, loading = false }: RecentOrdersProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Pesanan Terbaru
        </h2>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 transition hover:text-[#8A1515]"
        >
          Semua
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-md bg-slate-100"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="px-4 py-10 text-center text-xs text-slate-400">
          Belum ada pesanan.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="pl-4 text-[11px] font-semibold text-slate-600">
                  Invoice
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600">
                  Pelanggan
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600">
                  Status
                </TableHead>
                <TableHead className="pr-4 text-right text-[11px] font-semibold text-slate-600">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  <TableCell className="py-2.5 pl-4">
                    <span className="font-mono text-[11px] font-medium text-slate-900">
                      {order.invoice_no}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {formatDate(order.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="block max-w-[160px] truncate text-xs text-slate-700">
                      {order.customer_name || "—"}
                    </span>
                    <span className="block max-w-[160px] truncate text-[10px] text-slate-400">
                      {order.initial_service}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <StatusBadge tone={STATUS_TONES[order.status] ?? "neutral"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="py-2.5 pr-4 text-right text-xs font-semibold text-slate-900 tabular-nums">
                    {order.total_amount || order.initial_price || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
