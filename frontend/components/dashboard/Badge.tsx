import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "pending"
  | "progress"
  | "success"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "border-[#0A2540]/15 bg-[#0A2540]/5 text-[#0A2540]/70",
  pending: "border-[#B7791F]/25 bg-[#B7791F]/10 text-[#8A5A12]",
  progress: "border-[#1E6FA8]/25 bg-[#8ACFF8]/20 text-[#15527D]",
  success: "border-[#0F7B5F]/25 bg-[#0F7B5F]/10 text-[#0B5C47]",
  danger: "border-[#A82020]/25 bg-[#A82020]/10 text-[#8E1919]",
  info: "border-[#0A2540]/20 bg-white text-[#0A2540]",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  /** Titik indikator kecil di kiri. */
  dot?: boolean;
};

export function Badge({ children, tone = "neutral", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}

/** Peta status permohonan → tone badge. */
export function statusTone(status: string): BadgeTone {
  switch (status.toLowerCase()) {
    case "pending":
      return "pending";
    case "diproses":
    case "proses":
      return "progress";
    case "selesai":
      return "success";
    case "batal":
    case "ditolak":
      return "danger";
    default:
      return "neutral";
  }
}

export function statusLabel(status: string): string {
  const value = status.trim();
  if (!value) return "Tanpa status";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default Badge;
