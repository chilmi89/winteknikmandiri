import type { Metadata } from "next";
import GalleryManager from "@/components/dashboard/gallery/GalleryManager";

export const metadata: Metadata = {
  title: "Galeri Proyek Publik — Dashboard",
};

export default function GalleryPage() {
  return <GalleryManager />;
}
