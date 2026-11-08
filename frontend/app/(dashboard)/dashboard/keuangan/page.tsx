import type { Metadata } from "next";
import KeuanganWorkspace from "@/components/dashboard/keuangan/KeuanganWorkspace";

export const metadata: Metadata = {
  title: "Manajemen Keuangan — Dashboard",
  description: "Buku kas operasional, pencatatan arus masuk dan keluar, serta ringkasan saldo kas CV Win Teknik Mandiri.",
};

export default function KeuanganPage() {
  return <KeuanganWorkspace />;
}
