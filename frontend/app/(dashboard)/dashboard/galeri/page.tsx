import type { Metadata } from "next";
import { Images } from "lucide-react";
import ModulePlaceholder from "@/components/dashboard/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Galeri",
};

export default function GalleryPage() {
  return (
    <ModulePlaceholder
      eyebrow="Konten"
      title="Galeri Proyek"
      description="Dokumentasi visual proyek yang sudah dikerjakan, dikelompokkan per kategori."
      moduleName="galeri"
      icon={<Images className="size-6" aria-hidden="true" />}
      features={[
        "Unggah beberapa foto sekaligus dengan kompresi otomatis",
        "Kelompokkan dokumentasi per kategori proyek",
        "Atur foto unggulan untuk tampil di beranda",
        "Hapus dan arsipkan dokumentasi lama",
      ]}
    />
  );
}
