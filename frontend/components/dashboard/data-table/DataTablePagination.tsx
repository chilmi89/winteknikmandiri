"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type DataTablePaginationProps = {
  page: number;
  pageCount: number;
  pageStart: number;
  pageEnd: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
};

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);

  return items;
}

export function DataTablePagination({
  page,
  pageCount,
  pageStart,
  pageEnd,
  total,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  loading = false,
  onPageChange,
  onPageSizeChange,
  className,
}: DataTablePaginationProps) {
  const pages = getPageItems(page, pageCount);
  const pageSizeItems = pageSizeOptions.map((size) => ({
    label: `${size} / halaman`,
    value: String(size),
  }));

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-slate-500">
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <Spinner className="size-3" />
            Memuat data…
          </span>
        ) : (
          <>
            Menampilkan{" "}
            <span className="font-medium text-slate-700">{pageStart}</span>
            {"–"}
            <span className="font-medium text-slate-700">{pageEnd}</span> dari{" "}
            <span className="font-medium text-slate-700">{total}</span> data
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={pageSizeItems}
          value={String(pageSize)}
          onValueChange={(value) => {
            if (value) onPageSizeChange(Number(value));
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label="Jumlah data per halaman"
            className="h-8 w-[124px] rounded-md border-slate-200 bg-white text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {pageSizeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            aria-label="Halaman sebelumnya"
            className="rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>

          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex size-7 items-center justify-center text-slate-400"
              >
                <MoreHorizontal className="size-3.5" />
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => onPageChange(item)}
                disabled={loading}
                aria-label={`Halaman ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  "rounded-md text-xs font-medium tabular-nums",
                  item === page
                    ? "bg-[#0A2540] text-white hover:bg-[#0A2540]/90"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount || loading}
            aria-label="Halaman berikutnya"
            className="rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTablePagination;
