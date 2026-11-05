import { cn } from "@/lib/utils";

type DataTableToolbarProps = {
  children: React.ReactNode;
  className?: string;
};

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-slate-100 bg-white p-4 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DataTableToolbarGroup({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
      {children}
    </div>
  );
}

export default DataTableToolbar;
