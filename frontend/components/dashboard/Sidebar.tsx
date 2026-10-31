"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNav, type DashboardNavItem } from "@/lib/dashboard/nav";

type SidebarProps = {
  collapsed?: boolean;
  onClose?: () => void;
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
        "flex h-dvh flex-col bg-[#2279cf] text-white select-none transition-all duration-300",
        className
      )}
    >
      {/* ---------- Brand / Logo Header ---------- */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Image
              src="/logo/logo_wtm-loader.png"
              alt="Logo"
              width={28}
              height={24}
              className="h-5 w-auto object-contain"
              priority
            />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-wider text-white">
                WIN TEKNIK
              </span>
              <span className="block truncate text-[10px] font-medium tracking-widest text-white/50 uppercase">
                Admin Panel
              </span>
            </div>
          )}
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex size-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ---------- Navigasi Menu (Bebas Scrollbar Cacat) ---------- */}
      <nav
        aria-label="Navigasi dashboard"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {dashboardNav.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                {group.title}
              </p>
            ) : (
              <div className="mx-auto my-2 h-px w-6 bg-white/10" />
            )}

            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-white/18 text-white shadow-xs font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-150",
                      active ? "text-white" : "text-white/60 group-hover:text-white"
                    )}
                  />

                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ---------- Bottom / Logout ---------- */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/login"
          title={collapsed ? "Keluar" : undefined}
          className={cn(
            "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="size-4 shrink-0 text-white/60" />
          {!collapsed && <span>Keluar</span>}
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
