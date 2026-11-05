import type { Metadata } from "next";
import PilarLayananManager from "@/components/dashboard/pilar-layanan/PilarLayananManager";

export const metadata: Metadata = {
  title: "Pilar Layanan Publik — Dashboard",
};

export default function PilarLayananPage() {
  return <PilarLayananManager />;
}
