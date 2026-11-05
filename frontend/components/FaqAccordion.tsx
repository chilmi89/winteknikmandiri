"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { resolveApiBase } from "@/lib/dashboard/api";
import type { PublicFaqItem } from "@/lib/dashboard/faqs";

const defaultFaqs: PublicFaqItem[] = [
  {
    number: "01",
    question: "Area mana saja yang dilayani oleh CV Win Teknik Mandiri?",
    answer:
      "Kami melayani seluruh wilayah Kota dan Kabupaten Kediri, termasuk Ngadiluwih, Kras, Kandat, Pare, Wates, Gurah, Mojo, dan sekitarnya, serta siap menangani proyek komersial dan industri di Jawa Timur.",
  },
  {
    number: "02",
    question: "Berapa lama jaminan garansi pengerjaan yang diberikan?",
    answer:
      "Seluruh pengerjaan instalasi dan reparasi dilindungi garansi tertulis 30 hari. Untuk pergantian sparepart, masa garansi mengikuti ketentuan resmi dari pabrikan.",
  },
  {
    number: "03",
    question: "Apakah melayani proyek perusahaan, sekolah, dan gedung komersial?",
    answer:
      "Ya. Kami menangani pengadaan unit, pemasangan AC VRF/VRV, fabrikasi ducting BJLS, hingga kontrak maintenance berkala dengan kelengkapan invoice dan faktur resmi.",
  },
  {
    number: "04",
    question: "Berapa biaya pengecekan awal untuk AC rusak atau tidak dingin?",
    answer:
      "Biaya cek dan diagnosa kerusakan adalah Rp 75.000, dan biaya pengecekan ini gratis bila Anda melanjutkan pengerjaan perbaikan unit bersama tim kami.",
  },
  {
    number: "05",
    question: "Apakah setiap pemasangan AC baru sudah termasuk proses vakum?",
    answer:
      "Pasti. Seluruh pemasangan unit AC baru maupun bekas wajib mengikuti SOP vakum mesin minimal 15–20 menit untuk menguras uap air dari pipa dan menjaga kompresor tetap awet.",
  },
  {
    number: "06",
    question: "Bagaimana cara melakukan booking teknisi atau survei proyek?",
    answer:
      "Cukup hubungi WhatsApp resmi kami di 0812-1662-2840 atau kirim pesan melalui halaman Kontak. Tim kami siap merespons cepat dan menjadwalkan survei ke lokasi Anda.",
  },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

type FaqAccordionProps = {
  initialItems?: PublicFaqItem[];
};

export default function FaqAccordion({ initialItems }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [items, setItems] = useState<PublicFaqItem[]>(
    initialItems && initialItems.length > 0 ? initialItems : defaultFaqs
  );

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      return;
    }

    let active = true;

    async function loadFaqs() {
      try {
        const res = await fetch(`${resolveApiBase()}/api/v1/faqs?limit=50`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const json = await res.json();
        if (active && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(
            (
              item: { question: string; answer: string },
              idx: number
            ) => ({
              number: String(idx + 1).padStart(2, "0"),
              question: item.question,
              answer: item.answer,
            })
          );
          setItems(mapped);
        }
      } catch {
        // Fallback default
      }
    }

    void loadFaqs();
    return () => {
      active = false;
    };
  }, [initialItems]);

  return (
    <div className="border-t border-[#0A2540]/10">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={`${faq.question}-${index}`} className="border-b border-[#0A2540]/10">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`group flex w-full items-start justify-between gap-5 py-5 text-left transition-colors sm:py-6 ${focusRing}`}
              >
                <div className="flex items-baseline gap-3.5 sm:gap-5">
                  <span className="font-mono text-xs font-bold text-[#A82020]">
                    {faq.number}
                  </span>
                  <span className="text-[15.5px] font-medium leading-snug text-[#0A2540] transition-colors group-hover:text-[#A82020] sm:text-[17px]">
                    {faq.question}
                  </span>
                </div>

                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-[#A82020]">
                  <Plus
                    className={`size-4 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={`grid transition-all duration-300 ease-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 pl-8 pr-4 text-[14px] leading-7 text-[#0A2540]/70 sm:pl-10 sm:text-[15px] sm:leading-8">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
