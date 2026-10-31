import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Proyek",
};

export default function ProjectsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Operasional"
      title="Manajemen Proyek"
      description="Catat pekerjaan pemasangan dan maintenance, lengkap dengan progres, teknisi, dan dokumentasi."
      moduleName="proyek"
      icon={<FolderKanban className="size-6" aria-hidden="true" />}
      features={[
        "Daftar proyek dengan status perencanaan, pengerjaan, dan selesai",
        "Penugasan teknisi serta jadwal survey lapangan",
        "Unggah foto dokumentasi sebelum dan sesudah pengerjaan",
        "Rekap nilai proyek dan termin pembayaran",
      ]}
    />
  );
}
