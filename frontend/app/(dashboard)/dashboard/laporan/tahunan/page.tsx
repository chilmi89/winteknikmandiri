import type { Metadata } from "next";
import { LaporanPageView } from "@/components/dashboard/laporan/LaporanPageView";

export const metadata: Metadata = {
  title: "Laporan Keuangan Tahunan — Dashboard",
  description: "Laporan keuangan tahunan dan pertumbuhan omzet 12 bulan CV Win Teknik Mandiri.",
};

export default function LaporanTahunanPage() {
  return (
    <LaporanPageView
      periode="tahunan"
      pageTitle="Laporan Keuangan Tahunan"
      pageSubtitle="Performa 12 bulan."
    />
  );
}
