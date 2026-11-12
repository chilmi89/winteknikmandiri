import Link from "next/link";
import { MapPin, CheckCircle2, ShieldCheck, Clock, MessageCircle, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const kotaAreas = [
  "Mojoroto",
  "Kecamatan Kota",
  "Pesantren",
  "Campurejo",
  "Bandar Lor",
  "Ngronggo",
  "Banjaran",
  "Burengan",
  "Sukorame",
];

const kabAreas = [
  "Ngadiluwih (Workshop)",
  "Pare",
  "Kras",
  "Kandat",
  "Wates",
  "Gurah",
  "Plosoklaten",
  "Mojo",
  "Semen",
  "Banyakan",
  "Gampengrejo",
  "Papar",
  "Plemahan",
  "Ringinrejo",
  "Tarokan",
];

export default function CoverageAreaSection() {
  return (
    <section
      id="wilayah-layanan"
      aria-labelledby="wilayah-title"
      className="scroll-mt-20 border-b border-[#0A2540]/10 bg-[#F4FAFE] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            index="05"
            eyebrow="Cakupan Area Terdekat"
            title="Wilayah jangkauan service AC di seluruh Kediri Raya."
            accent="seluruh Kediri Raya."
            description="Teknisi CV Win Teknik Mandiri siap melayani panggilan cepat ke rumah, perumahan, toko, kantor, sekolah, dan pabrik di seluruh pelosok Kota dan Kabupaten Kediri."
            titleId="wilayah-title"
            className="max-w-2xl"
          />

          <Link
            href={waLink("Halo CV Win Teknik Mandiri, saya ingin memanggil teknisi service AC ke alamat saya di Kediri.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#A82020] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-[#8e1919] hover:shadow-md ${focusRing}`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            <span>Panggil Teknisi ke Lokasi</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* 2 Kolom Area Kota & Kabupaten */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Kota Kediri Card */}
          <div className="rounded-xl border border-[#0A2540]/10 bg-white p-6 shadow-sm sm:p-8 lg:col-span-5">
            <div className="flex items-center gap-3 border-b border-[#0A2540]/10 pb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#A82020]/10 text-[#A82020]">
                <MapPin className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A2540]">
                  Kota Kediri
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#0A2540]/60">
                  Respon Cepat Panggilan Hunian & Komersial
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#0A2540]/70">
              Layanan teknisi AC panggilan langsung ke lokasi Anda di pusat bisnis, ruko, dan komplek perumahan Kota Kediri:
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {kotaAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#0A2540]/10 bg-[#F4FAFE] px-3 py-1 font-mono text-xs text-[#0A2540] transition-colors hover:border-[#A82020] hover:text-[#A82020]"
                >
                  <span className="size-1.5 rounded-full bg-[#A82020]" />
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Kabupaten Kediri Card */}
          <div className="rounded-xl border border-[#0A2540]/10 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-3 border-b border-[#0A2540]/10 pb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#0A2540]/10 text-[#0A2540]">
                <MapPin className="size-5 text-[#A82020]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A2540]">
                  Kabupaten Kediri
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#0A2540]/60">
                  Meliputi Seluruh Wilayah Kecamatan & Sekitarnya
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#0A2540]/70">
              Workshop pusat kami beroperasi di Ngadiluwih dan menjangkau seluruh kecamatan di Kabupaten Kediri dengan armada teknisi lengkap:
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {kabAreas.map((area) => (
                <span
                  key={area}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 font-mono text-xs transition-colors ${
                    area.includes("Workshop")
                      ? "border-[#A82020] bg-[#A82020]/10 font-bold text-[#A82020]"
                      : "border-[#0A2540]/10 bg-[#F4FAFE] text-[#0A2540] hover:border-[#A82020] hover:text-[#A82020]"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      area.includes("Workshop") ? "bg-[#A82020] animate-pulse" : "bg-[#0A2540]/40"
                    }`}
                  />
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Keunggulan Garansi Lokal */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border border-[#0A2540]/10 bg-white p-4">
            <Clock className="size-5 shrink-0 text-[#A82020]" />
            <div>
              <p className="text-xs font-bold text-[#0A2540]">Panggilan Fleksibel</p>
              <p className="text-[11px] text-[#0A2540]/60">Senin – Sabtu on-time</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[#0A2540]/10 bg-white p-4">
            <ShieldCheck className="size-5 shrink-0 text-[#A82020]" />
            <div>
              <p className="text-xs font-bold text-[#0A2540]">Garansi 30 Hari</p>
              <p className="text-[11px] text-[#0A2540]/60">Kuitansi & segel resmi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[#0A2540]/10 bg-white p-4">
            <CheckCircle2 className="size-5 shrink-0 text-[#A82020]" />
            <div>
              <p className="text-xs font-bold text-[#0A2540]">Standar SOP Pabrikan</p>
              <p className="text-[11px] text-[#0A2540]/60">Vakum mesin 20 menit</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[#0A2540]/10 bg-white p-4">
            <CheckCircle2 className="size-5 shrink-0 text-[#A82020]" />
            <div>
              <p className="text-xs font-bold text-[#0A2540]">Tarif Transparan</p>
              <p className="text-[11px] text-[#0A2540]/60">Tanpa biaya tersembunyi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
