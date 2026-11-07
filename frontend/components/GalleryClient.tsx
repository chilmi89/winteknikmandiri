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
import {
  fetchGalleryBundle,
  type GalleryProject,
  type CategoryCountItem,
} from "@/lib/galleryService";
import { galleryProjects as fallbackProjects } from "@/lib/gallery";

const INITIAL_VISIBLE_COUNT = 9;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

export default function GalleryClient() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [categories, setCategories] = useState<CategoryCountItem[]>([]);
  const [total, setTotal] = useState(0);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Load bundle galeri dinamis dari database
  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchGalleryBundle();
      if (active && data) {
        setProjects(data.items || []);
        setCategories(data.categories || []);
        setTotal(data.total || 0);
      } else if (active) {
        // Fallback data lokal awal bila server belum aktif
        const mappedFallback: GalleryProject[] = fallbackProjects.map((f, i) => ({
          id: f.id,
          title: f.title,
          category: f.categoryLabel,
          client: f.client,
          scope: f.scope,
          location: f.location,
          image_url: f.image,
          sort_order: i + 1,
          is_active: true,
        }));
        setProjects(mappedFallback);
        setTotal(mappedFallback.length);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  // Filter items based on activeCategory
  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((item) => item.category === activeCategory);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setShowAll(false);
  };

  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = filteredProjects.length - INITIAL_VISIBLE_COUNT;

  // Keyboard navigation & Esc key handler for Lightbox
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewIndex(null);
      } else if (e.key === "ArrowRight") {
        setPreviewIndex((prev) =>
          prev !== null ? (prev + 1) % filteredProjects.length : null
        );
      } else if (e.key === "ArrowLeft") {
        setPreviewIndex((prev) =>
          prev !== null
            ? (prev - 1 + filteredProjects.length) % filteredProjects.length
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, filteredProjects.length]);

  // Body scroll lock during modal preview
  useEffect(() => {
    if (previewIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [previewIndex]);

  const activeProject =
    previewIndex !== null ? filteredProjects[previewIndex] : null;

  return (
    <>
      {/* STICKY CATEGORY FILTER BAR (Gambar 3) */}
      <div className="sticky top-20 z-30 transform-gpu border-b border-[#0A2540]/10 bg-white/98 shadow-[0_1px_3px_rgba(10,37,64,0.03)]">
        <nav
          aria-label="Filter kategori proyek"
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex gap-2.5 overflow-x-auto py-3.5 no-scrollbar">
            {/* Tombol SEMUA PROYEK */}
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className={`group inline-flex shrink-0 items-center gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 ${focusRing} ${
                activeCategory === "all"
                  ? "border-[#A82020] bg-[#A82020] text-white shadow-sm"
                  : "border-[#0A2540]/15 bg-white text-[#0A2540]/70 hover:border-[#A82020] hover:text-[#A82020]"
              }`}
            >
              <span>Semua Proyek</span>
              <span
                className={`inline-block px-1.5 py-0.5 text-[9.5px] tabular-nums transition-colors ${
                  activeCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-[#0A2540]/5 text-[#0A2540]/60 group-hover:bg-[#A82020]/10 group-hover:text-[#A82020]"
                }`}
              >
                {total || projects.length}
              </span>
            </button>

            {/* Tombol Per Kategori Dinamis */}
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.category;

              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => handleCategoryChange(cat.category)}
                  className={`group inline-flex shrink-0 items-center gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 ${focusRing} ${
                    isSelected
                      ? "border-[#A82020] bg-[#A82020] text-white shadow-sm"
                      : "border-[#0A2540]/15 bg-white text-[#0A2540]/70 hover:border-[#A82020] hover:text-[#A82020]"
                  }`}
                >
                  <span>{cat.category}</span>
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[9.5px] tabular-nums transition-colors ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#0A2540]/5 text-[#0A2540]/60 group-hover:bg-[#A82020]/10 group-hover:text-[#A82020]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* GALERI GRID & CARDS (Gambar 1) */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between border-b border-[#0A2540]/10 pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0A2540]/65">
              Menampilkan {visibleProjects.length} dari {filteredProjects.length}{" "}
              Dokumentasi
            </p>
            <p className="mt-0.5 text-xs text-[#0A2540]/50">
              Klik kartu untuk melihat foto beresolusi penuh
            </p>
          </div>

          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#A82020]">
            Kategori:{" "}
            {activeCategory === "all" ? "Semua Proyek" : activeCategory}
          </span>
        </div>

        {/* Grid 3 Kolom Kartu Proyek */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreviewIndex(index)}
              aria-label={`Lihat preview foto ${item.title}`}
              className={`group relative flex h-full flex-col overflow-hidden border border-[#0A2540]/10 bg-white text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-2 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.35),0_0_0_1px_rgba(168,32,32,0.25)] ${focusRing}`}
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

              {/* Photo Box */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0A2540]">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.06] group-hover:brightness-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#A82020]/0 transition-colors duration-500 group-hover:bg-[#A82020]/15"
                />

                {/* Badge Kategori */}
                <span className="absolute left-3 top-3 bg-[#0A2540]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-[#A82020]">
                  {item.category}
                </span>

                {/* Zoom Hint */}
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-[#0A2540]/80 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <Maximize2 className="size-3" aria-hidden="true" />
                  Zoom
                </span>
              </div>

              {/* Keterangan Proyek (Persis Gambar 1) */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  {item.client && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A82020] font-semibold">
                      {item.client}
                    </p>
                  )}
                  <h3 className="mt-1.5 text-base font-semibold leading-snug text-[#0A2540] transition-colors duration-300 group-hover:text-[#A82020]">
                    {item.title}
                  </h3>
                  {item.scope && (
                    <p className="mt-2 text-xs text-[#0A2540]/65">
                      Lingkup: {item.scope}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#0A2540]/10 pt-3 text-[11px] text-[#0A2540]/60">
                  <span className="font-mono uppercase tracking-[0.12em]">
                    {item.location || "Kediri"}
                  </span>
                  <span className="font-mono text-[10.5px] text-[#A82020] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Buka foto →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Button Show More / Show Less */}
        {filteredProjects.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className={`group inline-flex items-center gap-2 border border-[#0A2540]/15 bg-white px-8 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0A2540] transition-all duration-300 hover:border-[#A82020] hover:text-[#A82020] hover:shadow-[0_12px_28px_-12px_rgba(168,32,32,0.25)] ${focusRing}`}
            >
              {showAll ? (
                <>
                  <span>Tampilkan Lebih Sedikit</span>
                  <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  <span>
                    Tampilkan Lebih Banyak ({hiddenCount} Foto Lagi)
                  </span>
                  <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL ZOOM PREVIEW (Gambar 2) */}
      {previewIndex !== null && activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview foto ${activeProject.title}`}
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
                prev !== null
                  ? (prev - 1 + filteredProjects.length) %
                    filteredProjects.length
                  : null
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
                prev !== null ? (prev + 1) % filteredProjects.length : null
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
                src={activeProject.image_url}
                alt={activeProject.title}
                fill
                sizes="(max-width: 1024px) 100vw, 920px"
                className="object-contain"
                priority
              />
            </div>

            {/* Caption & Info Bar (Persis Gambar 2) */}
            <div className="flex flex-col gap-2 border-t border-white/10 bg-[#0A2540] p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="bg-[#A82020] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white">
                    {activeProject.category}
                  </span>
                  <span className="font-mono text-xs text-white/60">
                    {activeProject.client} · {activeProject.location}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {activeProject.title}
                </h3>
                {activeProject.scope && (
                  <p className="mt-0.5 text-xs text-white/60">
                    Lingkup: {activeProject.scope}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-white/50">
                <span>
                  Foto {previewIndex + 1} dari {filteredProjects.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
