import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard — CV Win Teknik Mandiri",
    template: "%s — Dashboard WTM",
  },
  description:
    "Panel admin CV Win Teknik Mandiri untuk mengelola permohonan, proyek, pelanggan, dan konten website.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
