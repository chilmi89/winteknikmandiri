import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hanya aktif saat path persis sama (dipakai untuk "/dashboard"). */
  exact?: boolean;
};

export type DashboardNavGroup = {
  title: string;
  items: DashboardNavItem[];
};

/**
 * Satu sumber kebenaran untuk menu sidebar, breadcrumb, dan judul halaman.
 * Tambah halaman baru cukup di sini + buat file page.tsx-nya.
 */
export const dashboardNav: DashboardNavGroup[] = [
  {
    title: "Ringkasan",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Operasional",
    items: [
      { label: "Permohonan", href: "/dashboard/inquiries", icon: Inbox },
      { label: "Proyek", href: "/dashboard/proyek", icon: FolderKanban },
      { label: "Tim", href: "/dashboard/tim", icon: Users },
    ],
  },
  {
    title: "Konten",
    items: [
      { label: "Layanan", href: "/dashboard/layanan", icon: Wrench },
      { label: "Galeri", href: "/dashboard/galeri", icon: Images },
    ],
  },
  {
    title: "Sistem",
    items: [{ label: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings }],
  },
  {
    title: "Setting User",
    items: [
      { label: "Pegawai", href: "/dashboard/pengaturan", icon: Settings }],
  },
];

export const dashboardNavItems: DashboardNavItem[] = dashboardNav.flatMap(
  (group) => group.items
);

/** Cari item menu yang cocok dengan pathname saat ini (prefix-aware). */
export function findNavItem(pathname: string): DashboardNavItem | undefined {
  const exact = dashboardNavItems.find(
    (item) => item.exact && item.href === pathname
  );
  if (exact) return exact;

  return dashboardNavItems
    .filter((item) => !item.exact)
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

/** Ubah segmen URL menjadi label yang enak dibaca. */
export function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
