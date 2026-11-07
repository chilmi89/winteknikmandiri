"use client";

import Image from "next/image";
import { Inbox, Plus, SearchX, Wrench } from "lucide-react";
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
import type { ServiceItem } from "@/lib/katalogLayanan";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";

type ServiceItemTableProps = {
  items: ServiceItem[];
  loading: boolean;
  onEdit: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function ServiceItemTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: ServiceItemTableProps) {
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
          <TableCaption className="sr-only">Daftar Layanan</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[10%] px-4 text-xs font-medium text-slate-500">
                Foto
              </TableHead>
              <TableHead className="h-10 w-[38%] px-4 text-xs font-medium text-slate-500">
                Layanan &amp; Highlights
              </TableHead>
              <TableHead className="h-10 w-[20%] px-4 text-xs font-medium text-slate-500">
                Kategori
              </TableHead>
              <TableHead className="h-10 w-[14%] px-4 text-xs font-medium text-slate-500">
                Tarif / Biaya
              </TableHead>
              <TableHead className="h-10 w-[9%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[9%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={6} rows={6} />}

            {!showSkeleton &&
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  {/* Foto Thumbnail */}
                  <TableCell className="w-[10%] px-4 py-3 align-middle">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-slate-400">
                          <Wrench className="size-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Judul & Highlights */}
                  <TableCell className="w-[38%] px-4 py-3.5 align-middle whitespace-normal">
                    <p
                      className="text-[13px] font-semibold text-slate-900 line-clamp-1"
                      title={item.title}
                    >
                      {item.title}
                    </p>
                    <p
                      className="mt-0.5 text-xs text-slate-500 line-clamp-1"
                      title={item.description}
                    >
                      {item.description || "—"}
                    </p>
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.highlights.slice(0, 3).map((h, i) => (
                          <span
                            key={i}
                            className="inline-block rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-medium text-[#A82020] border border-rose-200/60"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  {/* Kategori */}
                  <TableCell className="w-[20%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                      <span className="font-mono text-[10px] font-bold text-[#A82020]">
                        {item.category_code || "—"}
                      </span>
                      <span>{item.category_name || "Layanan"}</span>
                    </span>
                  </TableCell>

                  {/* Tarif / Biaya */}
                  <TableCell className="w-[14%] px-4 py-3.5 align-middle whitespace-nowrap">
                    {item.price ? (
                      <div>
                        <span className="font-mono text-xs font-bold text-[#A82020]">
                          {item.price}
                        </span>
                        <span className="ml-1 text-[11px] text-slate-500">
                          {item.unit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-600">
                        Penawaran
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-[9%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <StatusBadge tone={item.is_active ? "success" : "neutral"}>
                      {item.is_active ? "Aktif" : "Non-aktif"}
                    </StatusBadge>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="w-[9%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                    <RowActions
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      editLabel="Edit Layanan"
                      deleteLabel="Hapus Layanan"
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
            title={hasFilters ? "Tidak ada layanan yang cocok" : "Belum ada layanan"}
            description={
              hasFilters
                ? "Coba ubah kata kunci pencarian atau kategori."
                : "Tambahkan item layanan pertama Anda."
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
                      Tambah Layanan
                    </Button>
                  )
            }
          />
        </div>
      )}
    </div>
  );
}

export default ServiceItemTable;
