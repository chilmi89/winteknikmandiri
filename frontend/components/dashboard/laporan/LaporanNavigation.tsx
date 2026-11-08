"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";

export function LaporanNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Laporan Harian",
      href: "/dashboard/laporan/harian",
      icon: Calendar,
      description: "Kas Harian & Per Jam",
    },
    {
      label: "Laporan Mingguan",
      href: "/dashboard/laporan/mingguan",
      icon: CalendarRange,
      description: "Arus Kas 7 Hari",
    },
    {
      label: "Laporan Bulanan",
      href: "/dashboard/laporan/bulanan",
      icon: CalendarDays,
      description: "P&L Kas Bulanan",
    },
    {
      label: "Laporan Tahunan",
      href: "/dashboard/laporan/tahunan",
      icon: TrendingUp,
      description: "Performa 12 Bulan",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Icon className={`size-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
