"use client";

import { Inbox, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JamOperasionalItem } from "@/lib/jamOperasional";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";

type JamOperasionalTableProps = {
  items: JamOperasionalItem[];
  loading: boolean;
  onEdit: (item: JamOperasionalItem) => void;
  onDelete: (item: JamOperasionalItem) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function JamOperasionalTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: JamOperasionalTableProps) {
  const showSkeleton = loading && items.length === 0;
  const showEmpty = !loading && items.length === 0;

  return (
    <div className="relative">
      {!showEmpty && (
        <Table
          aria-busy={loading}
          containerClassName="dash-table-scroll"
          className="w-full table-fixed"
        >
          <TableCaption className="sr-only">Daftar Jam Operasional</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[38%] px-4 text-xs font-medium text-slate-500">
                Hari / Jadwal
              </TableHead>
              <TableHead className="h-10 w-[26%] px-4 text-xs font-medium text-slate-500">
                Jam Kerja
              </TableHead>
              <TableHead className="h-10 w-[10%] px-3 text-center text-xs font-medium text-slate-500">
                Urutan
              </TableHead>
              <TableHead className="h-10 w-[14%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[12%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={5} rows={3} />}

            {!showSkeleton &&
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  {/* Hari */}
                  <TableCell className="w-[38%] px-4 py-3.5 align-middle whitespace-normal">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {item.day_label}
                    </p>
                  </TableCell>

                  {/* Jam Kerja */}
                  <TableCell className="w-[26%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        item.is_closed ? "text-[#A82020]" : "text-[#0A2540]/80"
                      }`}
                    >
                      {item.hours}
                    </span>
                    {item.is_closed && (
                      <span className="ml-2 inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 border border-rose-200/60">
                        Libur
                      </span>
                    )}
                  </TableCell>

                  {/* Urutan */}
                  <TableCell className="w-[10%] px-3 py-3.5 text-center align-middle whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {String(item.sort_order).padStart(2, "0")}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-[14%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <StatusBadge tone={item.is_active ? "success" : "neutral"}>
                      {item.is_active ? "Aktif" : "Non-aktif"}
                    </StatusBadge>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="w-[12%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                    <RowActions
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      editLabel="Edit Jadwal"
                      deleteLabel="Hapus Jadwal"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      {showEmpty && (
        <div className="p-8">
          <DataTableEmpty
            icon={hasFilters ? <SearchX /> : <Inbox />}
            title={
              hasFilters
                ? "Tidak ada jadwal yang cocok"
                : "Belum ada jadwal operasional"
            }
            description={
              hasFilters
                ? "Coba ubah kata kunci pencarian atau tampilkan status non-aktif."
                : "Tambahkan baris jadwal hari kerja pertama Anda."
            }
            action={
              hasFilters
                ? onResetFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onResetFilters}
                      className="h-9 rounded-md border-slate-200 text-xs font-medium text-slate-600"
                    >
                      Reset filter
                    </Button>
                  )
                : onCreate && (
                    <Button
                      type="button"
                      onClick={onCreate}
                      className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-3.5 text-xs font-semibold text-white hover:bg-[#071a2e]"
                    >
                      <Plus aria-hidden="true" className="size-4" />
                      Tambah Jadwal
                    </Button>
                  )
            }
          />
        </div>
      )}
    </div>
  );
}

export default JamOperasionalTable;
