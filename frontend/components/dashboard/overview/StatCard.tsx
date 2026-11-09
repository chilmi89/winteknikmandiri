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
  iconTone?: "blue" | "emerald" | "violet" | "rose" | "amber";
};

const ICON_STYLES: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-100 group-hover:text-blue-700",
  emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100 group-hover:text-emerald-700",
  violet: "bg-violet-50 text-violet-600 border border-violet-100 group-hover:bg-violet-100 group-hover:text-violet-700",
  rose: "bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-100 group-hover:text-rose-700",
  amber: "bg-amber-50 text-amber-600 border border-amber-100 group-hover:bg-amber-100 group-hover:text-amber-700",
};

export function StatCard({
  label,
  value,
  sublabel,
  href,
  icon: Icon,
  loading = false,
  iconTone = "blue",
}: StatCardProps) {
  const iconStyle = ICON_STYLES[iconTone] || ICON_STYLES.blue;

  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className={`flex size-8 items-center justify-center rounded-lg transition-colors ${iconStyle}`}>
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
