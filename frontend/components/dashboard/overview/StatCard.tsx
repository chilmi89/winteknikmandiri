"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
  loading?: boolean;
};

export function StatCard({
  label,
  value,
  sublabel,
  href,
  icon: Icon,
  loading = false,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-[#8A1515]/10 group-hover:text-[#8A1515]">
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        {loading ? (
          <span className="h-7 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </span>
        )}
        <ArrowUpRight className="size-3.5 text-slate-300 transition group-hover:text-[#8A1515]" />
      </div>

      <p className="mt-0.5 text-[11px] text-slate-400">
        {sublabel ?? "\u00A0"}
      </p>
    </Link>
  );
}
