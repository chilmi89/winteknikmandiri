import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul di sini setelah tersedia.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "dash-fade flex flex-col items-center justify-center px-6 py-14 text-center",
        className
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center border border-[#0A2540]/10 bg-[#F4FAFE] text-[#0A2540]/40">
        {icon ?? <Inbox className="size-6" aria-hidden="true" />}
      </span>
      <h3 className="text-sm font-semibold text-[#0A2540]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#0A2540]/50">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
