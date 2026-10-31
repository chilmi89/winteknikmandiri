"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SearchInput from "./SearchInput";

type TableToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  /** Elemen filter tambahan di kiri (mis. dropdown kategori). */
  filters?: ReactNode;
  /** Aksi di kanan (mis. tombol Tambah / Export). */
  actions?: ReactNode;
  className?: string;
};

export function TableToolbar({
  query,
  onQueryChange,
  placeholder = "Cari data…",
  filters,
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-[#0A2540]/10 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder={placeholder}
          className="sm:max-w-xs"
          ariaLabel="Cari di tabel"
        />
        {filters ? (
          <div className="flex items-center gap-2">{filters}</div>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default TableToolbar;
