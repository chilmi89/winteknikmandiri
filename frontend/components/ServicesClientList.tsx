"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  fetchServiceCategories,
  fetchServiceItems,
  type ServiceCategory,
  type ServiceItem,
} from "@/lib/katalogLayanan";
import ServiceCard from "@/components/ServiceCard";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const INITIAL_VISIBLE_COUNT = 4;

export default function ServicesClientList() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [cats, itms] = await Promise.all([
          fetchServiceCategories(),
          fetchServiceItems(),
        ]);
        if (active) {
          setCategories(Array.isArray(cats) ? cats : []);
          setItems(Array.isArray(itms) ? itms : []);
        }
      } catch {
        if (active) {
          setCategories([]);
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  // Hitung kategori dinamis dari item yang aktif dan sinkronkan dengan master kategori
  const categoryFilters = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; code?: string; count: number }
    >();

    // Tambahkan kategori dari item yang ada
    for (const item of items) {
      const name = item.category_name?.trim() || "Lainnya";
      const key = name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          id: item.category_id || key,
          name,
          code: item.category_code,
          count: 1,
        });
      }
    }

    // Sinkronkan kode dari data kategori master jika ada
    for (const cat of categories) {
      const key = cat.name.trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        if (!existing.code) existing.code = cat.code;
      }
    }

    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [items, categories]);

  // Filter items berdasarkan kategori yang aktif
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => {
      const catName = item.category_name?.trim().toLowerCase() || "";
      const catId = item.category_id || "";
      const target = selectedCategory.trim().toLowerCase();
      return catName === target || catId === selectedCategory;
    });
  }, [items, selectedCategory]);

  // Pagination / Show More
  const visibleItems = showAll
    ? filteredItems
    : filteredItems.slice(0, INITIAL_VISIBLE_COUNT);
  const remainingCount = filteredItems.length - INITIAL_VISIBLE_COUNT;

  const handleCategoryChange = (catNameOrId: string) => {
    setSelectedCategory(catNameOrId);
    setShowAll(false);
  };

  return (
    <div id="katalog" className="scroll-mt-20">
      {/* Sticky Top Filter Kategori Bar */}
      <div className="sticky top-20 z-30 transform-gpu border-y border-[#0A2540]/10 bg-white/98 backdrop-blur-md shadow-[0_1px_4px_rgba(10,37,64,0.04)]">
        <nav
          aria-label="Filter kategori layanan"
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 no-scrollbar sm:flex-wrap">
            {/* Tombol SEMUA LAYANAN */}
            <button
              type="button"
              aria-pressed={selectedCategory === "all"}
              onClick={() => handleCategoryChange("all")}
              className={`group inline-flex shrink-0 items-center gap-2 rounded-lg border-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-200 active:scale-95 ${focusRing} ${
                selectedCategory === "all"
                  ? "border-[#A82020] bg-[#A82020] text-white shadow-sm"
                  : "border-[#0A2540]/15 bg-white text-[#0A2540]/75 hover:border-[#A82020] hover:text-[#A82020] hover:bg-[#A82020]/5 shadow-2xs"
              }`}
            >
              <span className="font-semibold">Semua Layanan</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                  selectedCategory === "all"
                    ? "bg-white/25 text-white"
                    : "bg-[#0A2540]/5 text-[#0A2540]/65 group-hover:bg-[#A82020]/15 group-hover:text-[#A82020]"
                }`}
              >
                {items.length}
              </span>
            </button>

            {/* Tombol Kategori Dinamis dari API */}
            {categoryFilters.map((cat, idx) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory === cat.id;

              const codeNumber =
                cat.code || String(idx + 1).padStart(2, "0");

              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`group inline-flex shrink-0 items-center gap-2 rounded-lg border-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-200 active:scale-95 ${focusRing} ${
                    isSelected
                      ? "border-[#A82020] bg-[#A82020] text-white shadow-sm"
                      : "border-[#0A2540]/15 bg-white text-[#0A2540]/75 hover:border-[#A82020] hover:text-[#A82020] hover:bg-[#A82020]/5 shadow-2xs"
                  }`}
                >
                  <span
                    className={`font-bold transition-colors ${
                      isSelected
                        ? "text-white/90"
                        : "text-[#A82020] group-hover:text-[#A82020]"
                    }`}
                  >
                    {codeNumber}
                  </span>
                  <span className="font-semibold">{cat.name}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-[#0A2540]/5 text-[#0A2540]/65 group-hover:bg-[#A82020]/15 group-hover:text-[#A82020]"
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

      {/* Info Bar Ringkas (Jumlah & Kategori Aktif) */}
      <div className="border-b border-[#0A2540]/10 bg-white/60 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0A2540]/60">
            Menampilkan {visibleItems.length} dari {filteredItems.length} Layanan
          </p>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A82020]">
            Kategori:{" "}
            {selectedCategory === "all" ? "Semua Layanan" : selectedCategory}
          </span>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-pulse">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12 py-8 border-b border-[#0A2540]/10"
            >
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] w-full rounded-lg bg-slate-200" />
              </div>
              <div className="lg:col-span-7 space-y-4">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-8 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-10 w-44 rounded-lg bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daftar Kartu Layanan Zigzag */}
      {!loading && visibleItems.length > 0 && (
        <section aria-label="Detail kartu layanan">
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className={`border-b border-[#0A2540]/10 transition-colors ${
                index % 2 === 1 ? "bg-[#8ACFF8]/15" : "bg-white"
              }`}
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <ServiceCard item={item} reversed={index % 2 === 1} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty State */}
      {!loading && visibleItems.length === 0 && (
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-[#0A2540]/20 bg-white p-12 text-center shadow-xs">
            <p className="text-base font-semibold text-[#0A2540]">
              Belum ada paket layanan untuk kategori ini
            </p>
            <p className="mt-1 text-xs text-[#0A2540]/60">
              Silakan pilih kategori lain atau tampilkan seluruh paket layanan.
            </p>
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#A82020] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#8e1919]"
            >
              Lihat Semua Layanan
            </button>
          </div>
        </div>
      )}

      {/* Tombol Show More / Tampilkan Lebih Banyak */}
      {!loading && filteredItems.length > INITIAL_VISIBLE_COUNT && (
        <div className="border-t border-[#0A2540]/10 bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 flex flex-col items-center justify-center gap-2.5 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className={`group inline-flex items-center gap-2 rounded-xl border-2 border-[#0A2540]/20 bg-white px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#0A2540] shadow-xs transition-all duration-200 hover:border-[#A82020] hover:text-[#A82020] hover:shadow-md active:scale-95 ${focusRing}`}
            >
              {showAll ? (
                <>
                  <span>Tampilkan Lebih Sedikit</span>
                  <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  <span>
                    Tampilkan Semua ({remainingCount} Layanan Lagi)
                  </span>
                  <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400">
              Menampilkan {visibleItems.length} dari {filteredItems.length} layanan yang terdaftar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
