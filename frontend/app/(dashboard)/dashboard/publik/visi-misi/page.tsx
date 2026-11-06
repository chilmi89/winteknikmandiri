import type { Metadata } from "next";
import VisiMisiManager from "@/components/dashboard/visi-misi/VisiMisiManager";

export const metadata: Metadata = {
  title: "Visi & Misi Publik — Dashboard",
};

export default function VisiMisiPage() {
  return <VisiMisiManager />;
}
