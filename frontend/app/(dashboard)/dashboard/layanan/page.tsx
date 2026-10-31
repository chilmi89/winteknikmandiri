import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Layanan",
};

export default function ServicesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Konten"
      title="Katalog Layanan"
      description="Kelola daftar layanan AC, ducting, dan cold storage yang tampil di halaman publik."
      moduleName="layanan"
      icon={<Wrench className="size-6" aria-hidden="true" />}
      features={[
        "Tambah, ubah, dan nonaktifkan layanan tanpa menyentuh kode",
        "Atur ikon, urutan tampil, dan deskripsi singkat",
        "Hubungkan ke halaman detail layanan publik",
        "Pratinjau konten sebelum dipublikasikan",
      ]}
    />
  );
}
