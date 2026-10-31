"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LifeBuoy, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNav, type DashboardNavItem } from "@/lib/dashboard/nav";
import SidebarGroup from "./SidebarGroup";

type SidebarProps = {
  collapsed?: boolean;
  /** Tampilkan tombol tutup (mode drawer mobile). */
  onClose?: () => void;
  /** Dipanggil setiap menu diklik (untuk menutup drawer). */
  onNavigate?: () => void;
  className?: string;
};

export function Sidebar({
  collapsed = false,
  onClose,
  onNavigate,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: DashboardNavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-[linear-gradient(180deg,#A82020_0%,#8E1919_55%,#7A1414_100%)]",
        className
      )}
    >
      {/* ---------- Brand ---------- */}
      <div
        className={cn(
          "flex h-20 shrink-0 items-center gap-3 border-b border-white/12 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="CV Win Teknik Mandiri — Dashboard"
          className="flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          <span className="flex size-10 shrink-0 items-center justify-center bg-white shadow-[0_1px_0_rgba(0,0,0,0.15)]">
            <Image
              src="/logo/logo_wtm-loader.png"
              alt=""
              width={32}
              height={27}
              className="h-6 w-auto object-contain"
              priority
            />
          </span>

          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-[13px] leading-tight font-bold tracking-[0.02em] text-white">
                WIN TEKNIK
              </span>
              <span className="block truncate text-[10px] font-medium tracking-[0.22em] text-white/55 uppercase">
                Admin Panel
              </span>
            </span>
          ) : null}
        </Link>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="ml-auto flex size-8 items-center justify-center border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* ---------- Navigation ---------- */}
      <nav
        aria-label="Navigasi dashboard"
        className="dash-scroll flex-1 overflow-y-auto px-2 py-2"
      >
        {dashboardNav.map((group) => (
          <SidebarGroup
            key={group.title}
            group={group}
            isActive={isActive}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* ---------- Footer ---------- */}
      <div className="shrink-0 border-t border-white/12 p-3">
        {!collapsed ? (
          <div className="mb-3 border border-white/15 bg-white/8 p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-white">
              <LifeBuoy className="size-3.5 text-[#8ACFF8]" aria-hidden="true" />
              Butuh bantuan?
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/55">
              Tim teknis WTM siap membantu operasional harian Anda.
            </p>
            <Link
              href="/kontak"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8ACFF8] hover:underline"
            >
              Hubungi dukungan
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        <Link
          href="/login"
          title="Keluar"
          className={cn(
            "flex h-10 items-center gap-3 border border-white/20 px-3 text-[13px] font-medium text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed ? <span>Keluar</span> : <span className="sr-only">Keluar</span>}
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
