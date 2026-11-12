import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import ServicesClientList from "@/components/ServicesClientList";
import ContactCta from "@/components/ContactCta";
import SiteFooter from "@/components/SiteFooter";
import FloatingTechnicianBadge from "@/components/FloatingTechnicianBadge";
import SectionHeading from "@/components/SectionHeading";
import { serviceDetails } from "@/lib/services";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service AC Kediri & Tarif Biaya Cuci, Pasang, Freon 2026 | CV Win Teknik Mandiri",
  description:
    "Daftar lengkap layanan & biaya service AC Kediri: cuci AC rumah split higienis, bongkar pasang standar vakum, isi freon murni R32/R410A, dan kontraktor AC komersial VRF bergaransi tertulis 30 hari.",
  keywords: [
    "service ac kediri",
    "biaya service ac kediri",
    "tarif cuci ac kediri",
    "harga pasang ac kediri",
    "isi freon ac kediri",
    "jasa ac kediri",
    "ac kediri",
    "kontraktor ac kediri",
    "cuci ac kediri",
    "pasang ac kediri",
    "service ac panggilan kediri",
  ],
  alternates: {
    canonical: "/layanan",
  },
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

const facts = [
  { label: "Berdiri", value: "Sejak 2014" },
  { label: "Garansi", value: "30 hari tertulis" },
  { label: "Area", value: "Kediri Raya" },
];

export default function LayananPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0A2540]"
      >
        Lewati ke konten
      </a>

      <Navbar />

      <main id="main" className="pt-20">
        <section
          aria-labelledby="layanan-title"
          className="border-b border-[#0A2540]/10 bg-[#8ACFF8]/20"
        >
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A2540]/45 sm:text-[11px]">
                <li>
                  <Link
                    href="/"
                    className={`transition-colors hover:text-[#A82020] ${focusRing}`}
                  >
                    Beranda
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[#0A2540]/70">
                  Layanan
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <SectionHeading
                  as="h1"
                  index="01"
                  eyebrow="Layanan"
                  title="Enam layanan, satu standar pengerjaan."
                  accent="satu standar pengerjaan."
                  description="Dari cuci AC sampai kontrak maintenance, semuanya dikerjakan dengan prosedur yang sama."
                  titleId="layanan-title"
                  className="max-w-3xl"
                />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={waLink(
                      "Halo CV Win Teknik Mandiri, saya ingin konsultasi layanan AC di Kediri."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 bg-[#A82020] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Konsultasi via WhatsApp
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>

                  <Link
                    href="/#biaya"
                    className={`inline-flex items-center justify-center gap-2 border border-[#0A2540]/15 px-5 py-3.5 text-sm font-medium text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] ${focusRing}`}
                  >
                    Lihat tabel tarif
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="flex justify-center lg:justify-end">
                  <Image
                    src="/logo/logo_wtm.png"
                    alt="Logo CV Win Teknik Mandiri"
                    width={500}
                    height={415}
                    preload
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 320px, 380px"
                    className="h-auto w-full max-w-[260px] object-contain drop-shadow-[0_18px_40px_rgba(10,37,64,0.18)] sm:max-w-[320px] lg:max-w-[380px]"
                  />
                </div>
              </div>
            </div>

            <dl className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#0A2540]/10 pt-5">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline gap-2">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/40 sm:text-[10px]">
                    {fact.label}
                  </dt>
                  <dd className="text-[12px] font-medium text-[#0A2540] sm:text-[13px]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Komponen Daftar Kategori & Kartu Layanan Dinamis dari API */}
        <ServicesClientList />

        <ContactCta />
      </main>

      <SiteFooter activeHref="/layanan" />
      <FloatingTechnicianBadge />
    </>
  );
}
