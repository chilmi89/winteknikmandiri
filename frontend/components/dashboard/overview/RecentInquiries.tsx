"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/data-table/StatusBadge";
import type { Inquiry } from "@/lib/dashboard/types";
import { formatDate } from "@/lib/dashboard/format";

const STATUS_TONES: Record<string, StatusTone> = {
  pending: "warning",
  diproses: "info",
  selesai: "success",
  batal: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  batal: "Dibatalkan",
};

type RecentInquiriesProps = {
  items: Inquiry[];
  loading?: boolean;
};

export function RecentInquiries({
  items,
  loading = false,
}: RecentInquiriesProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Permohonan Terbaru
        </h2>
        <Link
          href="/dashboard/inquiries"
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
          Belum ada permohonan.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((inquiry) => (
            <li
              key={inquiry.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-800">
                  {inquiry.name}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {inquiry.service} · {formatDate(inquiry.created_at)}
                </p>
              </div>
              <StatusBadge
                tone={STATUS_TONES[inquiry.status] ?? "neutral"}
              >
                {STATUS_LABELS[inquiry.status] ?? inquiry.status}
              </StatusBadge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
