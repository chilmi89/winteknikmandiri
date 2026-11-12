import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import ContactCta from "@/components/ContactCta";
import FloatingTechnicianBadge from "@/components/FloatingTechnicianBadge";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeading from "@/components/SectionHeading";
import SiteFooter from "@/components/SiteFooter";
import StatsBar from "@/components/StatsBar";
import CompanyFactsList from "@/components/CompanyFactsList";
import TeamSection from "@/components/TeamSection";
import VisiMisiSection from "@/components/VisiMisiSection";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang Kami — CV Win Teknik Mandiri Kediri",
  description:
    "Profil CV Win Teknik Mandiri: kontraktor AC dan tata udara di Kediri sejak 2014. Pengadaan, instalasi VRF, fabrikasi ducting, maintenance, dan legalitas badan usaha resmi terdaftar.",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

const facts = [
  { label: "Berdiri Sejak", value: "Tahun 2014" },
  { label: "Proyek Selesai", value: "364+ Proyek" },
  { label: "Proyek Berjalan", value: "36+ Proyek" },
  { label: "Pengesahan", value: "Kemenkumham RI 2026" },
];

const quickNav = [
  { id: "perjalanan", number: "01", label: "Perjalanan" },
  { id: "visi-misi", number: "02", label: "Visi & Misi" },
  { id: "legalitas", number: "03", label: "Legalitas Usaha" },
  { id: "tim", number: "04", label: "Tim & Dokumentasi" },
];

const milestones = [
  {
    year: "2014",
    badge: "Awal Mula",
    title: "Layanan Mandiri di Ngadiluwih",
    description:
      "Memulai sebagai layanan teknisi pendingin ruangan dengan komitmen teguh pada diagnosa jujur dan flaring pemipaan presisi.",
  },
  {
    year: "2018",
    badge: "Ekspansi",
    title: "Kepercayaan hunian & gedung ",
    description:
      "Mulai menangani instalasi skala besar di sekolahan (SMK Budi Utomo), pondok pesantren (Wali Barokah), dan retail mall.",
  },
  {
    year: "Hari Ini",
    badge: "Kontraktor HVAC",
    title: "Kontraktor HVAC & Tata Udara Penuh",
    description:
      "Menyediakan solusi menyeluruh dari pengadaan unit, instalasi VRF/VRV, fabrikasi ducting BJLS, hingga kontrak pemeliharaan korporasi.",
  },
];

const legalities: { label: string; value: string; note?: string; mono?: boolean }[] = [
  { label: "Nama Badan Usaha", value: "CV WIN TEKNIK MANDIRI" },
  { label: "Bentuk Usaha", value: "Persekutuan Komanditer (CV)" },
  {
    label: "Pengesahan Kemenkumham",
    value: "Terdaftar Resmi Kemenkumham RI",
    note: "Dokumen legalitas lengkap",
  },
  {
    label: "NPWP Badan Usaha",
    value: "Terdaftar KPP Pratama Kediri",
    note: "Wajib pajak badan aktif",
  },
  {
    label: "Alamat Workshop",
    value: "Dusun Selomanen, Purwokerto, Ngadiluwih, Kediri",
  },
];

const kbli = [
  { code: "43224", label: "Instalasi Pendingin dan Ventilasi Udara" },
  { code: "71109", label: "Aktivitas Keinsinyuran dan Konsultasi Teknis" },
];

const teamMembers = [
  {
    number: "01",
    name: "Team Wahyu",
    role: "Spesialis VRF & Unit Komersial",
    image: "/gallery/Foto%20TIM/Team%20Wahyu.png",
    alt: "Team Wahyu - Teknisi spesialis VRF CV Win Teknik Mandiri",
    badge: "Instalasi & Vakum",
    points: [
      "Instalasi sistem VRF/VRV multi-split gedung bertingkat",
      "Pemipaan tembaga presisi & uji vakum mesin 20 menit",
    ],
  },
  {
    number: "02",
    name: "Team Sobirin",
    role: "Spesialis Fabrikasi & Ducting",
    image: "/gallery/Foto%20TIM/Team%20Sobirin.png",
    alt: "Team Sobirin - Teknisi spesialis ducting CV Win Teknik Mandiri",
    badge: "Ducting BJLS & PU",
    points: [
      "Fabrikasi ducting BJLS, PU duct, dan spiral duct",
      "Kalkulasi static pressure & distribusi aliran udara (CFM)",
    ],
  },
  {
    number: "03",
    name: "Team Junaid",
    role: "Supervisor Proyek & Maintenance",
    image: "/gallery/Foto%20TIM/Team%20Junaid.png",
    alt: "Team Junaid - Supervisor maintenance CV Win Teknik Mandiri",
    badge: "Troubleshoot & PCB",
    points: [
      "Troubleshooting modul PCB inverter & kelistrikan 3-phase",
      "Overhaul kompresor & pembersihan kimia indoor-outdoor",
    ],
  },
  {
    number: "04",
    name: "Team Asep",
    role: "Teknisi Senior Refrigerant & Electrical",
    image: "/gallery/Foto%20TIM/Team%20Asep.png",
    alt: "Team Asep - Teknisi senior CV Win Teknik Mandiri",
    badge: "Kelistrikan & Freon",
    points: [
      "Uji kebocoran pipa & pengisian freon R32 / R410A murni",
      "Pengukuran arus ampere & kalibrasi suhu termometer digital",
    ],
  },
];

const showcaseHighlights = [
  {
    title: "Instalasi AHU Mall Galeria Bali",
    category: "Gedung Komersial",
    location: "Kuta, Bali",
    image:
      "/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall.jpeg",
    alt: "Dokumentasi instalasi AHU di Mall Galeria Bali",
  },
  {
    title: "Supply & Instalasi AC SMK Budi Utomo",
    category: "Fasilitas Pendidikan",
    location: "Gading Mangu, Jombang",
    image:
      "/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu.jpeg",
    alt: "Dokumentasi supply dan instalasi AC di SMK Budi Utomo Gading Mangu",
  },
  {
    title: "Pabrikasi Pipa Refrigerant PT Growth Asia",
    category: "Sektor Industri",
    location: "Pasuruan, Jawa Timur",
    image:
      "/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.17.jpeg",
    alt: "Dokumentasi pabrikasi pipa refrigerant di PT Growth Asia Pasuruan",
  },
];

export default function TentangKamiPage() {
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
        {/* HERO SECTION — Persis gaya header /layanan */}
        <section
          aria-labelledby="tentang-title"
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
                  Tentang Kami
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <SectionHeading
                  as="h1"
                  index="01"
                  eyebrow="Profil Perusahaan"
                  title="Dua belas tahun merawat kenyamanan ruang."
                  accent="kenyamanan ruang."
                  description="Didirikan pada 2014 di Ngadiluwih, CV Win Teknik Mandiri tumbuh menjadi kontraktor tata udara dan pendingin ruangan tepercaya di Kediri Raya."
                  titleId="tentang-title"
                  className="max-w-3xl"
                />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={waLink(
                      "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC dan proyek tata udara."
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

            <CompanyFactsList extraFactLabel="Pengesahan" extraFactValue="Kemenkumham RI 2026" />
          </div>
        </section>

        {/* STATS BAR — Real-time dynamic company stats [Image 1] */}
        <StatsBar />

        {/* QUICK-NAV BAR — Sticky seperti di /layanan */}
        <div className="sticky top-20 z-30 transform-gpu border-b border-[#0A2540]/10 bg-white/98 shadow-[0_1px_3px_rgba(10,37,64,0.03)]">
          <nav
            aria-label="Daftar bagian profil"
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
          >
            <ul className="flex gap-6 overflow-x-auto py-3.5">
              {quickNav.map((item) => (
                <li key={item.id} className="shrink-0">
                  <Link
                    href={`#${item.id}`}
                    className={`group inline-flex items-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A2540]/55 transition-colors hover:text-[#A82020] sm:text-[11px] ${focusRing}`}
                  >
                    <span className="text-[#A82020]">{item.number}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 01 — OUR JOURNEY (bg-white) */}
        <section
          id="perjalanan"
          aria-labelledby="perjalanan-title"
          className="scroll-mt-36 border-t border-[#0A2540]/10 bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-36">
                  <SectionHeading
                    index="01"
                    eyebrow="Our Journey"
                    title="Dari layanan panggilan menjadi kontraktor tata udara."
                    accent="kontraktor tata udara."
                    description="Perjalanan teknis nyata sejak 2014, membuktikan keandalan di sektor residensial, sekolahan, gedung komersial, hingga industri."
                    titleId="perjalanan-title"
                  />

                  {/* Foto Dokumentasi Proyek Ber-Hover & Sheen */}
                  <div className="group relative mt-8 overflow-hidden border border-[#0A2540]/10 bg-[#0A2540] transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.3),0_0_0_1px_rgba(168,32,32,0.2)]">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                    />
                    <span
                      aria-hidden="true"
                      className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
                    />
                    <div className="relative aspect-[4/3]">
                      <Image
                        src="/gallery/Proyek%20Pondok%20Wali%20Barokah/Instalasi%20mesin%20splitduct%2020%20PK%20Pondok%20Wali%20Barokah.jpeg"
                        alt="Instalasi AC splitduct 20 PK di Pondok Wali Barokah"
                        fill
                        sizes="(max-width: 1024px) 100vw, 460px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[#A82020]/0 transition-colors duration-500 group-hover:bg-[#A82020]/10"
                      />
                    </div>
                    <div className="border-t border-[#0A2540]/10 bg-white px-4 py-3">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A2540]/70 group-hover:text-[#A82020] transition-colors">
                        Dokumentasi Proyek · Splitduct 20 PK Pondok Wali Barokah
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="space-y-4 text-[14.5px] leading-7 text-[#0A2540]/70 sm:text-[15px] sm:leading-8">
                  <p className="text-[#0A2540]">
                    Berawal dari layanan teknis independen di Dusun Selomanen,
                    Desa Purwokerto, Kecamatan Ngadiluwih, Kabupaten Kediri.
                    Prinsip kami sederhana: pekerjaan yang rapi, flaring
                    tembaga presisi, dan diagnosa yang dapat dipertanggungjawabkan.
                  </p>
                  <p>
                    Kepercayaan pelanggan mengantarkan CV Win Teknik Mandiri
                    menangani fasilitas berskala besar — mulai dari institusi
                    pendidikan (SMK Budi Utomo), tenant retail mall (Nike, Payless),
                    hingga fasilitas industri manufaktur (PT Growth Asia).
                  </p>
                </div>

                {/* 3 Kartu Milestone Mandiri yang Besar & Ber-Hover Merah */}
                <div className="mt-8 space-y-4">
                  {milestones.map((milestone, index) => (
                    <ScrollReveal
                      key={milestone.title}
                      delay={index * 120}
                      direction="up"
                    >
                      <div className="group relative border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#A82020] hover:shadow-[0_16px_36px_-16px_rgba(10,37,64,0.2),0_0_0_1px_rgba(168,32,32,0.18)]">
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                        />
                        <span
                          aria-hidden="true"
                          className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-mono text-base font-bold text-[#A82020]">
                            {milestone.year}
                          </span>
                          <span className="bg-[#0A2540]/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/70 transition-colors duration-300 group-hover:bg-[#A82020] group-hover:text-white">
                            {milestone.badge}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold text-[#0A2540] transition-colors duration-300 group-hover:text-[#A82020]">
                          {milestone.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#0A2540]/65">
                          {milestone.description}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — VISI & MISI (bg-[#8ACFF8]/20) */}
        <section
          id="visi-misi"
          aria-labelledby="visi-misi-title"
          className="scroll-mt-36 border-t border-[#0A2540]/10 bg-[#8ACFF8]/20 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="02"
              eyebrow="Visi & Misi"
              title="Standar dan arah yang kami pegang teguh."
              accent="kami pegang teguh."
              description="Visi menjadi fondasi komitmen teknis, sementara misi dijabarkan dalam prosedur pengerjaan harian."
              titleId="visi-misi-title"
            />

            {/* Visi & Misi Dinamis dari API */}
            <VisiMisiSection />
          </div>
        </section>

        {/* 03 — LEGALITAS USAHA (bg-white) */}
        <section
          id="legalitas"
          aria-labelledby="legalitas-title"
          className="scroll-mt-36 border-t border-[#0A2540]/10 bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5">
                <SectionHeading
                  index="03"
                  eyebrow="Legalitas Usaha"
                  title="Badan usaha resmi dengan legalitas transparan."
                  accent="legalitas transparan."
                  description="CV Win Teknik Mandiri beroperasi secara sah di bawah hukum Republik Indonesia untuk mendukung pengadaan swasta (B2B) dan instansi pemerintah (B2G)."
                  titleId="legalitas-title"
                />

                <div className="group relative mt-6 flex items-start gap-3.5 border border-[#0A2540]/10 bg-[#8ACFF8]/10 p-5 transition-[border-color,box-shadow] duration-500 hover:border-[#A82020] hover:shadow-[0_16px_36px_-16px_rgba(10,37,64,0.2),0_0_0_1px_rgba(168,32,32,0.18)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-[#A82020]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0A2540] group-hover:text-[#A82020] transition-colors">
                      Terverifikasi Resmi Kemenkumham RI
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#0A2540]/65">
                      Tersedia kelengkapan berkas legalitas resmi untuk proses verifikasi vendor & pengadaan LPSE / B2B.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ScrollReveal direction="up" delay={80}>
                  <div className="group relative overflow-hidden border border-[#0A2540]/10 bg-white shadow-[0_12px_32px_rgba(10,37,64,0.04)] transition-[border-color,box-shadow] duration-500 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.25),0_0_0_1px_rgba(168,32,32,0.18)]">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                    />
                    <div className="flex items-center justify-between border-b border-[#0A2540]/10 bg-[#F4FAFE] px-6 py-4">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#0A2540]/70">
                        Dokumen Perizinan Berusaha
                      </p>
                      <BadgeCheck
                        className="size-4 text-[#A82020]"
                        aria-hidden="true"
                      />
                    </div>

                    <dl className="divide-y divide-[#0A2540]/10">
                      {legalities.map((item) => (
                        <div
                          key={item.label}
                          className="grid gap-1 px-6 py-4 transition-colors duration-200 hover:bg-[#F4FAFE]/60 sm:grid-cols-[210px_1fr] sm:gap-4"
                        >
                          <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#0A2540]/55">
                            {item.label}
                          </dt>
                          <dd className="text-[14.5px] font-medium text-[#0A2540]">
                            <span
                              className={
                                item.mono
                                  ? "font-mono tabular-nums tracking-tight text-[#0A2540]"
                                  : ""
                              }
                            >
                              {item.value}
                            </span>
                            {item.note ? (
                              <span className="ml-2 inline-block font-mono text-[11px] text-[#A82020]">
                                ({item.note})
                              </span>
                            ) : null}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="border-t border-[#0A2540]/10 bg-[#8ACFF8]/10 p-6">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#0A2540]/70">
                        KBLI Bidang Usaha Terdaftar
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {kbli.map((item) => (
                          <li
                            key={item.code}
                            className="flex items-start gap-3 text-sm text-[#0A2540]/80"
                          >
                            <span className="font-mono font-bold text-[#A82020]">
                              {item.code}
                            </span>
                            <span>— {item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* 04 — OUR TEAM & WORKSHOP (bg-[#8ACFF8]/20) */}
        <section
          id="tim"
          aria-labelledby="tim-title"
          className="scroll-mt-36 border-t border-[#0A2540]/10 bg-[#8ACFF8]/20 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index="04"
              eyebrow="Our Team & Workshop"
              title="Pekerjaan teknis oleh tim berpengalaman."
              accent="tim berpengalaman."
              description="Setiap proyek ditangani teknisi bersertifikasi yang dilengkapi peralatan berstandar pabrikan dan perlengkapan keselamatan kerja."
              titleId="tim-title"
            />

            {/* Grid 4 Kartu Tim Personil — Format Minimalis & Dinamis dari API */}
            <div className="mt-10">
              <TeamSection />
            </div>

            {/* Cuplikan Dokumentasi Proyek — Minimalis & Tautan ke Galeri Penuh */}
            <div className="mt-14">
              <div className="flex flex-col gap-2 border-b border-[#0A2540]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0A2540]/70">
                    Cuplikan Dokumentasi Lapangan
                  </p>
                  <p className="mt-0.5 text-xs text-[#0A2540]/55">
                    Tiga contoh pengerjaan nyata di sektor komersial, pendidikan, dan industri
                  </p>
                </div>
                <Link
                  href="/galeri"
                  className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#A82020] transition-colors hover:text-[#8e1919] ${focusRing}`}
                >
                  <span>Buka Galeri Lengkap (18+ Dokumentasi)</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              {/* Grid 3 Kartu Proyek Terpilih */}
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {showcaseHighlights.map((item, index) => (
                  <ScrollReveal
                    key={item.title}
                    delay={index * 120}
                    direction="up"
                    className="h-full"
                  >
                    <Link
                      href="/galeri"
                      aria-label={`Lihat dokumentasi ${item.title} di Galeri`}
                      className={`group relative flex h-full flex-col overflow-hidden border border-[#0A2540]/10 bg-white transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-2 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.35),0_0_0_1px_rgba(168,32,32,0.25)] ${focusRing}`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                      />
                      <span
                        aria-hidden="true"
                        className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
                      />

                      <div className="relative aspect-[16/11] overflow-hidden bg-[#0A2540]">
                        <Image
                          src={item.image}
                          alt={item.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 380px"
                          className="object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.06] group-hover:brightness-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-[#A82020]/0 transition-colors duration-500 group-hover:bg-[#A82020]/15"
                        />
                        <span className="absolute left-3 top-3 bg-[#0A2540]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-[#A82020]">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <h4 className="text-base font-semibold leading-snug text-[#0A2540] transition-colors duration-300 group-hover:text-[#A82020]">
                          {item.title}
                        </h4>
                        <div className="mt-4 flex items-center justify-between border-t border-[#0A2540]/10 pt-3 text-[11px] text-[#0A2540]/60">
                          <span className="font-mono uppercase tracking-[0.12em]">
                            {item.location}
                          </span>
                          <span className="font-mono text-[10.5px] text-[#A82020] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            Lihat di Galeri →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>

              {/* Callout Button Bersih Menuju /galeri */}
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border border-[#0A2540]/10 bg-white p-5 sm:flex-row sm:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-[#0A2540] sm:text-base">
                    Ingin melihat lebih banyak dokumentasi pekerjaan kami?
                  </h4>
                  <p className="mt-0.5 text-xs text-[#0A2540]/65">
                    Tersedia 18+ dokumentasi proyek lengkap dengan filter kategori mall, sekolah, fasilitas publik, dan pabrik.
                  </p>
                </div>
                <Link
                  href="/galeri"
                  className={`inline-flex shrink-0 items-center gap-2 bg-[#0A2540] px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#A82020] ${focusRing}`}
                >
                  <span>Buka Halaman Galeri</span>
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT CTA — Konsisten dengan Home & Layanan */}
        <ContactCta />
      </main>

      <SiteFooter activeHref="/tentang-kami" />
      <FloatingTechnicianBadge />
    </>
  );
}
