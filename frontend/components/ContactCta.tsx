import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site, waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

export default function ContactCta() {
  return (
    <section id="kontak" className="scroll-mt-20 bg-[#0A2540]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8ACFF8]">
              <span aria-hidden="true" className="h-px w-6 bg-[#8ACFF8]/40" />
              Konsultasi
            </p>
            <h2 className="mt-4 max-w-xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.025em] text-white sm:text-4xl">
              AC Anda Tidak Dingin atau {" "}
              <span className="text-[#FF6B6B]">kendala AC?</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/60">
              Kirim kebutuhan Anda. Kami bantu hitung kapasitas, survei lokasi,
              dan menyiapkan penawaran.
            </p>
          </div>

          <div className="lg:col-span-5 lg:justify-self-end">
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href={waLink(
                  "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai proyek AC atau ducting."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 bg-[#A82020] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>

              <a
                href={`tel:+${site.phone}`}
                className={`inline-flex items-center justify-center gap-2 border border-white/25 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-[#0A2540] ${focusRing}`}
              >
                <Phone className="size-4" aria-hidden="true" />
                Telepon
              </a>
            </div>

            <p className="mt-4 text-xs text-white/45">
              Senin–Jumat 08.00–16.00 · Sabtu 08.00–12.00
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`mailto:${site.email}`}
            className={`inline-flex items-center gap-2 transition-colors hover:text-white ${focusRing}`}
          >
            <Mail className="size-3.5" aria-hidden="true" />
            {site.email}
          </a>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 transition-colors hover:text-white ${focusRing}`}
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            Ngadiluwih, Kediri
          </a>
        </div>
      </div>
    </section>
  );
}
