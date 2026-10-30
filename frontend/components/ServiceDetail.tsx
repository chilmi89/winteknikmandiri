import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  MessageCircle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { ServiceDetailItem } from "@/lib/services";
import { waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

type ServiceDetailProps = {
  service: ServiceDetailItem;
  reversed?: boolean;
};

export default function ServiceDetail({
  service,
  reversed = false,
}: ServiceDetailProps) {
  return (
    <article
      id={service.id}
      aria-labelledby={`${service.id}-title`}
      className="scroll-mt-36 py-12 sm:py-16"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div
          className={`lg:col-span-5 ${reversed ? "lg:order-2" : "lg:order-1"}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden border border-[#0A2540]/10 bg-[#0A2540]">
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover"
            />
          </div>
        </div>

        <div
          className={`lg:col-span-7 ${reversed ? "lg:order-1" : "lg:order-2"}`}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A82020] sm:text-[11px]">
            {service.number} · {service.category}
          </p>

          <h2
            id={`${service.id}-title`}
            className="mt-2 text-balance text-2xl font-semibold leading-snug tracking-[-0.02em] text-[#0A2540] sm:text-[1.9rem]"
          >
            {service.title}
          </h2>

          <p className="mt-2 max-w-lg text-[13.5px] leading-6 text-[#0A2540]/60 sm:text-[15px] sm:leading-7">
            {service.summary}
          </p>

          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#0A2540]/55 sm:text-[12.5px]">
            {service.highlights.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1 bg-[#A82020]"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-[#0A2540]/10 pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/45 sm:text-[10px]">
              {service.pricePrefix}
            </span>
            {service.price ? (
              <span className="text-lg font-semibold tabular-nums tracking-tight text-[#A82020] sm:text-[22px]">
                {service.price}
              </span>
            ) : (
              <span className="text-sm font-semibold text-[#A82020] sm:text-base">
                Sesuai kebutuhan
              </span>
            )}
            <span className="text-[10.5px] text-[#0A2540]/50 sm:text-xs">
              {service.unit}
            </span>
          </div>

          {service.priceNote ? (
            <p className="mt-1 text-[10.5px] leading-5 text-[#0A2540]/40 sm:text-[11.5px]">
              {service.priceNote}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={waLink(service.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 bg-[#A82020] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8e1919] sm:px-5 sm:py-3 sm:text-[11px] ${focusRing}`}
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              Pesan layanan
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>

            <Link
              href="/#biaya"
              className={`text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0A2540]/55 transition-colors hover:text-[#A82020] sm:text-[11px] ${focusRing}`}
            >
              Lihat tarif
            </Link>
          </div>

          <details className="group/details mt-5 border-t border-[#0A2540]/10 pt-3">
            <summary
              className={`inline-flex cursor-pointer list-none items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/45 transition-colors hover:text-[#A82020] sm:text-[10px] [&::-webkit-details-marker]:hidden ${focusRing}`}
            >
              <Plus
                className="size-3 transition-transform duration-300 group-open/details:rotate-45"
                aria-hidden="true"
              />
              Detail pengerjaan
            </summary>

            <div className="mt-4">
              <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-[11.5px] leading-5 text-[#0A2540]/65 sm:text-[12.5px] sm:leading-6"
                  >
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-[#A82020]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-start gap-2 border-l-2 border-[#A82020] bg-white px-3 py-2">
                <ShieldCheck
                  className="mt-0.5 size-3.5 shrink-0 text-[#A82020]"
                  aria-hidden="true"
                />
                <p className="text-[11px] leading-5 text-[#0A2540]/65 sm:text-[12px]">
                  {service.recommendation}
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}
