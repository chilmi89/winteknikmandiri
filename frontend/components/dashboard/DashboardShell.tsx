"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import DashboardFooter from "./DashboardFooter";
import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "wtm-dashboard-sidebar-collapsed";

/* --------------------------------------------------------------------------
 * Store kecil untuk preferensi sidebar (tersimpan di localStorage).
 * Dibaca lewat useSyncExternalStore agar tidak memicu setState di dalam effect
 * dan tetap aman saat hydration.
 * ----------------------------------------------------------------------- */
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
 * Master layout dashboard: sidebar merah + navbar sticky + konten + footer.
 * Semua halaman di `app/(dashboard)/` otomatis memakai shell ini.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Drawer menyimpan path saat dibuka; pindah halaman otomatis menutupnya.
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const mobileOpen = drawerPath === pathname;

  // Cegah scroll body saat drawer terbuka.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-[#F4FAFE] text-[#0A2540]">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0A2540]"
      >
        Lewati ke konten utama
      </a>

      {/* ================= Sidebar desktop ================= */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 ease-out lg:block",
          collapsed ? "w-[76px]" : "w-[264px]"
        )}
      >
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* ================= Drawer mobile ================= */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu dashboard"
            onClick={() => setDrawerPath(null)}
            className="absolute inset-0 bg-[#0A2540]/45 backdrop-blur-[2px]"
          />
          <aside className="dash-drawer relative h-full w-[282px] shadow-[12px_0_40px_rgba(10,37,64,0.28)]">
            <Sidebar
              onClose={() => setDrawerPath(null)}
              onNavigate={() => setDrawerPath(null)}
            />
          </aside>
        </div>
      ) : null}

      {/* ================= Konten ================= */}
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"
        )}
      >
        <DashboardNavbar
          collapsed={collapsed}
          onToggleCollapse={() => writeCollapsed(!collapsed)}
          onOpenMobile={() => setDrawerPath(pathname)}
        />

        <main
          id="dashboard-main"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}

export default DashboardShell;
