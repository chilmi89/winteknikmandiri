import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import ContactCta from "@/components/ContactCta";
import FloatingTechnicianBadge from "@/components/FloatingTechnicianBadge";
import GalleryClient from "@/components/GalleryClient";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/SectionHeading";
import SiteFooter from "@/components/SiteFooter";
import CompanyFactsList from "@/components/CompanyFactsList";
import CompanyStatsCards from "@/components/CompanyStatsCards";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Galeri Proyek & Portofolio — CV Win Teknik Mandiri Kediri",
  description:
    "Dokumentasi pengerjaan proyek pendingin ruangan, instalasi AC VRF, fabrikasi ducting, dan maintenance komersial oleh CV Win Teknik Mandiri di Kediri Raya dan sekitarnya.",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

const facts = [
  { label: "Proyek Selesai", value: "364+ Proyek" },
  { label: "Proyek Berjalan", value: "36+ Proyek" },
  { label: "Mitra Korporasi", value: "20+ Perusahaan" },
  { label: "Garansi Resmi", value: "30 Hari Tertulis" },
];

const statistics = [
  {
    number: "364+",
    label: "Proyek Selesai",
    description:
      "Penanganan tata udara di sekolahan, tenant mall, fasilitas ibadah, dan kawasan industri.",
    badge: "Rekam Jejak",
  },
  {
    number: "36+",
    label: "Proyek Berjalan",
    description:
      "Pekerjaan instalasi baru dan kontrak pemeliharaan berkala aktif yang sedang ditangani.",
    badge: "Aktif 2026",
  },
  {
    number: "20+",
    label: "Mitra Korporasi",
    description:
      "Kemitraan jangka panjang dengan tenant ritel nasional, pengelola gedung, dan pabrik.",
    badge: "Kemitraan",
  },
  {
    number: "100%",
    label: "Standar SOP Pabrikan",
    description:
      "Prosedur vakum mesin 20 menit, flaring tembaga tanpa retak, dan uji serah terima digital.",
    badge: "Kualitas",
  },
];

export default function GaleriPage() {
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
        {/* HERO SECTION — Persis gaya header /layanan & /tentang-kami */}
        <section
          aria-labelledby="galeri-title"
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
                  Galeri Proyek
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <SectionHeading
                  as="h1"
                  index="01"
                  eyebrow="Portofolio & Rekam Jejak"
                  title="Dokumentasi pengerjaan proyek pendingin & tata udara."
                  accent="pendingin & tata udara."
                  description="Rekam jejak pengerjaan teknis nyata CV Win Teknik Mandiri di berbagai sektor: institusi pendidikan, gedung komersial, tenant retail mall, hingga fasilitas industri."
                  titleId="galeri-title"
                  className="max-w-3xl"
                />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={waLink(
                      "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai proyek AC atau ducting gedung saya."
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
                    href="/layanan"
                    className={`inline-flex items-center justify-center gap-2 border border-[#0A2540]/15 px-5 py-3.5 text-sm font-medium text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020] ${focusRing}`}
                  >
                    Lihat layanan kami
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

            <CompanyFactsList extraFactLabel="Garansi Resmi" extraFactValue="30 Hari Tertulis" />
          </div>
        </section>

        {/* SECTION 01 — BANNER REKAM JEJAK PROYEK (bg-white, Task 5.2 task.md) */}
        <section
          aria-labelledby="statistik-title"
          className="border-b border-[#0A2540]/10 bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="01"
              eyebrow="Statistik Portofolio"
              title="Kepercayaan yang terbangun dari hasil pengerjaan."
              accent="hasil pengerjaan."
              description="Setiap angka mencerminkan komitmen teknis, ketepatan jadwal, dan integritas tim CV Win Teknik Mandiri di lapangan."
              titleId="statistik-title"
            />

            <CompanyStatsCards className="mt-10" />
          </div>
        </section>

        {/* SECTION 02 — GALERI DOKUMENTASI & FILTER INTERAKTIF (bg-[#8ACFF8]/20, Task 5.3 task.md) */}
        <section
          id="galeri-grid"
          aria-labelledby="dokumentasi-title"
          className="border-b border-[#0A2540]/10 bg-[#8ACFF8]/20"
        >
          <div className="border-b border-[#0A2540]/10 bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <SectionHeading
                index="02"
                eyebrow="Dokumentasi Pekerjaan"
                title="Dokumentasi instalasi, fabrikasi, dan maintenance."
                accent="dan maintenance."
                description="Pilih kategori untuk memfilter dokumentasi pekerjaan teknis di lapangan. Klik foto untuk melihat detail resolusi penuh."
                titleId="dokumentasi-title"
              />
            </div>
          </div>

          {/* Client Filter & Lightbox Component */}
          <GalleryClient />
        </section>

        {/* CONTACT CTA — Konsisten dengan Home, Layanan & Tentang Kami */}
        <ContactCta />
      </main>

      <SiteFooter activeHref="/galeri" />
      <FloatingTechnicianBadge />
    </>
  );
}
