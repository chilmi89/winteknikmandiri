import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  return (
    <TooltipProvider delay={180}>
      <Toaster>
        <DashboardShell>{children}</DashboardShell>
      </Toaster>
    </TooltipProvider>
  );
}
