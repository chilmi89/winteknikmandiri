"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutPanelLeft,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/lib/dashboard/nav";
import Breadcrumbs from "./Breadcrumbs";

type PanelId = "search" | "menu" | "notif";

type DashboardNavbarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
};

export function DashboardNavbar({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: DashboardNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [openPanel, setOpenPanel] = useState<{
    id: PanelId;
    path: string;
  } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Panel otomatis dianggap tertutup saat URL berubah.
  const isPanelOpen = (id: PanelId) =>
    openPanel?.id === id && openPanel.path === pathname;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return dashboardNavItems
      .filter((item) => item.label.toLowerCase().includes(needle))
      .slice(0, 5);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setOpenPanel({ id: "search", path: pathname });
      }
      if (event.key === "Escape") {
        setOpenPanel(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname]);

  function goTo(href: string) {
    setQuery("");
    setOpenPanel(null);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#0A2540]/10 bg-white/95">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile: buka drawer */}
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Buka menu dashboard"
          className="flex size-9 shrink-0 items-center justify-center border border-[#0A2540]/12 text-[#0A2540] transition-colors hover:bg-[#F4FAFE] lg:hidden"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>

        {/* Desktop: collapse sidebar */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          className="hidden size-9 shrink-0 items-center justify-center border border-[#0A2540]/12 text-[#0A2540]/70 transition-colors hover:bg-[#F4FAFE] hover:text-[#0A2540] lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
        </button>

        <div className="hidden min-w-0 sm:block">
          <Breadcrumbs />
        </div>

        {/* Search */}
        <div className="relative ml-auto w-full max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#0A2540]/35"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenPanel({ id: "search", path: pathname });
            }}
            onFocus={() => setOpenPanel({ id: "search", path: pathname })}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) goTo(results[0].href);
            }}
            placeholder="Cari menu…"
            aria-label="Cari menu dashboard"
            className="h-9 w-full border border-[#0A2540]/12 bg-[#F4FAFE] pr-14 pl-9 text-[13px] text-[#0A2540] transition-colors placeholder:text-[#0A2540]/35 focus:border-[#A82020] focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 border border-[#0A2540]/12 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#0A2540]/40">
            ⌘K
          </kbd>

          {isPanelOpen("search") && query.trim() ? (
            <>
              <button
                type="button"
                aria-label="Tutup pencarian"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpenPanel(null)}
              />
              <div className="dash-pop absolute top-11 right-0 left-0 z-20 border border-[#0A2540]/10 bg-white shadow-[0_12px_32px_rgba(10,37,64,0.12)]">
                {results.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-[#0A2540]/50">
                    Menu tidak ditemukan.
                  </p>
                ) : (
                  <ul className="py-1">
                    {results.map((item) => (
                      <li key={item.href}>
                        <button
                          type="button"
                          onClick={() => goTo(item.href)}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[#0A2540]/80 transition-colors hover:bg-[#F4FAFE] hover:text-[#A82020]"
                        >
                          <item.icon
                            className="size-4 text-[#0A2540]/40"
                            aria-hidden="true"
                          />
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Notifikasi */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setOpenPanel(
                isPanelOpen("notif")
                  ? null
                  : { id: "notif", path: pathname }
              )
            }
            aria-label="Notifikasi"
            aria-expanded={isPanelOpen("notif")}
            className="relative flex size-9 items-center justify-center border border-[#0A2540]/12 text-[#0A2540]/70 transition-colors hover:bg-[#F4FAFE] hover:text-[#0A2540]"
          >
            <Bell className="size-4" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#A82020]"
            />
          </button>

          {isPanelOpen("notif") ? (
            <>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpenPanel(null)}
              />
              <div className="dash-pop absolute top-11 right-0 z-20 w-72 border border-[#0A2540]/10 bg-white shadow-[0_12px_32px_rgba(10,37,64,0.12)]">
                <div className="border-b border-[#0A2540]/10 px-3 py-2.5 text-xs font-semibold text-[#0A2540]">
                  Notifikasi
                </div>
                <ul className="divide-y divide-[#0A2540]/6">
                  <li className="px-3 py-3">
                    <p className="text-xs font-medium text-[#0A2540]">
                      Permohonan baru masuk
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#0A2540]/50">
                      Cek menu Permohonan untuk menindaklanjuti.
                    </p>
                  </li>
                  <li className="px-3 py-3">
                    <p className="text-xs font-medium text-[#0A2540]">
                      Sinkronisasi API aktif
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#0A2540]/50">
                      Backend Go Gin terhubung ke PostgreSQL.
                    </p>
                  </li>
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Profil */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setOpenPanel(
                isPanelOpen("menu") ? null : { id: "menu", path: pathname }
              )
            }
            aria-label="Menu pengguna"
            aria-expanded={isPanelOpen("menu")}
            className="flex h-9 items-center gap-2 border border-[#0A2540]/12 pr-2 pl-1 transition-colors hover:bg-[#F4FAFE]"
          >
            <span className="flex size-7 items-center justify-center bg-[#0A2540] text-[11px] font-bold text-white">
              AD
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[12px] leading-tight font-semibold text-[#0A2540]">
                Admin
              </span>
              <span className="block text-[10px] leading-tight text-[#0A2540]/45">
                Administrator
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 text-[#0A2540]/40 transition-transform",
                isPanelOpen("menu") && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {isPanelOpen("menu") ? (
            <>
              <button
                type="button"
                aria-label="Tutup menu pengguna"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpenPanel(null)}
              />
              <div className="dash-pop absolute top-11 right-0 z-20 w-52 border border-[#0A2540]/10 bg-white py-1 shadow-[0_12px_32px_rgba(10,37,64,0.12)]">
                <Link
                  href="/dashboard/pengaturan"
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#0A2540]/75 transition-colors hover:bg-[#F4FAFE] hover:text-[#0A2540]"
                >
                  <UserRound
                    className="size-4 text-[#0A2540]/40"
                    aria-hidden="true"
                  />
                  Profil Saya
                </Link>
                <Link
                  href="/dashboard/pengaturan"
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#0A2540]/75 transition-colors hover:bg-[#F4FAFE] hover:text-[#0A2540]"
                >
                  <Settings
                    className="size-4 text-[#0A2540]/40"
                    aria-hidden="true"
                  />
                  Pengaturan
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#0A2540]/75 transition-colors hover:bg-[#F4FAFE] hover:text-[#0A2540]"
                >
                  <LayoutPanelLeft
                    className="size-4 text-[#0A2540]/40"
                    aria-hidden="true"
                  />
                  Ringkasan
                </Link>
                <div className="my-1 h-px bg-[#0A2540]/10" />
                <Link
                  href="/login"
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#A82020] transition-colors hover:bg-[#A82020]/8"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Keluar
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
