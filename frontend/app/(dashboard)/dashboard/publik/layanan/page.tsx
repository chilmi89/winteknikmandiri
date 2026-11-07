import type { Metadata } from "next";
import KatalogManager from "@/components/dashboard/katalog/KatalogManager";

export const metadata: Metadata = {
  title: "Katalog Layanan Publik — Dashboard",
};

export default function ServicesPage() {
  return <KatalogManager />;
}
