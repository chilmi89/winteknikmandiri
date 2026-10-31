"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import DashboardFooter from "./DashboardFooter";
import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "wtm-dashboard-sidebar-collapsed";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* localStorage tidak tersedia */
  }
  listeners.forEach((listener) => listener());
}

type DashboardShellProps = {
  children: React.ReactNode;
};

/**
 * Master Container Dashboard:
 * - Sidebar merah modern (kiri)
 * - Sticky Navbar putih (atas)
 * - Area Konten Fleksibel (tengah)
 * - Footer (bawah)
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const mobileOpen = drawerPath === pathname;

  // Cegah scroll body saat drawer terbuka di mobile
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#8A1515] focus:shadow-md"
      >
        Lewati ke konten utama
      </a>

      {/* ================= Sidebar Desktop ================= */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 ease-in-out lg:block",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* ================= Drawer Mobile ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setDrawerPath(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />
          <aside className="relative h-full w-[260px] shadow-2xl">
            <Sidebar
              onClose={() => setDrawerPath(null)}
              onNavigate={() => setDrawerPath(null)}
            />
          </aside>
        </div>
      )}

      {/* ================= Area Konten Utama ================= */}
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"
        )}
      >
        <DashboardNavbar
          collapsed={collapsed}
          onToggleCollapse={() => writeCollapsed(!collapsed)}
          onOpenMobile={() => setDrawerPath(pathname)}
        />

        <main id="dashboard-main" className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}

export default DashboardShell;
