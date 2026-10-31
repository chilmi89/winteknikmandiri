import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  /** Persentase perubahan; positif hijau, negatif merah. */
  delta?: number;
  /** Warna aksen garis atas kartu. */
  tone?: "red" | "navy" | "ice" | "green";
  /** Rasio 0–1 untuk bar progres tipis di bawah. */
  progress?: number;
  className?: string;
  /** Delay animasi masuk (1–6). */
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
};

const tones = {
  red: { bar: "bg-[#A82020]", icon: "bg-[#A82020]/8 text-[#A82020]" },
  navy: { bar: "bg-[#0A2540]", icon: "bg-[#0A2540]/6 text-[#0A2540]" },
  ice: { bar: "bg-[#8ACFF8]", icon: "bg-[#8ACFF8]/20 text-[#15527D]" },
  green: { bar: "bg-[#0F7B5F]", icon: "bg-[#0F7B5F]/10 text-[#0B5C47]" },
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  delta,
  tone = "navy",
  progress,
  className,
  delay = 1,
}: StatCardProps) {
  const palette = tones[tone];
  const positive = (delta ?? 0) >= 0;

  return (
    <article
      className={cn(
        "dash-fade-up group relative border border-[#0A2540]/10 bg-white p-5 transition-colors hover:border-[#0A2540]/20",
        `dash-d${delay}`,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-[3px]", palette.bar)}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0A2540]/50 uppercase">
            {label}
          </p>
          <p className="mt-2 text-[26px] leading-none font-bold tracking-tight text-[#0A2540]">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5",
            palette.icon
          )}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-semibold",
              positive ? "text-[#0B5C47]" : "text-[#A82020]"
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span className="text-[#0A2540]/45">{hint}</span> : null}
      </div>

      {typeof progress === "number" ? (
        <div
          aria-hidden="true"
          className="mt-4 h-[3px] w-full overflow-hidden bg-[#0A2540]/8"
        >
          <span
            className={cn("dash-grow block h-full", palette.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}

export default StatCard;
