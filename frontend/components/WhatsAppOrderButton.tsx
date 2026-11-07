"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";

type WhatsAppOrderButtonProps = {
  category: string;
  service: string;
  price: string;
  serviceId?: string;
  categoryId?: string;
  className?: string;
  label?: string;
};

export default function WhatsAppOrderButton({
  category,
  service,
  price,
  className = "",
  label = "Pesan layanan",
}: WhatsAppOrderButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Langsung buka WhatsApp tanpa membuat sampah di database.
    // Database 100% aman dari bot/crawler dan orang iseng.
    const cleanPrice = price ? `(${price})` : "";
    const msg = `Halo CV Win Teknik Mandiri,\nsaya ingin memesan layanan *${service} ${cleanPrice}*.\nApakah bisa dibantu untuk jadwal pengerjaannya? Terima kasih.`;
    const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6283136830913";

    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer ${className}`}
    >
      <MessageCircle className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </button>
  );
}
