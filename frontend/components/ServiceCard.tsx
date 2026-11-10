"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceItem } from "@/lib/katalogLayanan";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

type ServiceCardProps = {
  item: ServiceItem;
  reversed?: boolean;
};

export default function ServiceCard({
  item,
  reversed = false,
}: ServiceCardProps) {
  const code = item.category_code || "01";
  const category = item.category_name || "Layanan";

  return (
    <article
      id={item.id}
      aria-labelledby={`${item.id}-title`}
      className="scroll-mt-36 py-12 sm:py-16"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        {/* Foto Layanan (Auto WebP) */}
        <div
          className={`lg:col-span-5 ${reversed ? "lg:order-2" : "lg:order-1"}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#0A2540]/10 bg-[#0A2540] shadow-sm">
            <Image
              src={item.image_url || "/images/ac-split-clean.jpg"}
              alt={item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          </div>
        </div>

        {/* Konten Keterangan Layanan */}
        <div
          className={`lg:col-span-7 ${reversed ? "lg:order-1" : "lg:order-2"}`}
        >
          {/* Header Nomor & Kategori */}
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A82020] sm:text-[11px] font-semibold">
            {code} · {category}
          </p>

          {/* Judul Layanan */}
          <h2
            id={`${item.id}-title`}
            className="mt-2 text-balance text-2xl font-semibold leading-snug tracking-[-0.02em] text-[#0A2540] sm:text-[1.9rem]"
          >
            {item.title}
          </h2>

          {/* Deskripsi */}
          {item.description && (
            <p className="mt-2 max-w-lg text-[13.5px] leading-6 text-[#0A2540]/60 sm:text-[15px] sm:leading-7">
              {item.description}
            </p>
          )}

          {/* 3 Kotak Poin Highlights Merah */}
          {item.highlights && item.highlights.length > 0 && (
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#0A2540]/65 sm:text-[12.5px]">
              {item.highlights.map((h, i) => (
                <li key={i} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 bg-[#A82020] shrink-0"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Harga & Satuan */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-[#0A2540]/10 pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/45 sm:text-[10px]">
              {item.price_prefix || "Mulai dari"}
            </span>
            {item.price ? (
              <span className="text-xl font-bold tabular-nums tracking-tight text-[#A82020] sm:text-[24px]">
                {item.price}
              </span>
            ) : (
              <span className="text-sm font-semibold text-[#A82020] sm:text-base">
                Minta penawaran
              </span>
            )}
            <span className="text-[10.5px] text-[#0A2540]/50 sm:text-xs">
              {item.unit || "/ unit"}
            </span>
          </div>

          {/* Catatan Variasi Harga */}
          {item.price_note ? (
            <p className="mt-1 text-[10.5px] leading-5 text-[#0A2540]/50 sm:text-[11.5px]">
              {item.price_note}
            </p>
          ) : null}

          {/* Tombol Pesan Layanan (WhatsApp Order Trigger) & Tanya Dulu */}
          <div className="mt-5 flex flex-wrap items-center gap-3.5">
            <WhatsAppOrderButton
              category={category}
              service={item.title}
              price={item.price ? `${item.price} ${item.unit}` : "Penawaran"}
              serviceId={item.id}
              categoryId={item.category_id}
              className={`rounded-lg bg-[#A82020] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white shadow-xs transition-all duration-200 hover:bg-[#8e1919] hover:shadow-md active:scale-95 sm:px-5 sm:py-3 sm:text-[11px] ${focusRing}`}
            />

            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE || "6281216622840"}?text=${encodeURIComponent(
                "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan proyek AC dan ducting. Apakah saya bisa mendapatkan informasi lebih lanjut terkait layanan dan penawaran yang tersedia? Terima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0A2540]/65 transition-colors hover:text-[#A82020] sm:text-[11px] inline-flex items-center gap-1.5 ${focusRing}`}
            >
              <span>Tanya Dulu</span>
              <ArrowUpRight className="size-3 text-[#0A2540]/40" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
