import type { Metadata } from "next";
import { Users } from "lucide-react";
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Pelanggan",
};

export default function CustomersPage() {
  return (
    <ModulePlaceholder
      eyebrow="Operasional"
      title="Data Pelanggan"
      description="Basis data pelanggan hunian, komersial, dan industri beserta riwayat layanan."
      moduleName="pelanggan"
      icon={<Users className="size-6" aria-hidden="true" />}
      features={[
        "Direktori pelanggan dengan pencarian cepat dan pagination",
        "Riwayat service, kontrak maintenance, dan garansi",
        "Segmentasi hunian, komersial, dan industri",
        "Ekspor data pelanggan ke CSV untuk keperluan administrasi",
      ]}
    />
  );
}
