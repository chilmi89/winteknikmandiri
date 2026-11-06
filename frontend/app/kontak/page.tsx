import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import ContactForm from "@/components/ContactForm";
import FloatingTechnicianBadge from "@/components/FloatingTechnicianBadge";
import JamOperasionalCard from "@/components/JamOperasionalCard";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import SiteFooter from "@/components/SiteFooter";
import { socialBrandConfig } from "@/components/SocialIcons";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hubungi Kami — CV Win Teknik Mandiri Kediri",
  description:
    "Hubungi CV Win Teknik Mandiri di Ngadiluwih, Kediri. Layanan service AC, instalasi VRF, fabrikasi ducting, konsultasi teknis, dan survei lokasi bergaransi resmi.",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

const facts = [
  { label: "Respon Cepat", value: "Di Jam Operasional" },
  { label: "Hotline WhatsApp", value: site.phoneDisplay },
  { label: "Email Resmi", value: site.email },
  { label: "Area Layanan", value: "Kediri Raya & Jatim" },
];

export default function KontakPage() {
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
          aria-labelledby="kontak-hero-title"
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
                  Hubungi Kami
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <SectionHeading
                  as="h1"
                  index="01"
                  eyebrow="Hubungi Kami"
                  title="Konsultasi teknis, survei lokasi, dan penawaran resmi."
                  accent="dan penawaran resmi."
                  description="Hubungi tim teknis kami untuk kebutuhan instalasi AC baru, perawatan berkala, perbaikan darurat, maupun perencanaan proyek ducting gedung Anda."
                  titleId="kontak-hero-title"
                  className="max-w-3xl"
                />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={waLink(
                      "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC / tata udara."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 bg-[#A82020] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Chat WhatsApp Sekarang
                    <ArrowUpRight className="size-4" aria-hidden="true" />
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

        {/* SECTION 01 — KARTU KONTAK RESMI & FORM WHATSAPP CEPAT (bg-white) */}
        <section
          id="pesan"
          aria-labelledby="komunikasi-title"
          className="scroll-mt-28 border-b border-[#0A2540]/10 bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="01"
              eyebrow="Saluran Komunikasi"
              title="Hubungi tim teknisi atau kirim pesan cepat."
              accent="kirim pesan cepat."
              description="Pilih saluran komunikasi langsung di bawah ini atau isi formulir konsultasi untuk terhubung ke WhatsApp customer service CV WTM."
              titleId="komunikasi-title"
            />

            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Kolom Kiri: 4 Kartu Info Kontak Besar Ber-Hover Merah */}
              <div className="space-y-4 lg:col-span-5">
                {/* 1. WhatsApp Card */}
                <div className="group relative overflow-hidden border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.3),0_0_0_1px_rgba(168,32,32,0.2)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                  <span
                    aria-hidden="true"
                    className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                  />
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center bg-[#8ACFF8]/20 text-[#A82020] transition-colors group-hover:bg-[#A82020] group-hover:text-white">
                      <MessageCircle className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A82020]">
                        WhatsApp Resmi
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-[#0A2540] group-hover:text-[#A82020] transition-colors">
                        {site.phoneDisplay}
                      </h3>
                      <p className="mt-1 text-xs text-[#0A2540]/65">
                        Chat langsung untuk konsultasi, booking, dan respon cepat teknisi.
                      </p>
                      <Link
                        href={waLink("Halo CV Win Teknik Mandiri, saya ingin tanya layanan AC.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A82020] hover:text-[#8e1919]"
                      >
                        Buka Chat WhatsApp
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Email Card */}
                <div className="group relative overflow-hidden border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.3),0_0_0_1px_rgba(168,32,32,0.2)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                  <span
                    aria-hidden="true"
                    className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                  />
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center bg-[#8ACFF8]/20 text-[#A82020] transition-colors group-hover:bg-[#A82020] group-hover:text-white">
                      <Mail className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A82020]">
                        Email Korespondensi B2B
                      </p>
                      <h3 className="mt-1 text-base font-bold text-[#0A2540] group-hover:text-[#A82020] transition-colors">
                        {site.email}
                      </h3>
                      <p className="mt-1 text-xs text-[#0A2540]/65">
                        Kirimkan berkas penawaran, dokumen tender, atau surat pengantar proyek.
                      </p>
                      <a
                        href={`mailto:${site.email}`}
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A82020] hover:text-[#8e1919]"
                      >
                        Kirim Email Resmi
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Workshop Address Card */}
                <div className="group relative overflow-hidden border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.3),0_0_0_1px_rgba(168,32,32,0.2)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                  <span
                    aria-hidden="true"
                    className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                  />
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center bg-[#8ACFF8]/20 text-[#A82020] transition-colors group-hover:bg-[#A82020] group-hover:text-white">
                      <MapPin className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A82020]">
                        Workshop & Operasional
                      </p>
                      <h3 className="mt-1 text-base font-semibold leading-snug text-[#0A2540] group-hover:text-[#A82020] transition-colors">
                        {site.address}
                      </h3>
                      <p className="mt-1 text-xs text-[#0A2540]/65">
                        Pusat perakitan ducting BJLS, stok sparepart, dan pool armada teknisi.
                      </p>
                      <a
                        href={site.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A82020] hover:text-[#8e1919]"
                      >
                        Buka Google Maps
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. Service Warranty Card */}
                <div className="group relative overflow-hidden border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.3),0_0_0_1px_rgba(168,32,32,0.2)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center bg-[#8ACFF8]/20 text-[#A82020] transition-colors group-hover:bg-[#A82020] group-hover:text-white">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A82020]">
                        Jaminan Layanan
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-[#0A2540]">
                        Garansi Resmi 30 Hari Tertulis
                      </h3>
                      <p className="mt-1 text-xs text-[#0A2540]/65">
                        Setiap pengerjaan instalasi dan pergantian sparepart dilindungi garansi tertulis resmi CV WTM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: ContactForm */}
              <div className="lg:col-span-7">
                <ScrollReveal direction="up" delay={100}>
                  <ContactForm />
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02 — PETA GOOGLE MAPS INTERAKTIF & RUTE WORKSHOP (bg-[#8ACFF8]/20, Task 6.2) */}
        <section
          id="peta"
          aria-labelledby="peta-title"
          className="border-b border-[#0A2540]/10 bg-[#8ACFF8]/20 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="02"
              eyebrow="Lokasi & Peta Workshop"
              title="Kunjungi kantor operasional kami."
              accent="kantor operasional kami."
              description="CV Win Teknik Mandiri berlokasi strategis di Ngadiluwih, siap menjangkau seluruh kawasan Kediri Raya dan sekitarnya."
              titleId="peta-title"
            />

            <ScrollReveal direction="up" delay={80}>
              <div className="group relative mt-10 overflow-hidden border border-[#0A2540]/10 bg-white p-5 shadow-[0_12px_32px_rgba(10,37,64,0.04)] transition-[border-color,box-shadow] duration-500 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.25)] sm:p-7">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />

                <div className="flex flex-col justify-between gap-4 border-b border-[#0A2540]/10 pb-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#A82020]" />
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#A82020]">
                        Google Maps Resmi CV WTM
                      </p>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#0A2540]">
                      Dusun Selomanen, Purwokerto, Ngadiluwih, Kediri
                    </h3>
                  </div>

                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex shrink-0 items-center gap-2 bg-[#0A2540] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#A82020] ${focusRing}`}
                  >
                    <span>Buka Rute Navigasi</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>

                {/* Embed Google Maps Iframe Responsif */}
                <div className="mt-5 aspect-[16/9] w-full overflow-hidden border border-[#0A2540]/10 bg-[#0A2540]/5 sm:aspect-[21/9]">
                  <iframe
                    title="Peta Lokasi CV Win Teknik Mandiri Ngadiluwih Kediri"
                    src="https://maps.google.com/maps?q=Dusun+Selomanen+Desa+Purwokerto+Kecamatan+Ngadiluwih+Kabupaten+Kediri&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    className="border-0"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#0A2540]/65">
                  <p>
                    📍 <strong>Akses:</strong> Mudah dijangkau dari Jalan Raya Kediri – Tulungagung. Area parkir luas untuk mobil operasional & truk angkutan unit.
                  </p>
                  <span className="font-mono text-[10.5px] text-[#A82020]">
                    Peta Interaktif Online
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 03 — JAM KERJA RESMI & MEDIA SOSIAL (bg-white, Task 6.4 & 6.5) */}
        <section
          id="jadwal"
          aria-labelledby="jadwal-title"
          className="border-b border-[#0A2540]/10 bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="03"
              eyebrow="Jadwal & Saluran Komunikasi"
              title="Waktu operasional dan media sosial resmi."
              accent="media sosial resmi."
              description="Perhatikan jam operasional untuk penjadwalan tepat waktu. Ikuti media sosial kami untuk dokumentasi pekerjaan harian."
              titleId="jadwal-title"
            />

            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Kolom Kiri: Jam Operasional Resmi */}
              <div className="lg:col-span-6">
                <ScrollReveal direction="up" delay={50} className="h-full">
                  <JamOperasionalCard />
                </ScrollReveal>
              </div>

              {/* Kolom Kanan: 3 Media Sosial Resmi dengan Ikon & Hover Warna Asli */}
              <div className="lg:col-span-6">
                <div className="space-y-4">
                  {site.socials.map((social, index) => {
                    const brand =
                      socialBrandConfig[
                        social.label as keyof typeof socialBrandConfig
                      ];
                    const IconComponent = brand?.Icon;

                    return (
                      <ScrollReveal
                        key={social.label}
                        delay={index * 100}
                        direction="up"
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group relative flex items-center justify-between overflow-hidden border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 ${
                            brand ? brand.borderColor : "hover:border-[#A82020]"
                          } ${
                            brand
                              ? brand.shadowHover
                              : "hover:shadow-[0_16px_36px_-16px_rgba(10,37,64,0.2)]"
                          } ${focusRing}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 ${
                              brand ? brand.topLineColor : "bg-[#A82020]"
                            }`}
                          />
                          <span
                            aria-hidden="true"
                            className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                          />

                          <div className="flex items-center gap-4">
                            <span
                              className={`flex size-12 shrink-0 items-center justify-center border border-[#0A2540]/10 bg-[#0A2540]/5 text-[#0A2540] transition-all duration-300 ${
                                brand
                                  ? brand.iconBoxHover
                                  : "group-hover:bg-[#A82020] group-hover:text-white"
                              }`}
                            >
                              {IconComponent ? (
                                <IconComponent className="size-5" />
                              ) : null}
                            </span>

                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A2540]/50">
                                Media Sosial Resmi
                              </p>
                              <h4
                                className={`mt-0.5 text-lg font-bold text-[#0A2540] transition-colors ${
                                  brand
                                    ? brand.textColor
                                    : "group-hover:text-[#A82020]"
                                }`}
                              >
                                {social.label}
                              </h4>
                              <p className="mt-0.5 font-mono text-xs text-[#0A2540]/65">
                                {brand
                                  ? `${brand.handle} · ${brand.tagline}`
                                  : social.label}
                              </p>
                            </div>
                          </div>

                          <span className="flex size-9 shrink-0 items-center justify-center text-[#0A2540]/40 transition-colors group-hover:text-[#0A2540]">
                            <ArrowUpRight className="size-4" />
                          </span>
                        </a>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter activeHref="/kontak" />
      <FloatingTechnicianBadge />
    </>
  );
}
