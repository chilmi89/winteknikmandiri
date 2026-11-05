"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, X } from "lucide-react";
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
  const [closedParents, setClosedParents] = useState<Set<string>>(new Set());

  function isActive(item: DashboardNavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  function hasActiveChild(item: DashboardNavItem): boolean {
    return item.children?.some(isActive) ?? false;
  }

  function toggleParent(href: string) {
    setClosedParents((previous) => {
      const next = new Set(previous);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
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

      {/* ---------- Navigasi Menu ---------- */}
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
              const childActive = hasActiveChild(item);
              const Icon = item.icon;

              if (!item.children?.length) {
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
              }

              // Submenu tetap terbuka bila salah satu anaknya sedang aktif,
              // supaya navigasi langsung lewat URL tidak menyembunyikan halaman.
              const open = !closedParents.has(item.href) || childActive;

              // Sidebar ciut: parent cukup jadi ikon yang mengarah ke halaman pertama.
              if (collapsed) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    onClick={onNavigate}
                    className={cn(
                      "group flex h-10 items-center justify-center rounded-lg px-0 text-sm font-medium transition-all duration-150",
                      childActive
                        ? "bg-white/18 text-white shadow-xs"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                  </Link>
                );
              }

              return (
                <div key={item.href} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleParent(item.href)}
                    aria-expanded={open}
                    aria-controls={`submenu-${item.href.replace(/\//g, "-")}`}
                    className={cn(
                      "group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                      childActive
                        ? "bg-white/18 text-white shadow-xs font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-150",
                        childActive
                          ? "text-white"
                          : "text-white/60 group-hover:text-white"
                      )}
                    />
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-200",
                        open ? "rotate-0" : "-rotate-90",
                        childActive ? "text-white" : "text-white/50"
                      )}
                    />
                  </button>

                  {open && (
                    <div
                      id={`submenu-${item.href.replace(/\//g, "-")}`}
                      className="ml-5 space-y-1 border-l border-white/15 pl-2"
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childIsActive = isActive(child);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavigate}
                            aria-current={childIsActive ? "page" : undefined}
                            className={cn(
                              "group flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-all duration-150",
                              childIsActive
                                ? "bg-white/18 text-white shadow-xs font-semibold"
                                : "text-white/65 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                "size-3.5 shrink-0 transition-colors duration-150",
                                childIsActive
                                  ? "text-white"
                                  : "text-white/55 group-hover:text-white"
                              )}
                            />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
