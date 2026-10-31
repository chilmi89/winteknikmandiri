"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  dir: SortDirection;
} | null;

type UseDataTableOptions<T> = {
  data: T[];
  /** Kolom yang ikut dicari (key dari object data). */
  searchKeys: string[];
  pageSize?: number;
  initialSort?: SortState;
};

function readValue(row: unknown, key: string): unknown {
  if (row && typeof row === "object" && key in row) {
    return (row as Record<string, unknown>)[key];
  }
  return undefined;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === "number" && typeof b === "number") return a - b;

  const dateA = Date.parse(String(a));
  const dateB = Date.parse(String(b));
  if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) return dateA - dateB;

  return String(a).localeCompare(String(b), "id", { sensitivity: "base" });
}

/**
 * Logika tabel reusable: pencarian, pengurutan, dan pagination.
 * Semua terjadi di client agar page tinggal menyuplai `data` + `columns`.
 */
export function useDataTable<T>({
  data,
  searchKeys,
  pageSize = 10,
  initialSort = null,
}: UseDataTableOptions<T>) {
  const [query, setQueryState] = useState("");
  const [sort, setSort] = useState<SortState>(initialSort);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;

    return data.filter((row) =>
      searchKeys.some((key) =>
        String(readValue(row, key) ?? "")
          .toLowerCase()
          .includes(needle)
      )
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const rows = [...filtered];
    rows.sort((a, b) => {
      const result = compareValues(readValue(a, sort.key), readValue(b, sort.key));
      return sort.dir === "asc" ? result : -result;
    });
    return rows;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  function setQuery(value: string) {
    setQueryState(value);
    setPage(1);
  }

  function toggleSort(key: string) {
    setSort((previous) => {
      if (previous?.key !== key) return { key, dir: "asc" };
      return { key, dir: previous.dir === "asc" ? "desc" : "asc" };
    });
  }

  return {
    rows,
    total: sorted.length,
    totalUnfiltered: data.length,
    query,
    setQuery,
    sort,
    toggleSort,
    page: currentPage,
    setPage,
    pageCount,
    pageSize,
    rangeStart: sorted.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, sorted.length),
  };
}
