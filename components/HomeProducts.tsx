import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ScrollReveal from "@/components/ScrollReveal";
import { waLink } from "@/lib/site";

const products = [
  {
    id: "cuci",
    category: "Perawatan Rutin",
    name: "Cuci AC Split Standard",
    price: "Rp 65.000",
    unit: "/ unit",
    badge: "30–45 Menit",
    description: "Bersih menyeluruh, bebas becek, garansi 7 hari.",
    features: ["Tanpa becek", "Cek freon gratis", "Garansi 7 hari"],
    image: "/images/ac-split-clean.jpg",
    imageAlt: "Unit outdoor AC yang dibersihkan saat servis",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin pesan layanan Cuci AC Split (Rp 65.000/unit).",
  },
  {
    id: "pasang",
    category: "Instalasi",
    name: "Pasang AC Baru & Second",
    price: "Rp 250.000",
    unit: "/ unit",
    badge: "Standar Vakum",
    description: "Instalasi rapi dengan vakum mesin pipa.",
    features: ["SOP vakum", "Pipa tembaga tebal", "Garansi 30 hari"],
    image: "/images/wtm-instalasi.jpg",
    imageAlt: "Dua teknisi memasang unit AC split di dinding",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin pesan layanan Pasang AC (Rp 250.000/unit).",
  },
  {
    id: "relokasi",
    category: "Relokasi",
    name: "Bongkar Pasang & Relokasi",
    price: "Rp 330.000",
    unit: "/ unit",
    badge: "Simpan Freon",
    description: "Pindahan AC aman dengan teknik simpan freon.",
    features: ["Simpan freon aman", "Termasuk pasang ulang", "Uji performa"],
    image: "/images/wtm-pemasangan.jpg",
    imageAlt: "Pemasangan unit AC split di ruang tamu",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin pesan layanan Bongkar Pasang AC (Rp 330.000/unit).",
  },
  {
    id: "freon",
    category: "Refrigeran",
    name: "Isi & Tambah Freon Murni",
    price: "Rp 150.000",
    unit: "/ unit",
    badge: "Freon Murni",
    description: "Isi freon R32/R410A plus uji kebocoran.",
    features: ["Freon murni", "Uji kebocoran", "Tekanan optimal"],
    image: "/images/wtm-pemipaan.jpg",
    imageAlt: "Penyambungan pipa tembaga AC oleh teknisi",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin pesan layanan Tambah Freon AC (Rp 150.000/unit).",
  },
  {
    id: "perbaikan",
    category: "Reparasi",
    name: "Perbaikan AC & Kompresor",
    price: "Rp 75.000",
    unit: "biaya cek",
    badge: "Garansi 30 Hari",
    description: "Diagnosa AC tidak dingin, bocor, dan bising.",
    features: ["Diagnosa transparan", "Sparepart original", "Garansi 30 hari"],
    image: "/images/ac-technician.jpg",
    imageAlt: "Teknisi memeriksa kelistrikan unit AC",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya butuh layanan Perbaikan AC rusak / tidak dingin.",
  },
  {
    id: "unit-baru",
    category: "Pengadaan",
    name: "Pengadaan Unit AC Baru",
    price: null,
    unit: "",
    badge: "Garansi Resmi",
    description: "Unit original bergaransi, siap pasang.",
    features: ["100% original", "Termasuk pipa", "Konsultasi BTU gratis"],
    image: "/images/ac-lifestyle.jpg",
    imageAlt: "Unit AC split terpasang di ruangan hunian",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin konsultasi pengadaan Unit AC Baru.",
  },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

const cardEase = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export default function HomeProducts() {
  return (
    <section
      id="produk"
      className="scroll-mt-20 border-b border-[#0A2540]/10 bg-[#F4FAFE] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            index="01"
            eyebrow="Produk & Estimasi Biaya"
            title="Paket layanan dengan harga transparan."
            accent="harga transparan."
            description="Estimasi biaya pengerjaan teknis dan pengadaan unit tanpa biaya tersembunyi. Hubungi kami untuk jadwal pengerjaan."
            titleId="produk-title"
            className="max-w-2xl"
          />

          <Link
            href={waLink(
              "Halo CV Win Teknik Mandiri, saya ingin menanyakan daftar harga lengkap dan konsultasi AC."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#A82020] transition-colors ${focusRing}`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Tanya pricelist lengkap
            <ArrowUpRight
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-12 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item, index) => (
            <ScrollReveal
              key={item.id}
              delay={index * 70}
              className="h-full"
            >
              <Link
                href={waLink(item.waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex h-full flex-col overflow-hidden border border-[#0A2540]/10 bg-white transition-[transform,border-color,box-shadow] duration-500 ${cardEase} hover:-translate-y-1 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.45),0_0_0_1px_rgba(168,32,32,0.28)] ${focusRing}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
                <span
                  aria-hidden="true"
                  className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0"
                />

                <div className="relative aspect-[16/10] overflow-hidden bg-[#0A2540]">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className={`object-cover transition-[transform,filter] duration-[900ms] ${cardEase} group-hover:scale-[1.06] group-hover:brightness-105`}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 via-[#0A2540]/10 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#A82020]/0 transition-colors duration-500 group-hover:bg-[#A82020]/15"
                  />

                  <span className="absolute left-3 top-3 bg-[#0A2540]/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-colors duration-500 group-hover:bg-[#A82020]">
                    {item.badge}
                  </span>

                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 font-mono text-[9px] tracking-[0.16em] text-white/45 transition-colors duration-500 group-hover:text-white/85"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#A82020]">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#0A2540]">
                    {item.name}
                  </h3>

                  <p className="mt-1.5 line-clamp-1 text-[13px] leading-6 text-[#0A2540]/55">
                    {item.description}
                  </p>

                  <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#0A2540]/60">
                    {item.features.map((feature) => (
                      <li key={feature} className="inline-flex items-center gap-1">
                        <Check
                          className="size-3 shrink-0 text-[#A82020]"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 border-t border-[#0A2540]/10 pt-4 transition-colors duration-500 group-hover:border-[#A82020]/35">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/40">
                        {item.price ? "Estimasi biaya" : "Harga unit"}
                      </span>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        {item.price ? (
                          <>
                            <span className="text-[20px] font-semibold tabular-nums tracking-tight text-[#A82020]">
                              {item.price}
                            </span>
                            <span className="text-[11px] text-[#0A2540]/50">
                              {item.unit}
                            </span>
                          </>
                        ) : (
                          <span className="text-[15px] font-semibold tracking-tight text-[#A82020]">
                            Minta penawaran
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-[#A82020] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 group-hover:bg-[#8e1919]">
                      Pesan
                      <ArrowUpRight
                        className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#0A2540]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-start gap-2 text-[11px] leading-5 text-[#0A2540]/50">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-[#A82020]"
              aria-hidden="true"
            />
            Harga estimasi area Kediri. Survei dan konsultasi gratis, biaya
            final dikonfirmasi setelah pengecekan unit.
          </p>

          <Link
            href={waLink(
              "Halo CV Win Teknik Mandiri, saya ingin konsultasi biaya dan jadwal pengerjaan AC."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A2540] transition-colors hover:text-[#A82020] ${focusRing}`}
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            Tanya via WhatsApp
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
