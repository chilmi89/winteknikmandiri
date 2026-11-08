import type { Metadata } from "next";
import { LaporanPageView } from "@/components/dashboard/laporan/LaporanPageView";

export const metadata: Metadata = {
  title: "Laporan Keuangan Bulanan — Dashboard",
  description: "Laporan laba rugi operasional bulanan (P&L) CV Win Teknik Mandiri.",
};

export default function LaporanBulananPage() {
  return (
    <LaporanPageView
      periode="bulanan"
      pageTitle="Laporan Keuangan Bulanan"
      pageSubtitle="Laporan laba rugi operasional bulanan (P&L), komparasi performa minggu I s/d V, dan rekapitulasi kas."
    />
  );
}
