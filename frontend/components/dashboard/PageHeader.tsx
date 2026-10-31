import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Label kecil di atas judul (mis. "Operasional"). */
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

/**
 * Header halaman dashboard dengan aksen merah khas WTM.
 * Dipakai di semua page: <PageHeader title="..." actions={<Button/>} />
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "dash-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <span className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-[#A82020] uppercase">
            {eyebrow}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="mb-2.5 block h-1 w-10 bg-[#A82020]"
          />
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2540] sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#0A2540]/55">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default PageHeader;
