import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Columns3,
  Compass,
  FileText,
  FolderKanban,
  Globe,
  Images,
  Inbox,
  LayoutDashboard,
  MessageCircleQuestion,
  Settings,
  Share2,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hanya aktif saat path persis sama (dipakai untuk "/dashboard"). */
  exact?: boolean;
  /** Submenu; bila ada, parent dirender sebagai tombol buka/tutup. */
  children?: DashboardNavItem[];
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
      { label: "Pesanan & Invoice", href: "/dashboard/orders", icon: FileText },
      { label: "Manajemen Keuangan", href: "/dashboard/keuangan", icon: Wallet },
      {
        label: "Laporan Finansial",
        href: "/dashboard/laporan/bulanan",
        icon: TrendingUp,
        children: [
          { label: "Laporan Harian", href: "/dashboard/laporan/harian", icon: Calendar },
          { label: "Laporan Mingguan", href: "/dashboard/laporan/mingguan", icon: CalendarRange },
          { label: "Laporan Bulanan", href: "/dashboard/laporan/bulanan", icon: CalendarDays },
          { label: "Laporan Tahunan", href: "/dashboard/laporan/tahunan", icon: TrendingUp },
        ],
      },
      { label: "Penggajian Tim", href: "/dashboard/gaji", icon: Banknote },
      { label: "Permohonan", href: "/dashboard/inquiries", icon: Inbox },
      { label: "Proyek", href: "/dashboard/proyek", icon: FolderKanban },
      { label: "Tim", href: "/dashboard/tim", icon: Users },
    ],
  },
  {
    title: "Publik",
    items: [
      {
        label: "Publik",
        href: "/dashboard/publik",
        icon: Globe,
        children: [
          {
            label: "FAQ",
            href: "/dashboard/publik/faqs",
            icon: MessageCircleQuestion,
          },
          {
            label: "Pilar Layanan",
            href: "/dashboard/publik/pilar-layanan",
            icon: Columns3,
          },
          {
            label: "Jam Operasional",
            href: "/dashboard/publik/jam-operasional",
            icon: Clock,
          },
          {
            label: "Layanan",
            href: "/dashboard/publik/layanan",
            icon: Wrench,
          },
          {
            label: "Home",
            href: "/dashboard/publik/home",
            icon: LayoutDashboard,
          },
          {
            label: "Sosmed",
            href: "/dashboard/publik/sosmed",
            icon: Share2,
          },
          {
            label: "Visi & Misi",
            href: "/dashboard/publik/visi-misi",
            icon: Compass,
          },
          {
            label: "Tim Teknisi",
            href: "/dashboard/publik/tim",
            icon: Users,
          },
          {
            label: "Galeri",
            href: "/dashboard/publik/galeri",
            icon: Images,
          },
        ],
      },
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

/** Seluruh item (parent + anak) dalam satu daftar datar. */
export const dashboardNavItems: DashboardNavItem[] = dashboardNav.flatMap((group) =>
  group.items.flatMap((item) => [item, ...(item.children ?? [])])
);

/** Cari item menu yang cocok dengan pathname saat ini (prefix-aware, anak didahulukan). */
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
