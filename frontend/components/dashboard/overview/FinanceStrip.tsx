"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LaporanSummary } from "@/lib/laporan";

type FinanceStripProps = {
  summary?: LaporanSummary;
  loading?: boolean;
};

export function FinanceStrip({ summary, loading = false }: FinanceStripProps) {
  const cells = [
    {
      label: "Pemasukan",
      value: summary?.total_pemasukan ?? "—",
      tone: "text-emerald-600",
    },
    {
      label: "Pengeluaran",
      value: summary?.total_pengeluaran ?? "—",
      tone: "text-rose-600",
    },
    {
      label: "Saldo Bersih",
      value: summary?.saldo_bersih ?? "—",
      tone:
        (summary?.numeric_saldo ?? 0) >= 0 ? "text-slate-900" : "text-rose-600",
    },
    {
      label: "Profit Margin",
      value: summary ? `${summary.profit_margin_pct}%` : "—",
      tone: "text-slate-900",
    },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Keuangan Bulan Ini
          </h2>
          {summary && (
            <span className="text-[11px] text-slate-400">
              {summary.total_transaksi} transaksi
            </span>
          )}
        </div>
        <Link
          href="/dashboard/keuangan"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 transition hover:text-[#8A1515]"
        >
          Buka
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium text-slate-500">
              {cell.label}
            </p>
            {loading ? (
              <span className="mt-1.5 block h-5 w-24 animate-pulse rounded bg-slate-100" />
            ) : (
              <p
                className={`mt-1 truncate text-sm font-bold tabular-nums ${cell.tone}`}
              >
                {cell.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
