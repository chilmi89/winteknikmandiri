import type { Metadata } from "next";
import ServicesManager from "@/components/dashboard/services/ServicesManager";

export const metadata: Metadata = {
  title: "Katalog Layanan",
};

export default function ServicesPage() {
  return <ServicesManager />;
}
