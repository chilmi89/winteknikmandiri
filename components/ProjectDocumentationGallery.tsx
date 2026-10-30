"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Maximize2,
  X,
} from "lucide-react";

export type ProjectDocumentationItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  image: string;
  alt: string;
};

export const defaultDocumentationProjects: ProjectDocumentationItem[] = [
  {
    id: "galeria-bali-1",
    title: "Instalasi AHU Mall Galeria Bali",
    category: "Gedung Komersial",
    location: "Kuta, Bali",
    image:
      "/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall.jpeg",
    alt: "Dokumentasi instalasi AHU di Mall Galeria Bali",
  },
  {
    id: "smk-budi-utomo-1",
    title: "Supply & Instalasi AC SMK Budi Utomo",
    category: "Fasilitas Pendidikan",
    location: "Gading Mangu, Jombang",
    image:
      "/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu.jpeg",
    alt: "Dokumentasi supply dan instalasi AC di SMK Budi Utomo Gading Mangu",
  },
  {
    id: "growth-asia-1",
    title: "Pabrikasi Pipa Refrigerant PT Growth Asia",
    category: "Sektor Industri",
    location: "Pasuruan, Jawa Timur",
    image:
      "/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.17.jpeg",
    alt: "Dokumentasi pabrikasi pipa refrigerant di PT Growth Asia Pasuruan",
  },
  {
    id: "wali-barokah-splitduct",
    title: "Instalasi AC Splitduct 20 PK Pondok Wali Barokah",
    category: "Fasilitas Publik / Gedung",
    location: "Kota Kediri",
    image:
      "/gallery/Proyek%20Pondok%20Wali%20Barokah/Instalasi%20mesin%20splitduct%2020%20PK%20Pondok%20Wali%20Barokah.jpeg",
    alt: "Dokumentasi instalasi mesin splitduct 20 PK di Pondok Wali Barokah Kediri",
  },
  {
    id: "nike-puri-indah",
    title: "Pemasangan Unit AC Store Nike Mall Puri Indah",
    category: "Tenant Retail Mall",
    location: "Jakarta Barat",
    image:
      "/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2009.10.49.jpeg",
    alt: "Dokumentasi instalasi AC di tenant Nike Mall Puri Indah Jakarta",
  },
  {
    id: "payless-centre-point",
    title: "Instalasi Jaringan AC Payless Centre Point Mall",
    category: "Tenant Retail Nasional",
    location: "Medan, Sumatera Utara",
    image:
      "/gallery/Proyek%20Payless%20Centre%20Point%20Medan/WhatsApp%20Image%202026-10-24%20at%2009.05.32.jpeg",
    alt: "Dokumentasi instalasi AC di Payless Centre Point Mall Medan",
  },
  {
    id: "wali-barokah-dmc",
    title: "Persiapan & Pemasangan Outdoor Unit DMC",
    category: "Fasilitas Khusus",
    location: "Kota Kediri",
    image:
      "/gallery/Proyek%20Pondok%20Wali%20Barokah/Persiapan%20instalasi%20outdoor%20DMC%20pondok%20Wali%20Barokah.jpeg",
    alt: "Dokumentasi persiapan instalasi outdoor DMC di Pondok Wali Barokah",
  },
  {
    id: "galeria-bali-2",
    title: "Fabrikasi & Penataan Saluran AHU Galeria Bali",
    category: "Gedung Komersial",
    location: "Kuta, Bali",
    image:
      "/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall(2).jpeg",
    alt: "Dokumentasi penataan saluran AHU di Galeria Bali Mall",
  },
  {
    id: "smk-budi-utomo-indoor",
    title: "Instalasi Unit AC Indoor Ruang Belajar SMK",
    category: "Fasilitas Pendidikan",
    location: "Gading Mangu, Jombang",
    image:
      "/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu(1).jpeg",
    alt: "Dokumentasi instalasi unit indoor AC di SMK Budi Utomo",
  },
];

const INITIAL_VISIBLE_COUNT = 6;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

interface ProjectDocumentationGalleryProps {
  items?: ProjectDocumentationItem[];
}

export default function ProjectDocumentationGallery({
  items = defaultDocumentationProjects,
}: ProjectDocumentationGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = items.length - INITIAL_VISIBLE_COUNT;

  // Keyboard navigation & Esc key handler
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewIndex(null);
      } else if (e.key === "ArrowRight") {
        setPreviewIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
      } else if (e.key === "ArrowLeft") {
        setPreviewIndex((prev) =>
          prev !== null ? (prev - 1 + items.length) % items.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, items.length]);

  // Body scroll lock during modal preview
  useEffect(() => {
    if (previewIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [previewIndex]);

  const activeItem = previewIndex !== null ? items[previewIndex] : null;

  return (
    <div>
      {/* Grid Dokumentasi Proyek */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreviewIndex(index)}
            aria-label={`Lihat preview foto ${item.title}`}
            className={`group relative flex h-full flex-col text-left overflow-hidden border border-[#0A2540]/10 bg-white transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-2 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.35),0_0_0_1px_rgba(168,32,32,0.25)] ${focusRing}`}
          >
            {/* Top Red Line Reveal */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
            />

            {/* Card Sheen Effect */}
            <span
              aria-hidden="true"
              className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
            />

            {/* Photo Container */}
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0A2540]">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                className="object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.06] group-hover:brightness-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[#A82020]/0 transition-colors duration-500 group-hover:bg-[#A82020]/15"
              />

              {/* Category Badge */}
              <span className="absolute left-3 top-3 bg-[#0A2540]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-[#A82020]">
                {item.category}
              </span>

              {/* Zoom Preview Hint */}
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-[#0A2540]/80 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <Maximize2 className="size-3" aria-hidden="true" />
                Zoom
              </span>
            </div>

            {/* Card Caption */}
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h4 className="text-base font-semibold leading-snug text-[#0A2540] transition-colors duration-300 group-hover:text-[#A82020]">
                  {item.title}
                </h4>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#0A2540]/10 pt-3 text-[11px] text-[#0A2540]/60">
                <span className="font-mono uppercase tracking-[0.12em]">
                  {item.location}
                </span>
                <span className="font-mono text-[10px] text-[#A82020] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Klik foto →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Button Show More / Show Less */}
      {items.length > INITIAL_VISIBLE_COUNT && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className={`group inline-flex items-center gap-2 border border-[#0A2540]/15 bg-white px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0A2540] transition-all duration-300 hover:border-[#A82020] hover:text-[#A82020] hover:shadow-[0_12px_28px_-12px_rgba(168,32,32,0.25)] ${focusRing}`}
          >
            {showAll ? (
              <>
                <span>Tampilkan Lebih Sedikit</span>
                <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
              </>
            ) : (
              <>
                <span>
                  Tampilkan Lebih Banyak Foto ({hiddenCount} Lagi)
                </span>
                <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* LIGHTBOX MODAL ZOOM PREVIEW */}
      {previewIndex !== null && activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview foto ${activeItem.title}`}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0A2540]/90 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Close Button Top-Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex(null);
            }}
            aria-label="Tutup preview foto (Esc)"
            className={`absolute right-4 top-4 z-[130] flex size-11 items-center justify-center border border-white/20 bg-[#0A2540]/80 text-white backdrop-blur-md transition-colors hover:border-[#A82020] hover:bg-[#A82020] sm:right-6 sm:top-6 ${focusRing}`}
          >
            <X className="size-5" />
          </button>

          {/* Navigation Button: Prev */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex((prev) =>
                prev !== null ? (prev - 1 + items.length) % items.length : null
              );
            }}
            aria-label="Foto sebelumnya (Panah Kiri)"
            className={`absolute left-3 top-1/2 z-[130] -translate-y-1/2 flex size-12 items-center justify-center border border-white/20 bg-[#0A2540]/80 text-white backdrop-blur-md transition-colors hover:border-[#A82020] hover:bg-[#A82020] sm:left-6 ${focusRing}`}
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Navigation Button: Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex((prev) =>
                prev !== null ? (prev + 1) % items.length : null
              );
            }}
            aria-label="Foto selanjutnya (Panah Kanan)"
            className={`absolute right-3 top-1/2 z-[130] -translate-y-1/2 flex size-12 items-center justify-center border border-white/20 bg-[#0A2540]/80 text-white backdrop-blur-md transition-colors hover:border-[#A82020] hover:bg-[#A82020] sm:right-6 ${focusRing}`}
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Modal Container */}
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden border border-white/20 bg-[#0A2540] shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Box */}
            <div className="relative aspect-[16/10] w-full max-h-[72vh] min-h-[260px] bg-black/60 sm:min-h-[420px]">
              <Image
                src={activeItem.image}
                alt={activeItem.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 920px"
                className="object-contain"
                priority
              />
            </div>

            {/* Caption & Info Bar */}
            <div className="flex flex-col gap-2 border-t border-white/10 bg-[#0A2540] p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-[#A82020] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white">
                    {activeItem.category}
                  </span>
                  <span className="font-mono text-xs text-white/60">
                    {activeItem.location}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {activeItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-white/50">
                <span>
                  Foto {previewIndex + 1} dari {items.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
