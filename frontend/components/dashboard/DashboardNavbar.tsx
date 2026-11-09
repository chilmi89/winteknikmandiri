"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Breadcrumbs from "./Breadcrumbs";
import { getAdminSession, logoutAdmin, type AdminUser } from "@/lib/auth";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    setAdmin(getAdminSession());
  }, []);

  const adminName = admin?.name || "Administrator WTM";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    logoutAdmin();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      {/* Kiri: Toggle Sidebar & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Toggle Mobile */}
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Buka menu"
          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        {/* Toggle Desktop */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          className="hidden size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Kanan: Search, Notifikasi, Profil Admin */}
      <div className="flex items-center gap-3">
        {/* Simple Search Input */}
        <div className="relative hidden w-56 md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pr-3 pl-8 text-xs text-slate-800 transition placeholder:text-slate-400 focus:border-[#8A1515] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Notifikasi */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#8A1515]" />
        </button>

        {/* Profil Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 items-center gap-2.5 rounded-lg border border-slate-200 pr-2.5 pl-1.5 transition hover:bg-slate-50"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-[#8A1515] text-[11px] font-bold text-white">
              {adminInitial}
            </div>
            <div className="hidden text-left sm:block">
              <span className="block max-w-[120px] truncate text-xs font-semibold text-slate-800">
                {adminName}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "size-3.5 text-slate-400 transition-transform",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Tutup menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                <Link
                  href="/dashboard/pengguna"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserRound className="size-3.5 text-slate-400" />
                  Akun Pengguna
                </Link>
                <Link
                  href="/dashboard/pengaturan"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="size-3.5 text-slate-400" />
                  Pengaturan
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
