"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ScrollReveal from "@/components/ScrollReveal";
import { waLink } from "@/lib/site";
import {
  fetchServiceCategories,
  fetchServiceItems,
  type ServiceCategory,
  type ServiceItem,
} from "@/lib/katalogLayanan";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const INITIAL_COUNT = 6;

export default function HomeProducts() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const [categoriesData, itemsData] = await Promise.all([
          fetchServiceCategories(),
          fetchServiceItems(),
        ]);

        if (active) {
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          setItems(Array.isArray(itemsData) ? itemsData : []);
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

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  // Kategori dinamis dari database (dihitung berdasarkan item yang aktif)
  const categoryFilters = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    // Tambahkan kategori yang ada item-nya
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
          count: 1,
        });
      }
    }

    // Jika ada kategori dari API master yang belum ada di map tapi ingin ditampilkan
    for (const cat of categories) {
      const key = cat.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: cat.id,
          name: cat.name,
          count: 0,
        });
      }
    }

    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [items, categories]);

  // Filter item berdasarkan kategori yang dipilih
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
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, INITIAL_COUNT);
  const remainingCount = filteredItems.length - INITIAL_COUNT;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setShowAll(false);
  };

  return (
    <section
      id="produk"
      className="scroll-mt-20 border-b border-[#0A2540]/10 bg-[#F4FAFE] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Seksi */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            index="01"
            eyebrow="Produk & Estimasi Biaya"
            title="Paket layanan dengan harga transparan."
            accent="harga transparan."
            description="Estimasi biaya pengerjaan teknis dan pengadaan unit tanpa biaya tersembunyi. Hubungi kami untuk jadwal pengerjaan."
            titleId="produk-title"
            className="max-w-2xl"
          />

          <Link
            href={waLink(
              "Halo CV Win Teknik Mandiri, saya ingin menanyakan daftar harga lengkap dan konsultasi AC."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#A82020] transition-colors hover:text-[#8e1919] ${focusRing}`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            <span>Tanya pricelist lengkap</span>
            <ArrowUpRight
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Filter Kategori Layanan (Chips/Pills) */}
        {!loading && categoryFilters.length > 1 && (
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className={`group inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${focusRing} ${
                selectedCategory === "all"
                  ? "bg-[#0A2540] text-white shadow-xs"
                  : "border border-slate-200/90 bg-white text-slate-600 hover:border-[#A82020]/40 hover:text-[#A82020] hover:bg-slate-50"
              }`}
            >
              <span>Semua Layanan</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition-colors ${
                  selectedCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-[#A82020]/10 group-hover:text-[#A82020]"
                }`}
              >
                {items.length}
              </span>
            </button>

            {categoryFilters.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`group inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${focusRing} ${
                    isSelected
                      ? "bg-[#0A2540] text-white shadow-xs"
                      : "border border-slate-200/90 bg-white text-slate-600 hover:border-[#A82020]/40 hover:text-[#A82020] hover:bg-slate-50"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition-colors ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#A82020]/10 group-hover:text-[#A82020]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-8 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 shadow-xs animate-pulse"
              >
                <div className="aspect-[16/10] w-full bg-slate-200" />
                <div className="flex flex-1 flex-col p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full rounded bg-slate-100" />
                    <div className="h-3.5 w-4/5 rounded bg-slate-100" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-5 w-20 rounded bg-slate-100" />
                    <div className="h-5 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="h-6 w-24 rounded bg-slate-200" />
                    <div className="h-8 w-20 rounded-lg bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid Kartu Layanan Real dari API */}
        {!loading && visibleItems.length > 0 && (
          <div className="mt-8 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => {
              const unitText = item.unit
                ? item.unit.startsWith("/")
                  ? item.unit
                  : `/${item.unit}`
                : "/unit";

              return (
                <ScrollReveal
                  key={item.id}
                  delay={Math.min(index * 60, 300)}
                  className="h-full"
                >
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#A82020]/50 hover:shadow-lg">
                    {/* Top Red Accent Reveal on Hover */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-30 h-[2.5px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />

                    {/* Foto Layanan */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={item.image_url || "/images/ac-split-clean.jpg"}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Vignette Gelap Halus */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60"
                      />

                      {/* Badge Kategori Tunggal di Pojok Kiri Atas Foto */}
                      {item.category_name && (
                        <div className="absolute left-3 top-3 z-10">
                          <span className="inline-flex items-center rounded-md bg-[#0A2540]/85 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-md shadow-xs transition-colors duration-300 group-hover:bg-[#A82020]">
                            {item.category_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Konten Kartu */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Judul Layanan */}
                      <h3 className="text-base sm:text-[17px] font-bold leading-snug tracking-tight text-[#0A2540] transition-colors duration-200 group-hover:text-[#A82020] line-clamp-2 min-h-[44px]">
                        {item.title}
                      </h3>

                      {/* Deskripsi Singkat */}
                      <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-500 line-clamp-2 min-h-[38px]">
                        {item.description ||
                          "Layanan pengerjaan profesional bergaransi CV Win Teknik Mandiri."}
                      </p>

                      {/* Fitur Unggulan (Pill Chips) */}
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                          {item.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                            >
                              <span className="size-1 rounded-full bg-[#A82020]" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Harga & Tombol Pesan */}
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <div className="min-w-0">
                          <span className="block font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            {item.price_prefix || "Mulai Dari"}
                          </span>
                          <div className="mt-0.5 flex items-baseline gap-1">
                            {item.price ? (
                              <>
                                <span className="text-lg sm:text-xl font-bold tabular-nums tracking-tight text-[#A82020]">
                                  {item.price}
                                </span>
                                <span className="truncate text-[11px] text-slate-500">
                                  {unitText}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-[#A82020]">
                                Minta Penawaran
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tombol Pesan Langsung ke Sistem & WhatsApp */}
                        <WhatsAppOrderButton
                          category={item.category_name || "Layanan"}
                          service={item.title}
                          price={
                            item.price
                              ? `${item.price} ${unitText}`.trim()
                              : "Penawaran"
                          }
                          serviceId={item.id}
                          categoryId={item.category_id}
                          label="Pesan"
                          className="shrink-0 rounded-lg bg-[#A82020] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#8e1919] hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Empty State jika tidak ada item dari API */}
        {!loading && visibleItems.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-12 text-center shadow-xs">
            <p className="text-sm font-semibold text-slate-800">
              {selectedCategory === "all"
                ? "Belum ada paket layanan yang tersedia"
                : "Belum ada paket layanan untuk kategori ini"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedCategory === "all"
                ? "Paket layanan akan otomatis muncul di sini setelah ditambahkan melalui panel admin."
                : "Silakan pilih kategori lain atau lihat seluruh paket layanan kami."}
            </p>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0A2540] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#103a63]"
              >
                Lihat Semua Layanan
              </button>
            )}
          </div>
        )}

        {/* Tombol Show More / Tampilkan Lebih Banyak */}
        {!loading && filteredItems.length > INITIAL_COUNT && (
          <div className="mt-12 flex flex-col items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className={`group inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-6 py-3 text-xs font-semibold text-[#0A2540] shadow-xs transition-all duration-200 hover:border-[#A82020] hover:text-[#A82020] hover:shadow-md active:scale-95 ${focusRing}`}
            >
              {showAll ? (
                <>
                  <span>Tampilkan Lebih Sedikit</span>
                  <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  <span>
                    Tampilkan Semua ({remainingCount} Layanan Lainnya)
                  </span>
                  <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400">
              Menampilkan {visibleItems.length} dari {filteredItems.length} paket
              layanan
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
