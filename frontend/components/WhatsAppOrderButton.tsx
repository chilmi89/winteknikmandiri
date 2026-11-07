"use client";

import { useTransition } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { triggerClickOrder } from "@/lib/orders";

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
  serviceId,
  categoryId,
  className = "",
  label = "Pesan layanan",
}: WhatsAppOrderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      try {
        const res = await triggerClickOrder({
          category: category.trim(),
          service: service.trim(),
          price: price.trim(),
          service_id: serviceId,
          category_id: categoryId,
        });

        if (res.wa_url) {
          window.open(res.wa_url, "_blank", "noopener,noreferrer");
        }
      } catch {
        // Fallback jika API offline: buka WA langsung
        const fallbackText = `Halo CV Win Teknik Mandiri,\nsaya ingin memesan layanan *${service} (${price})* . Apakah bisa dibantu untuk jadwal pengerjaannya? Terima kasih.`;
        const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6283136830913";
        window.open(
          `https://wa.me/${waPhone}?text=${encodeURIComponent(fallbackText)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer ${className}`}
    >
      {isPending ? (
        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <MessageCircle className="size-3.5" aria-hidden="true" />
      )}
      <span>{label}</span>
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </button>
  );
}
