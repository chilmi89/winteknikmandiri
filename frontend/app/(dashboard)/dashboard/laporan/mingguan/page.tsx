import type { Metadata } from "next";
import { LaporanPageView } from "@/components/dashboard/laporan/LaporanPageView";

export const metadata: Metadata = {
  title: "Laporan Keuangan Mingguan — Dashboard",
  description: "Laporan arus kas dan evaluasi keuangan 7 hari kerja CV Win Teknik Mandiri.",
};

export default function LaporanMingguanPage() {
  return (
    <LaporanPageView
      periode="mingguan"
      pageTitle="Laporan Keuangan Mingguan"
      pageSubtitle="Evaluasi tren arus kas mingguan (Senin–Minggu) sebelum jadwal pengeluaran & pencairan gaji teknisi."
    />
  );
}
