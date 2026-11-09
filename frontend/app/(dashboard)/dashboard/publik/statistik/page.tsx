import type { Metadata } from "next";
import CompanyStatsManager from "@/components/dashboard/company-stats/CompanyStatsManager";

export const metadata: Metadata = {
  title: "Statistik Pencapaian — Dashboard Publik",
  description: "Kelola data statistik rekam jejak yang tampil dinamis di halaman Beranda, Tentang Kami, dan Galeri.",
};

export default function StatistikPage() {
  return <CompanyStatsManager />;
}
