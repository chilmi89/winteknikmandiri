import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

export default function FloatingTechnicianBadge() {
  return (
    <Link
      href={waLink(
        "Halo CV Win Teknik Mandiri, saya ingin konsultasi atau memanggil teknisi AC di Kediri."
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Konsultasi via WhatsApp"
      className={`group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 border border-[#0A2540]/10 bg-white px-3.5 py-3 text-sm font-medium text-[#0A2540] shadow-[0_8px_28px_rgba(10,37,64,0.14)] transition-colors hover:border-[#A82020]/40 hover:text-[#A82020] sm:bottom-7 sm:right-7 sm:px-4 lg:hidden ${focusRing}`}
    >
      <MessageCircle className="size-5 text-[#A82020]" aria-hidden="true" />
      <span className="hidden sm:inline">Chat WhatsApp</span>
      <ArrowUpRight
        className="hidden size-4 text-[#0A2540]/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A82020] sm:block"
        aria-hidden="true"
      />
    </Link>
  );
}
