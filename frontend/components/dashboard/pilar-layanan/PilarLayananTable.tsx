"use client";

import { Inbox, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PilarLayananItem } from "@/lib/pilarLayanan";
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
          className="min-w-[860px]"
        >
          <TableCaption className="sr-only">Daftar Pilar Layanan</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[8%] px-3 text-center text-xs font-medium text-slate-500">
                Kode
              </TableHead>
              <TableHead className="h-10 w-[38%] px-4 text-xs font-medium text-slate-500">
                Judul & Deskripsi
              </TableHead>
              <TableHead className="h-10 w-[18%] px-4 text-xs font-medium text-slate-500">
                Tautan / Link
              </TableHead>
              <TableHead className="h-10 w-[12%] px-4 text-center text-xs font-medium text-slate-500">
                Tipe Kartu
              </TableHead>
              <TableHead className="h-10 w-[8%] px-3 text-center text-xs font-medium text-slate-500">
                Urutan
              </TableHead>
              <TableHead className="h-10 w-[8%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[8%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={7} rows={6} />}

            {!showSkeleton &&
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  <TableCell className="w-[8%] px-3 py-3.5 text-center align-middle font-mono text-xs font-bold text-[#A82020]">
                    {item.code || "—"}
                  </TableCell>

                  <TableCell className="w-[38%] px-4 py-3.5 align-middle whitespace-normal">
                    <p
                      className="line-clamp-1 text-[13px] font-semibold text-slate-900"
                      title={item.title}
                    >
                      {item.title}
                    </p>
                    <p
                      className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-slate-500"
                      title={item.description}
                    >
                      {item.description || "—"}
                    </p>
                  </TableCell>

                  <TableCell className="w-[18%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <span
                      className="line-clamp-1 font-mono text-[11px] text-slate-600 underline underline-offset-2"
                      title={item.link_url}
                    >
                      {item.link_url}
                    </span>
                  </TableCell>

                  <TableCell className="w-[12%] px-4 py-3.5 text-center align-middle whitespace-nowrap">
                    {item.is_featured ? (
                      <Badge className="bg-[#A82020] text-white hover:bg-[#8e1919] text-[10px]">
                        Aksen Merah
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-300 text-slate-600 text-[10px]">
                        Standar (Putih)
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="w-[8%] px-3 py-3.5 text-center align-middle font-mono text-xs text-slate-600">
                    {String(item.sort_order).padStart(2, "0")}
                  </TableCell>

                  <TableCell className="w-[8%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <StatusBadge tone={item.is_active ? "success" : "neutral"}>
                      {item.is_active ? "Aktif" : "Non-aktif"}
                    </StatusBadge>
                  </TableCell>

                  <TableCell className="w-[8%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                    <RowActions
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      editLabel="Edit Pilar"
                      deleteLabel="Hapus Pilar"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      {showEmpty && (
        <DataTableEmpty
          icon={hasFilters ? <SearchX /> : <Inbox />}
          title={hasFilters ? "Tidak ada pilar layanan yang cocok" : "Belum ada pilar layanan"}
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
                    className="h-9 gap-1.5 rounded-md bg-[#A82020] px-3.5 text-xs font-semibold text-white hover:bg-[#8e1919]"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Tambah Pilar
                  </Button>
                )
          }
        />
      )}
    </div>
  );
}

export default PilarLayananTable;
