"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { pricingGroups } from "@/lib/pricing";
import { waLink } from "@/lib/site";

const PAGE_SIZE = 6;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const guarantees = [
  "Harga estimasi area Kediri",
  "Garansi tertulis 30 hari",
  "Survei & konsultasi gratis",
];

type FlatRow = {
  key: string;
  number: number;
  category: string;
  name: string;
  detail: string;
  unit: string;
  price: string | null;
};

const allRows: FlatRow[] = [];
pricingGroups.forEach((group) => {
  group.rows.forEach((row, index) => {
    allRows.push({
      ...row,
      key: `${group.title}-${index}-${row.name}`,
      number: allRows.length + 1,
      category: group.title,
    });
  });
});

const tabs = [
  { label: "Semua", value: "all", count: allRows.length },
  ...pricingGroups.map((group) => ({
    label: group.title,
    value: group.title,
    count: group.rows.length,
  })),
];

export default function PricingTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const rows =
    activeTab === "all"
      ? allRows
      : allRows.filter((row) => row.category === activeTab);

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

      <div
        role="group"
        aria-label="Filter kategori tarif"
        className="mt-5 flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
      >
        {tabs.map((tab) => {
          const active = tab.value === activeTab;

          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => goToTab(tab.value)}
              className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors sm:px-3 ${
                active
                  ? "border-[#A82020] bg-[#A82020] text-white"
                  : "border-[#0A2540]/15 bg-white text-[#0A2540]/65 hover:border-[#A82020]/40 hover:text-[#A82020]"
              } ${focusRing}`}
            >
              {tab.label}
              <span
                className={`font-mono text-[9px] ${
                  active ? "text-white/70" : "text-[#0A2540]/35"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden border border-[#0A2540]/15 bg-white">
        <span
          aria-hidden="true"
          className="block h-[2px] w-full bg-[#A82020]"
        />

        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Tabel estimasi harga layanan CV Win Teknik Mandiri, {rows.length}{" "}
            item pada kategori{" "}
            {activeTab === "all" ? "semua layanan" : activeTab}.
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
                key={row.key}
                className={`group transition-colors duration-200 hover:bg-[#F4FAFE] hover:shadow-[inset_2px_0_0_0_#A82020] [&:last-child>td]:border-b-0 ${
                  index % 2 === 1 ? "bg-[#FBFDFF]" : "bg-white"
                }`}
              >
                <td className="hidden border-b border-[#0A2540]/10 px-3 py-3 align-middle font-mono text-[10px] tabular-nums text-[#0A2540]/35 sm:table-cell">
                  {String(row.number).padStart(2, "0")}
                </td>

                <td className="border-b border-[#0A2540]/10 px-3 py-3 align-middle sm:px-4">
                  <Link
                    href={waLink(
                      `Halo CV Win Teknik Mandiri, saya ingin menanyakan tarif layanan: ${row.name}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Tanyakan tarif ${row.name} via WhatsApp`}
                    className={`group/link block ${focusRing}`}
                  >
                    <span className="flex items-baseline gap-1.5">
                      <span className="line-clamp-1 text-[13px] font-semibold leading-5 text-[#0A2540] transition-colors duration-200 group-hover:text-[#A82020] sm:text-[13.5px]">
                        {row.name}
                      </span>
                      <ArrowUpRight
                        className="size-3 shrink-0 -translate-x-1 text-[#A82020] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      title={row.detail}
                      className="mt-0.5 line-clamp-1 block text-[11px] leading-5 text-[#0A2540]/50"
                    >
                      {row.detail}
                    </span>
                  </Link>
                </td>

                <td className="hidden border-b border-l border-[#0A2540]/10 px-3 py-3 align-middle text-[11px] leading-5 text-[#0A2540]/50 md:table-cell">
                  {row.unit}
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

        <div className="flex flex-col gap-3 border-t border-[#0A2540]/15 bg-[#FBFDFF] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p
            aria-live="polite"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/45"
          >
            Menampilkan {String(start + 1).padStart(2, "0")}–
            {String(end).padStart(2, "0")} dari {rows.length} item
          </p>

          <div className="flex items-center gap-1.5">
            {pageCount > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className={`inline-flex size-8 items-center justify-center border border-[#0A2540]/15 bg-white text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#0A2540]/15 disabled:hover:text-[#0A2540] ${focusRing}`}
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </button>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                  (pageNumber) => {
                    const active = pageNumber === currentPage;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        aria-label={`Halaman ${pageNumber}`}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex size-8 items-center justify-center border font-mono text-[10px] transition-colors ${
                          active
                            ? "border-[#A82020] bg-[#A82020] text-white"
                            : "border-[#0A2540]/15 bg-white text-[#0A2540]/70 hover:border-[#A82020] hover:text-[#A82020]"
                        } ${focusRing}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  aria-label="Halaman berikutnya"
                  className={`inline-flex size-8 items-center justify-center border border-[#0A2540]/15 bg-white text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#0A2540]/15 disabled:hover:text-[#0A2540] ${focusRing}`}
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/30">
                Halaman tunggal
              </span>
            )}
          </div>
        </div>
      </div>

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
