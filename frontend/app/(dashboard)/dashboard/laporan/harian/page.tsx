import type { Metadata } from "next";
import { LaporanPageView } from "@/components/dashboard/laporan/LaporanPageView";

export const metadata: Metadata = {
  title: "Laporan Keuangan Harian — Dashboard",
  description: "Laporan arus kas dan mutasi transaksi harian per jam CV Win Teknik Mandiri.",
};

export default function LaporanHarianPage() {
  return (
    <LaporanPageView
      periode="harian"
      pageTitle="Laporan Keuangan Harian"
      pageSubtitle="Pantau mutasi kas masuk, kas keluar, dan penutupan kas harian (Daily Cash Closing)."
    />
  );
}
