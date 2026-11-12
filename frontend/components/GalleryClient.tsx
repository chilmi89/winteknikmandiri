"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import {
  fetchGalleryBundle,
  type GalleryProject,
  type CategoryCountItem,
} from "@/lib/galleryService";
import { galleryProjects as fallbackProjects } from "@/lib/gallery";

const SLIDE_SIZE = 6;
const AUTO_SLIDE_INTERVAL = 3500; // 3.5 detik (lebih lincah)

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

export default function GalleryClient() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [categories, setCategories] = useState<CategoryCountItem[]>([]);
  const [total, setTotal] = useState(0);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Touch swipe support untuk mobile/tablet
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

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
  const filteredProjects = useMemo(() => {
    return activeCategory === "all"
      ? projects
      : projects.filter((item) => item.category === activeCategory);
  }, [projects, activeCategory]);

  // Chunking 6 item per slide (3 kolom x 2 baris)
  const slides = useMemo(() => {
    const chunks: GalleryProject[][] = [];
    for (let i = 0; i < filteredProjects.length; i += SLIDE_SIZE) {
      chunks.push(filteredProjects.slice(i, i + SLIDE_SIZE));
    }
    return chunks;
  }, [filteredProjects]);

  const totalSlides = slides.length;
  const currentCards = slides[currentSlide] || [];

  // Pergantian slide dengan animasi fade-out lalu staggered fade-in
  const changeSlide = (targetIndex: number) => {
    if (isExiting || totalSlides <= 1 || targetIndex === currentSlide) return;
    setIsExiting(true);
    setTimeout(() => {
      setCurrentSlide(targetIndex);
      setIsExiting(false);
    }, 200); // 200ms fade-out sebelum menampilkan konten baru
  };

  // Navigasi manual slide
  const handlePrev = () => {
    if (totalSlides <= 1 || isExiting) return;
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    changeSlide(prevIndex);
  };

  const handleNext = () => {
    if (totalSlides <= 1 || isExiting) return;
    const nextIndex = (currentSlide + 1) % totalSlides;
    changeSlide(nextIndex);
  };

  // Reset slide saat kategori berubah
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentSlide(0);
  };

  // Auto-slide setiap 3.5 detik (pause saat hover atau saat modal zoom terbuka)
  useEffect(() => {
    if (totalSlides <= 1 || isHovered || isExiting || previewIndex !== null) return;

    const interval = setInterval(() => {
      const nextIndex = (currentSlide + 1) % totalSlides;
      changeSlide(nextIndex);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [totalSlides, isHovered, isExiting, previewIndex, currentSlide]);

  // Pastikan currentSlide valid bila filter menghasilkan slide lebih sedikit
  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  // Touch swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

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
      {/* STICKY CATEGORY FILTER BAR */}
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

      {/* GALERI SLIDER 6 GRID (2 BARIS X 3 KOLOM) DENGAN STAGGERED FADE PER CARD */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Header Informasi Galeri */}
        <div className="flex flex-col gap-2 border-b border-[#0A2540]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0A2540]/65">
              Menampilkan {filteredProjects.length} Dokumentasi Proyek
            </p>
            <p className="mt-0.5 text-xs text-[#0A2540]/50">
              Klik kartu mana saja untuk melihat foto resolusi penuh (Zoom)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#A82020]">
              Kategori: {activeCategory === "all" ? "Semua Proyek" : activeCategory}
            </span>
          </div>
        </div>

        {/* Carousel Container */}
        {filteredProjects.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center border border-dashed border-[#0A2540]/20 bg-white/60 p-12 text-center">
            <p className="text-sm font-medium text-[#0A2540]">
              Belum ada dokumentasi untuk kategori ini.
            </p>
            <p className="mt-1 text-xs text-[#0A2540]/50">
              Silakan pilih kategori lain pada menu di atas.
            </p>
          </div>
        ) : (
          <div
            className="group/slider relative mt-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* GRID & TOMBOL PANAH WRAPPER 
                (Panah diposisikan relatif terhadap grid 2 baris sehingga berada persis di celah tengah antara baris 1 dan baris 2, di luar area foto) */}
            <div className="relative">
              {/* Tombol Panah Kiri (Lebih Besar & Rapi di Luar Foto) */}
              {totalSlides > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isExiting}
                  aria-label="Slide sebelumnya"
                  className={`absolute -left-3.5 sm:-left-6 lg:-left-8 xl:-left-12 top-1/2 z-30 flex size-12 sm:size-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#0A2540]/15 bg-white/98 text-[#0A2540] shadow-[0_10px_30px_rgba(10,37,64,0.18)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#A82020] hover:bg-[#A82020] hover:text-white disabled:pointer-events-none disabled:opacity-50 ${focusRing}`}
                >
                  <ChevronLeft className="size-6 sm:size-7" />
                </button>
              )}

              {/* Tombol Panah Kanan (Lebih Besar & Rapi di Luar Foto) */}
              {totalSlides > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isExiting}
                  aria-label="Slide selanjutnya"
                  className={`absolute -right-3.5 sm:-right-6 lg:-right-8 xl:-right-12 top-1/2 z-30 flex size-12 sm:size-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#0A2540]/15 bg-white/98 text-[#0A2540] shadow-[0_10px_30px_rgba(10,37,64,0.18)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#A82020] hover:bg-[#A82020] hover:text-white disabled:pointer-events-none disabled:opacity-50 ${focusRing}`}
                >
                  <ChevronRight className="size-6 sm:size-7" />
                </button>
              )}

              {/* Grid 6 Kartu (2 Baris x 3 Kolom) dengan Animasi Fade In & Out Bertahap per Card */}
              <div className="grid min-h-[580px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentCards.map((item, idx) => {
                  const globalIndex = filteredProjects.findIndex(
                    (p) => p.id === item.id
                  );

                  return (
                    <button
                      key={`${currentSlide}-${item.id}`}
                      type="button"
                      onClick={() =>
                        setPreviewIndex(globalIndex >= 0 ? globalIndex : 0)
                      }
                      aria-label={`Lihat preview foto ${item.title}`}
                      style={{
                        animationDelay: isExiting ? "0ms" : `${idx * 45}ms`,
                        animationDuration: isExiting ? "180ms" : "280ms",
                      }}
                      className={`group relative flex h-full flex-col overflow-hidden border border-[#0A2540]/10 bg-white text-left transition-[transform,border-color,box-shadow,opacity] duration-300 hover:-translate-y-2 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.35),0_0_0_1px_rgba(168,32,32,0.25)] ${focusRing} ${
                        isExiting
                          ? "opacity-0 scale-[0.98] transition-all duration-180 ease-in"
                          : "animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                      }`}
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

                      {/* Keterangan Proyek */}
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          {item.client && (
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A82020]">
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
                  );
                })}
              </div>
            </div>

            {/* Bottom Slider Navigation Bar (Terpisah di bawah grid sehingga tidak menggeser titik tengah tombol panah) */}
            {totalSlides > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#0A2540]/10 pt-6 sm:flex-row">
                {/* Status info & Jeda badge */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block size-2 rounded-full ${
                      isHovered ? "bg-[#0A2540]/30" : "bg-[#A82020] animate-pulse"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-[#0A2540]/70">
                    Halaman <strong className="text-[#0A2540]">{currentSlide + 1}</strong> dari{" "}
                    <strong>{totalSlides}</strong> ({filteredProjects.length} Foto)
                  </span>
                  {isHovered && (
                    <span className="rounded bg-[#A82020]/10 px-2 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-wider text-[#A82020]">
                      Jeda
                    </span>
                  )}
                </div>

                {/* Dots / Pills Indicator */}
                <div
                  className="flex items-center gap-2"
                  role="tablist"
                  aria-label="Pilih halaman galeri"
                >
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={currentSlide === idx}
                      aria-label={`Buka halaman ${idx + 1}`}
                      disabled={isExiting}
                      onClick={() => changeSlide(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${focusRing} ${
                        currentSlide === idx
                          ? "w-8 bg-[#A82020] shadow-sm"
                          : "w-2.5 bg-[#0A2540]/20 hover:bg-[#0A2540]/40"
                      }`}
                    />
                  ))}
                </div>

                {/* Quick Prev / Next Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isExiting}
                    aria-label="Halaman sebelumnya"
                    className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#0A2540]/70 transition-colors hover:text-[#A82020] disabled:opacity-40 ${focusRing}`}
                  >
                    ← Prev
                  </button>
                  <span className="text-[#0A2540]/25">/</span>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isExiting}
                    aria-label="Halaman selanjutnya"
                    className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#0A2540]/70 transition-colors hover:text-[#A82020] disabled:opacity-40 ${focusRing}`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL ZOOM PREVIEW (Klik foto manapun langsung terbuka) */}
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

            {/* Caption & Info Bar */}
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
