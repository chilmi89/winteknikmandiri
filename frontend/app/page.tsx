import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import HomeProducts from "@/components/HomeProducts";
import HomeServices from "@/components/HomeServices";
import FaqAccordion from "@/components/FaqAccordion";
import SiteFooter from "@/components/SiteFooter";
import ParallaxMedia from "@/components/ParallaxMedia";
import PricingTable from "@/components/PricingTable";
import ContactCta from "@/components/ContactCta";
import SectionHeading from "@/components/SectionHeading";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service AC Kediri #1 Bergaransi & Kontraktor AC Komersial | CV Win Teknik Mandiri",
  description:
    "Jasa service AC Kediri panggilan cepat & kontraktor AC komersial. Melayani cuci AC rumah higienis, bongkar pasang standar vakum, isi freon murni, perbaikan kompresor/PCB di seluruh Kota & Kabupaten Kediri bergaransi tertulis 30 hari.",
  keywords: [
    "service ac kediri",
    "ac kediri",
    "jasa service ac kediri",
    "service ac panggilan kediri",
    "cuci ac kediri",
    "pasang ac kediri",
    "bongkar pasang ac kediri",
    "isi freon ac kediri",
    "tambah freon ac kediri",
    "kontraktor ac kediri",
    "tukang ac kediri",
    "teknisi ac kediri",
    "service ac terdekat kediri",
    "service ac murah kediri",
    "service ac ngadiluwih",
    "service ac pare kediri",
    "service ac mojoroto",
    "service ac pesantren kediri",
    "service ac kras kediri",
    "service ac kandat",
    "service ac wates kediri",
    "service ac gurah",
  ],
  alternates: {
    canonical: "/",
  },
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0A2540]"
      >
        Lewati ke konten
      </a>

      <Navbar variant="overlay" />

      <main id="main">
        <HeroSection />
        <StatsBar />
        <HomeProducts />
        <HomeServices />

        <section
          id="profil"
          className="scroll-mt-20 border-y border-[#0A2540]/10 bg-[#F4FAFE] py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    <ParallaxMedia
                      speed={0.05}
                      scale={1.08}
                      className="absolute inset-0"
                    >
                      <Image
                        src="/images/wtm-pemasangan.jpg"
                        alt="Dua teknisi memasang unit AC split di ruang tamu"
                        fill
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="object-cover"
                      />
                    </ParallaxMedia>
                  </div>
                  <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A2540]/45">
                    Pemasangan unit split
                  </figcaption>
                </figure>
              </div>

              <div className="lg:col-span-6">
                <SectionHeading
                  index="03"
                  eyebrow="Profil"
                  title="Layanan dengan administrasi yang jelas."
                  accent="administrasi yang jelas."
                  description="CV Win Teknik Mandiri berdiri sejak 2014 dan menangani proyek tata udara di Kediri Raya. Kami bekerja sebagai badan usaha resmi dengan prosedur dan garansi tertulis."
                />

                <dl className="mt-8 border-t border-[#0A2540]/10">
                  <div className="grid gap-1 border-b border-[#0A2540]/10 py-3.5 sm:grid-cols-[9rem_1fr] sm:items-baseline">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A2540]/45">
                      Badan usaha
                    </dt>
                    <dd className="text-sm font-medium text-[#0A2540]">
                      CV Win Teknik Mandiri
                    </dd>
                  </div>

                  <div className="grid gap-1 border-b border-[#0A2540]/10 py-3.5 sm:grid-cols-[9rem_1fr] sm:items-baseline">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A2540]/45">
                      Status Legalitas
                    </dt>
                    <dd className="text-sm font-medium text-[#0A2540]">
                      Badan Usaha Resmi Terdaftar & Terverifikasi
                    </dd>
                  </div>

                  <div className="grid gap-1 border-b border-[#0A2540]/10 py-3.5 sm:grid-cols-[9rem_1fr] sm:items-baseline">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A2540]/45">
                      Mitra
                    </dt>
                    <dd className="text-sm text-[#0A2540]">
                      20+ perusahaan dan instansi
                    </dd>
                  </div>
                </dl>

                <Link
                  href="/tentang-kami"
                  className={`group mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#A82020] ${focusRing}`}
                >
                  Profil perusahaan
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="biaya"
          className="scroll-mt-20 border-b border-[#0A2540]/10 bg-white py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <SectionHeading
                index="04"
                eyebrow="Tarif & Estimasi"
                title="Tabel harga transparan, tanpa biaya tersembunyi."
                accent="tanpa biaya tersembunyi."
                description="Rincian tarif per jenis pekerjaan, dari cuci AC hingga pengadaan unit dan ducting. Harga dapat berubah setelah survei lokasi."
                titleId="biaya-title"
                className="max-w-2xl"
              />

              <Link
                href={waLink(
                  "Halo CV Win Teknik Mandiri, saya ingin konsultasi tarif dan jadwal pengerjaan."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#A82020] transition-colors ${focusRing}`}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Konsultasi tarif
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <PricingTable />
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <SectionHeading
                    index="06"
                    eyebrow="FAQ"
                    title="Pertanyaan yang sering diajukan."
                    accent="sering diajukan."
                    description="Belum menemukan jawabannya? Tim kami siap membantu."
                    titleId="faq-title"
                  />

                  <Link
                    href={waLink(
                      "Halo CV Win Teknik Mandiri, saya ingin bertanya mengenai layanan AC."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#A82020] ${focusRing}`}
                  >
                    Tanya langsung
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-8">
                <FaqAccordion />
              </div>
            </div>
          </div>
        </section>

        <ContactCta />
      </main>

      <SiteFooter activeHref="/" />
    </>
  );
}
