import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral"
  | "violet";

const DOTS: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  danger: "bg-rose-500",
  neutral: "bg-slate-400",
  violet: "bg-violet-500",
};

type StatusBadgeProps = {
  tone?: StatusTone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
};

export function StatusBadge({
  tone = "neutral",
  children,
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 rounded-md border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600",
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0 rounded-full", DOTS[tone])}
        />
      )}
      {children}
    </Badge>
  );
}

export default StatusBadge;
