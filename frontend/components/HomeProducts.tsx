"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ScrollReveal from "@/components/ScrollReveal";
import { waLink } from "@/lib/site";
import { fetchServiceItems, type ServiceItem } from "@/lib/katalogLayanan";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

const fallbackProducts = [
  {
    id: "1",
    title: "Cuci AC Split Standard",
    category_name: "Perawatan Rutin",
    price: "Rp 65.000",
    unit: "/ unit",
    description: "Bersih menyeluruh, bebas becek, garansi 7 hari.",
    highlights: ["Tanpa becek", "Cek freon gratis", "Garansi 7 hari"],
    image_url: "/images/ac-split-clean.jpg",
  },
  {
    id: "2",
    title: "Pasang AC Baru & Second",
    category_name: "Instalasi",
    price: "Rp 250.000",
    unit: "/ unit",
    description: "Instalasi rapi dengan vakum mesin pipa.",
    highlights: ["SOP vakum", "Pipa tembaga tebal", "Garansi 30 hari"],
    image_url: "/images/wtm-instalasi.jpg",
  },
  {
    id: "3",
    title: "Bongkar Pasang & Relokasi",
    category_name: "Relokasi",
    price: "Rp 330.000",
    unit: "/ unit",
    description: "Pindahan AC aman dengan teknik simpan freon.",
    highlights: ["Simpan freon aman", "Pasang ulang", "Uji performa"],
    image_url: "/images/wtm-pemasangan.jpg",
  },
  {
    id: "4",
    title: "Isi & Tambah Freon Murni",
    category_name: "Refrigeran",
    price: "Rp 150.000",
    unit: "/ unit",
    description: "Isi freon R32/R410A plus uji kebocoran.",
    highlights: ["Freon murni", "Uji kebocoran", "Tekanan optimal"],
    image_url: "/images/wtm-pemipaan.jpg",
  },
  {
    id: "5",
    title: "Perbaikan AC & Kompresor",
    category_name: "Reparasi",
    price: "Rp 75.000",
    unit: "biaya cek",
    description: "Diagnosa AC tidak dingin, bocor, dan bising.",
    highlights: ["Diagnosa transparan", "Sparepart original", "Garansi 30 hari"],
    image_url: "/images/ac-technician.jpg",
  },
  {
    id: "6",
    title: "Pengadaan Unit AC Baru",
    category_name: "Pengadaan",
    price: "",
    unit: "",
    description: "Unit original bergaransi, siap pasang.",
    highlights: ["100% original", "Termasuk pipa", "Konsultasi BTU gratis"],
    image_url: "/images/ac-lifestyle.jpg",
  },
];

export default function HomeProducts() {
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchServiceItems();
      if (active && data.length > 0) {
        setItems(data.slice(0, 6)); // Tampilkan 6 kartu utama di Beranda
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const displayList = items.length > 0 ? items : (fallbackProducts as unknown as ServiceItem[]);

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
          {displayList.map((item, index) => (
            <ScrollReveal
              key={item.id}
              delay={index * 70}
              className="h-full"
            >
              <div
                className={`group relative flex h-full flex-col overflow-hidden border border-[#0A2540]/10 bg-white transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.45),0_0_0_1px_rgba(168,32,32,0.28)]`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />

                <span
                  aria-hidden="true"
                  className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0"
                />

                {/* Foto Layanan */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0A2540]">
                  <Image
                    src={item.image_url || "/images/ac-split-clean.jpg"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:brightness-105"
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
                    {item.category_name || "Layanan"}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 font-mono text-[9px] tracking-[0.16em] text-white/45 transition-colors duration-500 group-hover:text-white/85"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Keterangan */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#A82020]">
                    {item.category_name || "Layanan"}
                  </p>
                  <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#0A2540]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-[#0A2540]/55">
                    {item.description}
                  </p>

                  {/* Highlights */}
                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#0A2540]/60">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="inline-flex items-center gap-1">
                          <span className="size-1 bg-[#A82020] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Harga & Tombol WhatsApp Order Trigger */}
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 border-t border-[#0A2540]/10 pt-4 transition-colors duration-500 group-hover:border-[#A82020]/35">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]/40">
                        {item.price_prefix || "Estimasi biaya"}
                      </span>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        {item.price ? (
                          <>
                            <span className="text-[20px] font-semibold tabular-nums tracking-tight text-[#A82020]">
                              {item.price}
                            </span>
                            <span className="text-[11px] text-[#0A2540]/50">
                              {item.unit || "/ unit"}
                            </span>
                          </>
                        ) : (
                          <span className="text-[15px] font-semibold tracking-tight text-[#A82020]">
                            Minta penawaran
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tombol Pintar Masuk Sistem & Terbit Invoice */}
                    <WhatsAppOrderButton
                      category={item.category_name || "Layanan"}
                      service={item.title}
                      price={item.price ? `${item.price} ${item.unit}` : "Penawaran"}
                      serviceId={item.id}
                      categoryId={item.category_id}
                      label="Pesan"
                      className="bg-[#A82020] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-[#8e1919] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
