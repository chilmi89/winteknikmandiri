"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPages(current: number, count: number): (number | "gap")[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(count - 1, current + 1);

  if (start > 2) pages.push("gap");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < count - 1) pages.push("gap");
  pages.push(count);

  return pages;
}

const itemBase =
  "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020] disabled:pointer-events-none disabled:opacity-40";

export function TablePagination({
  page,
  pageCount,
  pageSize,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
  className,
}: TablePaginationProps) {
  const pages = buildPages(page, pageCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-[#0A2540]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
        className
      )}
    >
      <p className="text-xs text-[#0A2540]/55">
        Menampilkan{" "}
        <span className="font-semibold text-[#0A2540]">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        dari <span className="font-semibold text-[#0A2540]">{total}</span> data
        <span className="hidden sm:inline"> · {pageSize} per halaman</span>
      </p>

      <nav
        aria-label="Navigasi halaman tabel"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className={cn(
            itemBase,
            "border-[#0A2540]/12 text-[#0A2540]/70 hover:border-[#0A2540]/30 hover:text-[#0A2540]"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        {pages.map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              className="px-1 text-xs text-[#0A2540]/35"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Halaman ${item}`}
              className={cn(
                itemBase,
                item === page
                  ? "border-[#A82020] bg-[#A82020] text-white"
                  : "border-[#0A2540]/12 text-[#0A2540]/70 hover:border-[#0A2540]/30 hover:text-[#0A2540]"
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Halaman berikutnya"
          className={cn(
            itemBase,
            "border-[#0A2540]/12 text-[#0A2540]/70 hover:border-[#0A2540]/30 hover:text-[#0A2540]"
          )}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

export default TablePagination;
