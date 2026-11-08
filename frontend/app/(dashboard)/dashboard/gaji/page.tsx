import type { Metadata } from "next";
import GajiManager from "@/components/dashboard/gaji/GajiManager";

export const metadata: Metadata = {
  title: "Penggajian Tim — Dashboard",
  description: "Kelola slip gaji tim teknisi berdasarkan rincian upah borongan proyek.",
};

export default function GajiPage() {
  return <GajiManager />;
}
