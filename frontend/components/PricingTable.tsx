"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { waLink } from "@/lib/site";
import {
  fetchServiceCategories,
  fetchServiceItems,
  type ServiceCategory,
  type ServiceItem,
} from "@/lib/katalogLayanan";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

const PAGE_SIZE = 6;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const guarantees = [
  "Harga estimasi area Kediri",
  "Garansi tertulis 30 hari",
  "Survei & konsultasi gratis",
];

export default function PricingTable() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

  // Sinkronisasi kategori dengan item aktif
  const categoryFilters = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

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

    for (const cat of categories) {
      const key = cat.name.trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.id = cat.id;
      }
    }

    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [items, categories]);

  // Filter items berdasarkan activeTab
  const rows = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((row) => {
      const catName = row.category_name?.trim().toLowerCase() || "";
      const catId = row.category_id || "";
      const target = activeTab.trim().toLowerCase();
      return catName === target || catId === activeTab;
    });
  }, [items, activeTab]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const end = Math.min(start + PAGE_SIZE, rows.length);

  const goToTab = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <div>
      {/* Guarantees Header */}
      <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 border-y border-[#0A2540]/10 py-3.5">
        {guarantees.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/55"
          >
            <span aria-hidden="true" className="size-1 bg-[#A82020]" />
            {item}
          </span>
        ))}
      </div>

      {/* Tabs Kategori Kotak Presisi (Thick Border) */}
      {!loading && categoryFilters.length > 0 && (
        <div
          role="group"
          aria-label="Filter kategori tarif"
          className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:flex-wrap"
        >
          {/* Tab Semua */}
          <button
            type="button"
            aria-pressed={activeTab === "all"}
            onClick={() => goToTab("all")}
            className={`group inline-flex shrink-0 items-center gap-2 border-2 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 active:scale-95 ${focusRing} ${
              activeTab === "all"
                ? "border-[#A82020] bg-[#A82020] text-white shadow-sm font-semibold"
                : "border-[#0A2540]/20 bg-white text-[#0A2540]/80 hover:border-[#A82020] hover:text-[#A82020] hover:bg-[#A82020]/5 shadow-2xs"
            }`}
          >
            <span>Semua</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                activeTab === "all"
                  ? "bg-white/25 text-white"
                  : "bg-[#0A2540]/5 text-[#0A2540]/65 group-hover:bg-[#A82020]/15 group-hover:text-[#A82020]"
              }`}
            >
              {items.length}
            </span>
          </button>

          {/* Tab Per Kategori */}
          {categoryFilters.map((cat) => {
            const active =
              activeTab.toLowerCase() === cat.name.toLowerCase() ||
              activeTab === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => goToTab(cat.name)}
                className={`group inline-flex shrink-0 items-center gap-2 border-2 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 active:scale-95 ${focusRing} ${
                  active
                    ? "border-[#A82020] bg-[#A82020] text-white shadow-sm font-semibold"
                    : "border-[#0A2540]/20 bg-white text-[#0A2540]/80 hover:border-[#A82020] hover:text-[#A82020] hover:bg-[#A82020]/5 shadow-2xs"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                    active
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
      )}

      {/* Tabel Data Tarif Estetik & Presisi */}
      <div className="mt-5 overflow-hidden border border-[#0A2540]/15 bg-white shadow-xs">
        {/* Garis Aksen Merah Signature CV Win Teknik Mandiri */}
        <span
          aria-hidden="true"
          className="block h-[2.5px] w-full bg-[#A82020]"
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Tabel estimasi harga layanan CV Win Teknik Mandiri
            </caption>

            <thead>
              <tr className="border-b-2 border-b-[#0A2540] bg-[#F4FAFE]">
                <th
                  scope="col"
                  className="w-12 px-3.5 py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0A2540]/70"
                >
                  No
                </th>
                <th
                  scope="col"
                  className="min-w-[200px] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0A2540]/70"
                >
                  Layanan & Spesifikasi
                </th>
                <th
                  scope="col"
                  className="hidden w-36 border-l border-l-[#0A2540]/10 px-3.5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0A2540]/70 sm:table-cell"
                >
                  Kategori
                </th>
                <th
                  scope="col"
                  className="hidden w-28 border-l border-l-[#0A2540]/10 px-3.5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0A2540]/70 md:table-cell"
                >
                  Satuan
                </th>
                <th
                  scope="col"
                  className="w-32 border-l border-l-[#0A2540]/10 px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0A2540]/70 sm:w-40"
                >
                  Estimasi Biaya
                </th>
                <th
                  scope="col"
                  className="w-24 border-l border-l-[#0A2540]/10 px-3.5 py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0A2540]/70 sm:w-28"
                >
                  Pesan
                </th>
              </tr>
            </thead>

            <tbody
              key={`${activeTab}-${currentPage}`}
              className="animate-in fade-in duration-200"
            >
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[#0A2540]/10 animate-pulse">
                    <td className="px-3.5 py-3.5 text-center">
                      <div className="mx-auto h-3 w-4 bg-slate-200" />
                    </td>
                    <td className="px-4 py-3.5 space-y-1.5">
                      <div className="h-4 w-48 bg-slate-200" />
                      <div className="h-3 w-32 bg-slate-100" />
                    </td>
                    <td className="hidden px-3.5 py-3.5 sm:table-cell">
                      <div className="h-4 w-20 bg-slate-100" />
                    </td>
                    <td className="hidden px-3.5 py-3.5 md:table-cell">
                      <div className="h-4 w-12 bg-slate-100" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="ml-auto h-4 w-24 bg-slate-200" />
                    </td>
                    <td className="px-3.5 py-3.5 text-center">
                      <div className="mx-auto h-7 w-16 bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-xs text-slate-400"
                  >
                    Belum ada data tarif pada kategori ini.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => {
                  const unitText = row.unit
                    ? row.unit.startsWith("/")
                      ? row.unit
                      : `/${row.unit}`
                    : "/unit";

                  return (
                    <tr
                      key={row.id}
                      className={`group transition-colors duration-150 hover:bg-[#F4FAFE] hover:shadow-[inset_3px_0_0_0_#A82020] ${
                        index % 2 === 1 ? "bg-[#FBFDFF]" : "bg-white"
                      } border-b border-[#0A2540]/10 last:border-b-0`}
                    >
                      {/* Nomor Urut */}
                      <td className="px-3.5 py-3 text-center align-middle font-mono text-[11px] tabular-nums text-[#0A2540]/45">
                        {String(start + index + 1).padStart(2, "0")}
                      </td>

                      {/* Judul & Deskripsi */}
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={waLink(
                            `Halo CV Win Teknik Mandiri, saya ingin menanyakan tarif layanan: ${row.title} (${row.price || "Penawaran"}).`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link block"
                        >
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-xs sm:text-[13.5px] font-semibold text-[#0A2540] transition-colors group-hover/link:text-[#A82020]">
                              {row.title}
                            </span>
                            <ArrowUpRight
                              className="size-3 shrink-0 -translate-x-1 text-[#A82020] opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100"
                              aria-hidden="true"
                            />
                          </span>
                          {row.description && (
                            <span className="mt-0.5 line-clamp-1 block text-[11px] text-[#0A2540]/55">
                              {row.description}
                            </span>
                          )}
                        </Link>
                      </td>

                      {/* Kategori Badge */}
                      <td className="hidden border-l border-l-[#0A2540]/10 px-3.5 py-3 align-middle sm:table-cell">
                        <span className="border border-[#0A2540]/15 bg-slate-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#0A2540]/70">
                          {row.category_name || "Layanan"}
                        </span>
                      </td>

                      {/* Satuan */}
                      <td className="hidden border-l border-l-[#0A2540]/10 px-3.5 py-3 align-middle font-mono text-[11px] text-[#0A2540]/65 md:table-cell">
                        {unitText}
                      </td>

                      {/* Estimasi Biaya */}
                      <td className="border-l border-l-[#0A2540]/10 px-4 py-3 text-right align-middle">
                        {row.price ? (
                          <>
                            <span className="whitespace-nowrap font-mono text-xs sm:text-[14px] font-bold tabular-nums text-[#A82020]">
                              {row.price}
                            </span>
                            <span className="mt-0.5 block font-mono text-[9.5px] text-[#0A2540]/45 md:hidden">
                              {unitText}
                            </span>
                          </>
                        ) : (
                          <span className="whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-[#A82020]">
                            Minta Penawaran
                          </span>
                        )}
                      </td>

                      {/* Tombol Aksi Langsung (Pesan) */}
                      <td className="border-l border-l-[#0A2540]/10 px-3.5 py-3 text-center align-middle">
                        <WhatsAppOrderButton
                          category={row.category_name || "Layanan"}
                          service={row.title}
                          price={row.price ? `${row.price} ${unitText}`.trim() : "Penawaran"}
                          serviceId={row.id}
                          categoryId={row.category_id}
                          label="Pesan"
                          className="bg-[#A82020] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-2xs transition-all hover:bg-[#8e1919] active:scale-95"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="flex flex-col gap-3 border-t border-[#0A2540]/15 bg-[#FBFDFF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A2540]/55"
          >
            Menampilkan {rows.length === 0 ? 0 : String(start + 1).padStart(2, "0")}–
            {String(end).padStart(2, "0")} dari {rows.length} layanan terdaftar
          </p>

          <div className="flex items-center gap-1.5">
            {pageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className={`inline-flex size-8 items-center justify-center border border-[#0A2540]/20 bg-white text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] disabled:cursor-not-allowed disabled:opacity-30 ${focusRing}`}
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </button>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-label={`Halaman ${pageNumber}`}
                      aria-current={pageNumber === currentPage ? "page" : undefined}
                      className={`inline-flex size-8 items-center justify-center border font-mono text-[10px] transition-colors ${
                        pageNumber === currentPage
                          ? "border-2 border-[#A82020] bg-[#A82020] font-bold text-white shadow-2xs"
                          : "border border-[#0A2540]/20 bg-white text-[#0A2540]/70 hover:border-[#A82020] hover:text-[#A82020]"
                      } ${focusRing}`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  aria-label="Halaman berikutnya"
                  className={`inline-flex size-8 items-center justify-center border border-[#0A2540]/20 bg-white text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] disabled:cursor-not-allowed disabled:opacity-30 ${focusRing}`}
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Catatan Bawah */}
      <div className="mt-8 flex flex-col gap-4 border-t border-[#0A2540]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[11px] leading-relaxed text-[#0A2540]/60">
          Harga estimasi untuk wilayah Kediri Raya, belum termasuk pekerjaan
          tambahan di luar daftar. Biaya final dikonfirmasi setelah pengecekan
          atau survei lokasi. Pengadaan unit, ducting, dan kontrak maintenance
          mengikuti penawaran resmi.
        </p>

        <Link
          href={waLink(
            "Halo CV Win Teknik Mandiri, saya ingin meminta pricelist lengkap dan penawaran resmi."
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex shrink-0 items-center justify-center gap-2 bg-[#A82020] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
        >
          <MessageCircle className="size-3.5" aria-hidden="true" />
          <span>Minta pricelist lengkap</span>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
