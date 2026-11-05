import { cn } from "@/lib/utils";

type DataTableShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function DataTableShell({ children, className }: DataTableShellProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

export default DataTableShell;
