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
import type { PilarLayananItem } from "@/lib/pilarLayanan";
import { formatDate } from "@/lib/dashboard/format";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";
import { Badge } from "@/components/ui/badge";

type PilarLayananTableProps = {
  items: PilarLayananItem[];
  loading: boolean;
  onEdit: (item: PilarLayananItem) => void;
  onDelete: (item: PilarLayananItem) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function PilarLayananTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: PilarLayananTableProps) {
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
          <TableCaption className="sr-only">Daftar Pilar Layanan</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[42%] px-4 text-xs font-medium text-slate-500">
                Pilar Layanan
              </TableHead>
              <TableHead className="h-10 w-[16%] px-4 text-xs font-medium text-slate-500">
                Tautan
              </TableHead>
              <TableHead className="h-10 w-[14%] px-4 text-xs font-medium text-slate-500">
                Tipe Kartu
              </TableHead>
              <TableHead className="h-10 w-[8%] px-3 text-center text-xs font-medium text-slate-500">
                Urutan
              </TableHead>
              <TableHead className="h-10 w-[10%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[10%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={6} rows={6} />}

            {!showSkeleton &&
              items.map((item) => {
                const isWhatsApp = item.link_url.includes("wa.me");

                return (
                  <TableRow
                    key={item.id}
                    className="border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    {/* Pilar Layanan: Judul & Deskripsi */}
                    <TableCell className="w-[42%] px-4 py-3.5 align-middle whitespace-normal">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-bold text-[#A82020] shrink-0">
                          {item.code || "—"}
                        </span>
                        <p
                          className="text-[13px] font-medium text-slate-900 line-clamp-1"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                      </div>
                      <p
                        className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-1 pl-6"
                        title={item.description}
                      >
                        {item.description || "—"}
                      </p>
                    </TableCell>

                    {/* Tautan */}
                    <TableCell className="w-[16%] px-4 py-3.5 align-middle whitespace-nowrap">
                      {isWhatsApp ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                          WhatsApp Chat
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">
                          {item.link_url}
                        </span>
                      )}
                    </TableCell>

                    {/* Tipe Kartu */}
                    <TableCell className="w-[14%] px-4 py-3.5 align-middle whitespace-nowrap">
                      {item.is_featured ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-[#A82020] border border-rose-200/80">
                          Aksen Merah
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">
                          Standar (Putih)
                        </span>
                      )}
                    </TableCell>

                    {/* Urutan */}
                    <TableCell className="w-[8%] px-3 py-3.5 text-center align-middle whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {String(item.sort_order).padStart(2, "0")}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="w-[10%] px-4 py-3.5 align-middle whitespace-nowrap">
                      <StatusBadge tone={item.is_active ? "success" : "neutral"}>
                        {item.is_active ? "Aktif" : "Non-aktif"}
                      </StatusBadge>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="w-[10%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                      <RowActions
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item)}
                        editLabel="Edit Pilar"
                        deleteLabel="Hapus Pilar"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      )}

      {showEmpty && (
        <div className="p-8">
          <DataTableEmpty
            icon={hasFilters ? <SearchX /> : <Inbox />}
            title={
              hasFilters
                ? "Tidak ada pilar layanan yang cocok"
                : "Belum ada pilar layanan"
            }
            description={
              hasFilters
                ? "Coba ubah kata kunci pencarian atau tampilkan status non-aktif."
                : "Tambahkan pilar layanan pertama untuk ditampilkan di section beranda."
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
                      Tambah Pilar
                    </Button>
                  )
            }
          />
        </div>
      )}
    </div>
  );
}

export default PilarLayananTable;
