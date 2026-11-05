import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

type DataTableSkeletonProps = {
  columns: number;
  rows?: number;
};

export function DataTableSkeleton({
  columns,
  rows = 5,
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`} className="border-slate-100">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <TableCell key={`skeleton-${rowIndex}-${columnIndex}`} className="px-4 py-4">
              <Skeleton
                className={
                  columnIndex === 0
                    ? "h-4 w-3/4 max-w-[280px]"
                    : "h-4 w-16 max-w-full"
                }
              />
              {columnIndex === 0 && (
                <Skeleton className="mt-2 h-3 w-1/2 max-w-[220px]" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default DataTableSkeleton;
