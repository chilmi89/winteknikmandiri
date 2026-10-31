import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
  /** Hilangkan padding dalam (mis. untuk tabel full-bleed). */
  flush?: boolean;
};

export function Panel({ children, className, flush = false }: PanelProps) {
  return (
    <section
      className={cn(
        "border border-[#0A2540]/10 bg-white shadow-[0_1px_2px_rgba(10,37,64,0.04)]",
        !flush && "p-5 sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

type PanelHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PanelHeader({
  title,
  description,
  action,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-[#0A2540]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-[#0A2540]">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-[#0A2540]/55">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export default Panel;
