"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import {
  defaultPilarLayanan,
  fetchPilarLayanan,
  type PilarLayananItem,
} from "@/lib/pilarLayanan";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ACFF8]";

export default function HomeServices() {
  const [items, setItems] = useState<PilarLayananItem[]>(defaultPilarLayanan);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchPilarLayanan();
      if (active && Array.isArray(data) && data.length > 0) {
        setItems(data);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="layanan" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            index="02"
            eyebrow="Pilar Layanan"
            title="Lima pilar, satu standar pengerjaan."
            accent="satu standar pengerjaan."
            description="Dari pengadaan unit hingga fabrikasi ducting, setiap pekerjaan mengikuti perhitungan beban, prosedur pemipaan, dan uji serah terima."
            titleId="layanan-title"
            className="max-w-2xl"
          />

          <Link
            href="/layanan"
            className={`group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#0A2540] transition-colors hover:text-[#A82020] ${focusRing}`}
          >
            Halaman layanan
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const isExternal =
              item.link_url.startsWith("http://") ||
              item.link_url.startsWith("https://");

            const codeDisplay = item.code || String(index + 1).padStart(2, "0");

            if (item.is_featured) {
              return (
                <Link
                  key={item.id || index}
                  href={item.link_url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`group flex min-h-[228px] flex-col justify-between border border-[#8e1919] bg-[#A82020] p-6 transition-colors hover:bg-[#8e1919] sm:p-7 ${focusRing}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-white/70">
                      {codeDisplay}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-white/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-10">
                    <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      {item.description}
                    </p>
                    {item.cta_text ? (
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
                        <MessageCircle className="size-4" aria-hidden="true" />
                        {item.cta_text}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.id || index}
                href={item.link_url}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={`group flex min-h-[228px] flex-col justify-between border border-[#0A2540]/10 bg-[#F7FBFE] p-6 transition-colors hover:border-[#A82020]/40 hover:bg-white sm:p-7 ${focusRing}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-[#A82020]">
                    {codeDisplay}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-[#0A2540]/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A82020]"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-10">
                  <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#0A2540] transition-colors group-hover:text-[#A82020]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#0A2540]/60">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
