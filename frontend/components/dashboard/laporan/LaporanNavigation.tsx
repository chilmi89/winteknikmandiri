"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";

export function LaporanNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Harian", href: "/dashboard/laporan/harian", icon: Calendar },
    { label: "Mingguan", href: "/dashboard/laporan/mingguan", icon: CalendarRange },
    { label: "Bulanan", href: "/dashboard/laporan/bulanan", icon: CalendarDays },
    { label: "Tahunan", href: "/dashboard/laporan/tahunan", icon: TrendingUp },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-100/70 p-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className={`size-3.5 ${isActive ? "text-slate-700" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
