import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

/** Placeholder shimmer saat data tabel dimuat. */
export function TableSkeleton({
  rows = 6,
  columns = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden", className)} aria-hidden="true">
      <div className="flex items-center gap-4 border-b border-[#0A2540]/10 bg-[#0A2540]/[0.03] px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={`head-${index}`}
            className="dash-skeleton h-3 flex-1"
            style={{ maxWidth: index === 0 ? 140 : 110 }}
          />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex items-center gap-4 border-b border-[#0A2540]/6 px-4 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="dash-skeleton h-3.5 flex-1"
              style={{
                maxWidth: colIndex === 0 ? 180 : 120,
                opacity: 1 - colIndex * 0.12,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
