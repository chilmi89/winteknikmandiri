"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let active = true;
    async function load() {
      const [cats, itms] = await Promise.all([
        fetchServiceCategories(),
        fetchServiceItems(),
      ]);
      if (active) {
        setCategories(cats);
        setItems(itms);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Filter items berdasarkan activeTab (kategori ID)
  const rows =
    activeTab === "all"
      ? items
      : items.filter((row) => row.category_id === activeTab);

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

      {/* Tabs Kategori Dinamis */}
      <div
        role="group"
        aria-label="Filter kategori tarif"
        className="mt-5 flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible no-scrollbar"
      >
        {/* Tab Semua */}
        <button
          type="button"
          aria-pressed={activeTab === "all"}
          onClick={() => goToTab("all")}
          className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors sm:px-3 ${
            activeTab === "all"
              ? "border-[#A82020] bg-[#A82020] text-white"
              : "border-[#0A2540]/15 bg-white text-[#0A2540]/65 hover:border-[#A82020]/40 hover:text-[#A82020]"
          } ${focusRing}`}
        >
          Semua
          <span
            className={`font-mono text-[9px] ${
              activeTab === "all" ? "text-white/70" : "text-[#0A2540]/35"
            }`}
          >
            {items.length}
          </span>
        </button>

        {/* Tab Per Kategori */}
        {categories.map((cat) => {
          const active = cat.id === activeTab;
          const count = items.filter((it) => it.category_id === cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={active}
              onClick={() => goToTab(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors sm:px-3 ${
                active
                  ? "border-[#A82020] bg-[#A82020] text-white"
                  : "border-[#0A2540]/15 bg-white text-[#0A2540]/65 hover:border-[#A82020]/40 hover:text-[#A82020]"
              } ${focusRing}`}
            >
              {cat.name}
              <span
                className={`font-mono text-[9px] ${
                  active ? "text-white/70" : "text-[#0A2540]/35"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabel Data Tarif */}
      <div className="mt-4 overflow-hidden border border-[#0A2540]/15 bg-white">
        <span
          aria-hidden="true"
          className="block h-[2px] w-full bg-[#A82020]"
        />

        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Tabel estimasi harga layanan CV Win Teknik Mandiri
          </caption>

          <thead>
            <tr>
              <th
                scope="col"
                className="hidden w-12 border-b-2 border-b-[#0A2540] bg-[#F4FAFE] px-3 py-3 font-mono text-[9px] font-normal uppercase tracking-[0.18em] text-[#0A2540]/45 sm:table-cell"
              >
                No
              </th>
              <th
                scope="col"
                className="border-b-2 border-b-[#0A2540] bg-[#F4FAFE] px-3 py-3 font-mono text-[9px] font-normal uppercase tracking-[0.18em] text-[#0A2540]/45 sm:px-4"
              >
                Layanan
              </th>
              <th
                scope="col"
                className="hidden w-28 border-b-2 border-b-[#0A2540] border-l border-l-[#0A2540]/10 bg-[#F4FAFE] px-3 py-3 font-mono text-[9px] font-normal uppercase tracking-[0.18em] text-[#0A2540]/45 md:table-cell"
              >
                Satuan
              </th>
              <th
                scope="col"
                className="w-28 border-b-2 border-b-[#0A2540] border-l border-l-[#0A2540]/10 bg-[#F4FAFE] px-3 py-3 text-right font-mono text-[9px] font-normal uppercase tracking-[0.18em] text-[#0A2540]/45 sm:w-36"
              >
                Estimasi biaya
              </th>
            </tr>
          </thead>

          <tbody
            key={`${activeTab}-${currentPage}`}
            className="animate-in fade-in duration-300 motion-reduce:animate-none"
          >
            {pageRows.map((row, index) => (
              <tr
                key={row.id}
                className={`group transition-colors duration-200 hover:bg-[#F4FAFE] hover:shadow-[inset_2px_0_0_0_#A82020] [&:last-child>td]:border-b-0 ${
                  index % 2 === 1 ? "bg-[#FBFDFF]" : "bg-white"
                }`}
              >
                <td className="hidden border-b border-[#0A2540]/10 px-3 py-3 align-middle font-mono text-[10px] tabular-nums text-[#0A2540]/35 sm:table-cell">
                  {String(start + index + 1).padStart(2, "0")}
                </td>

                <td className="border-b border-[#0A2540]/10 px-3 py-3 align-middle sm:px-4">
                  <Link
                    href={waLink(
                      `Halo CV Win Teknik Mandiri, saya ingin menanyakan tarif layanan: ${row.title} (${row.price || "Penawaran"}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Tanyakan tarif ${row.title} via WhatsApp`}
                    className={`group/link block ${focusRing}`}
                  >
                    <span className="flex items-baseline gap-1.5">
                      <span className="line-clamp-1 text-[13px] font-semibold leading-5 text-[#0A2540] transition-colors duration-200 group-hover:text-[#A82020] sm:text-[13.5px]">
                        {row.title}
                      </span>
                      <ArrowUpRight
                        className="size-3 shrink-0 -translate-x-1 text-[#A82020] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      title={row.description}
                      className="mt-0.5 line-clamp-1 block text-[11px] leading-5 text-[#0A2540]/50"
                    >
                      {row.description}
                    </span>
                  </Link>
                </td>

                <td className="hidden border-b border-l border-[#0A2540]/10 px-3 py-3 align-middle text-[11px] leading-5 text-[#0A2540]/50 md:table-cell">
                  {row.unit || "/ unit"}
                </td>

                <td className="border-b border-l border-[#0A2540]/10 px-3 py-3 text-right align-middle">
                  {row.price ? (
                    <>
                      <span className="whitespace-nowrap text-[13px] font-semibold tabular-nums tracking-tight text-[#A82020] sm:text-[13.5px]">
                        {row.price}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#0A2540]/40 md:hidden">
                        {row.unit}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#A82020]">
                        Minta penawaran
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#0A2540]/40 md:hidden">
                        sesuai kebutuhan
                      </span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination & Footer */}
        <div className="flex flex-col gap-3 border-t border-[#0A2540]/15 bg-[#FBFDFF] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p
            aria-live="polite"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/45"
          >
            Menampilkan {String(start + 1).padStart(2, "0")}–
            {String(end).padStart(2, "0")} dari {rows.length} item
          </p>

          <div className="flex items-center gap-1.5">
            {pageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className={`inline-flex size-8 items-center justify-center border border-[#0A2540]/15 bg-white text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] disabled:cursor-not-allowed disabled:opacity-30 ${focusRing}`}
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
                          ? "border-[#A82020] bg-[#A82020] text-white"
                          : "border-[#0A2540]/15 bg-white text-[#0A2540]/70 hover:border-[#A82020] hover:text-[#A82020]"
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
                  className={`inline-flex size-8 items-center justify-center border border-[#0A2540]/15 bg-white text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] disabled:cursor-not-allowed disabled:opacity-30 ${focusRing}`}
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
        <p className="max-w-2xl text-[11px] leading-5 text-[#0A2540]/50">
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
          className={`inline-flex shrink-0 items-center justify-center gap-2 bg-[#A82020] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
        >
          <MessageCircle className="size-3.5" aria-hidden="true" />
          Minta pricelist lengkap
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
