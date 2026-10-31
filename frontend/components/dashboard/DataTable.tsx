"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataTable, type SortState } from "@/lib/dashboard/useDataTable";
import DataTableEmpty from "./EmptyState";
import TablePagination from "./TablePagination";
import TableSkeleton from "./TableSkeleton";
import TableToolbar from "./TableToolbar";

export type DataTableColumn<T> = {
  /** Kunci field pada data (juga dipakai untuk sorting). */
  key: string;
  header: string;
  /** Render kustom sel. */
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** Sembunyikan kolom ini pada tampilan kartu mobile. */
  hideOnMobile?: boolean;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Kolom yang ikut dicari (key dari data). */
  searchKeys: string[];
  pageSize?: number;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  /** Filter tambahan di kiri toolbar. */
  filters?: ReactNode;
  /** Aksi di kanan toolbar (mis. Tambah data). */
  toolbarActions?: ReactNode;
  /** Kolom aksi per baris (opsional). */
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string | number;
  initialSort?: SortState;
  className?: string;
};

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<T>({
  data,
  columns,
  searchKeys,
  pageSize = 10,
  isLoading = false,
  searchPlaceholder = "Cari data…",
  emptyTitle = "Belum ada data",
  emptyMessage = "Data akan muncul di sini setelah tersedia.",
  filters,
  toolbarActions,
  rowActions,
  onRowClick,
  getRowId,
  initialSort,
  className,
}: DataTableProps<T>) {
  const tableId = useId();
  const {
    rows,
    total,
    query,
    setQuery,
    sort,
    toggleSort,
    page,
    setPage,
    pageCount,
    rangeStart,
    rangeEnd,
  } = useDataTable<T>({ data, searchKeys, pageSize, initialSort });

  const mobileColumns = columns.filter((column) => !column.hideOnMobile);

  function rowKey(row: T, index: number): string | number {
    if (getRowId) return getRowId(row);
    if (row && typeof row === "object" && "id" in row) {
      return String((row as Record<string, unknown>).id);
    }
    return index;
  }

  function renderCell(row: T, column: DataTableColumn<T>): ReactNode {
    if (column.render) return column.render(row);
    if (row && typeof row === "object" && column.key in row) {
      const value = (row as Record<string, unknown>)[column.key];
      return value == null || value === "" ? "—" : String(value);
    }
    return "—";
  }

  return (
    <div
      className={cn(
        "border border-[#0A2540]/10 bg-white shadow-[0_1px_2px_rgba(10,37,64,0.04)]",
        className
      )}
    >
      <TableToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder={searchPlaceholder}
        filters={filters}
        actions={toolbarActions}
      />

      {isLoading ? (
        <TableSkeleton rows={Math.min(pageSize, 6)} columns={columns.length || 4} />
      ) : total === 0 ? (
        <DataTableEmpty
          title={query ? "Pencarian tidak ditemukan" : emptyTitle}
          description={
            query
              ? `Tidak ada data yang cocok dengan “${query}”. Coba kata kunci lain.`
              : emptyMessage
          }
        />
      ) : (
        <>
          {/* ================= Desktop / tablet ================= */}
          <div className="dash-scroll hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">
                Tabel data dashboard, dapat diurutkan dan dipaginasi
              </caption>
              <thead>
                <tr className="border-b border-[#0A2540]/10 bg-[#0A2540]/[0.03]">
                  {columns.map((column) => {
                    const active = sort?.key === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        className={cn(
                          "px-4 py-3 text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap text-[#0A2540]/55 uppercase",
                          alignClass[column.align ?? "left"],
                          column.headerClassName
                        )}
                      >
                        {column.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column.key)}
                            className={cn(
                              "inline-flex items-center gap-1.5 transition-colors hover:text-[#0A2540]",
                              active && "text-[#A82020]"
                            )}
                            aria-label={`Urutkan berdasarkan ${column.header}`}
                          >
                            {column.header}
                            {active ? (
                              sort?.dir === "asc" ? (
                                <ArrowUp className="size-3" aria-hidden="true" />
                              ) : (
                                <ArrowDown className="size-3" aria-hidden="true" />
                              )
                            ) : (
                              <ArrowUpDown
                                className="size-3 opacity-40"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
                  {rowActions ? (
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.1em] text-[#0A2540]/55 uppercase"
                    >
                      Aksi
                    </th>
                  ) : null}
                </tr>
              </thead>

              <tbody id={tableId}>
                {rows.map((row, index) => (
                  <tr
                    key={rowKey(row, index)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-[#0A2540]/6 transition-colors last:border-b-0 hover:bg-[#F4FAFE]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3.5 align-middle text-[13px] text-[#0A2540]/80",
                          alignClass[column.align ?? "left"],
                          column.className
                        )}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td
                        className="px-4 py-2.5 text-right align-middle"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {rowActions(row)}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= Mobile: stacked cards ================= */}
          <ul className="divide-y divide-[#0A2540]/8 sm:hidden">
            {rows.map((row, index) => (
              <li
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "dash-fade px-4 py-4",
                  onRowClick && "cursor-pointer active:bg-[#F4FAFE]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-[13px] font-semibold text-[#0A2540]">
                    {renderCell(row, mobileColumns[0] ?? columns[0])}
                  </div>
                  {rowActions ? (
                    <div className="flex shrink-0 items-center gap-1">
                      {rowActions(row)}
                    </div>
                  ) : null}
                </div>

                <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {mobileColumns.slice(1).map((column) => (
                    <div key={column.key} className="min-w-0">
                      <dt className="text-[10px] font-semibold tracking-wider text-[#0A2540]/40 uppercase">
                        {column.header}
                      </dt>
                      <dd className="truncate text-xs text-[#0A2540]/75">
                        {renderCell(row, column)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      {!isLoading && total > 0 ? (
        <TablePagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

export default DataTable;
