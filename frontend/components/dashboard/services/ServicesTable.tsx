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
import type { ServiceItem } from "@/lib/dashboard/services";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import StatusBadge from "@/components/dashboard/data-table/StatusBadge";

type ServicesTableProps = {
  items: ServiceItem[];
  loading: boolean;
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function ServicesTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: ServicesTableProps) {
  const showSkeleton = loading && items.length === 0;
  const showEmpty = !loading && items.length === 0;

  return (
    <div className="relative">
      {!showEmpty && (
        <Table
          aria-busy={loading}
          containerClassName="dash-table-scroll"
          className="min-w-[920px]"
        >
          <TableCaption className="sr-only">Daftar Layanan</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[42%] px-4 text-xs font-medium text-slate-500">
                Layanan & Deskripsi
              </TableHead>
              <TableHead className="h-10 w-[18%] px-4 text-xs font-medium text-slate-500">
                Kategori
              </TableHead>
              <TableHead className="h-10 w-[16%] px-4 text-xs font-medium text-slate-500">
                Tarif / Biaya
              </TableHead>
              <TableHead className="h-10 w-[8%] px-3 text-center text-xs font-medium text-slate-500">
                Urutan
              </TableHead>
              <TableHead className="h-10 w-[10%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[6%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={6} rows={5} />}

            {!showSkeleton &&
              items.map((service) => (
                <TableRow
                  key={service.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  <TableCell className="w-[42%] px-4 py-3 align-middle whitespace-normal">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        {service.image_url ? (
                          <Image
                            src={service.image_url}
                            alt={service.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-slate-400">
                            <Wrench className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="line-clamp-1 text-[13px] font-medium text-slate-900"
                          title={service.title}
                        >
                          {service.title}
                        </p>
                        <p
                          className="mt-0.5 line-clamp-1 text-xs text-slate-500"
                          title={service.summary}
                        >
                          {service.summary || service.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="w-[18%] px-4 py-3 align-middle whitespace-nowrap">
                    <span className="text-xs text-slate-600">
                      {service.category || "Umum"}
                    </span>
                  </TableCell>

                  <TableCell className="w-[16%] px-4 py-3 align-middle whitespace-nowrap">
                    <div className="text-xs">
                      {service.price ? (
                        <>
                          <span className="text-slate-400">{service.price_prefix} </span>
                          <span className="font-semibold text-slate-800">{service.price}</span>
                          <span className="text-slate-400"> {service.unit}</span>
                        </>
                      ) : (
                        <span className="text-slate-500">Konsultasi / Kustom</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="w-[8%] px-3 py-3 text-center align-middle whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {String(service.sort_order).padStart(2, "0")}
                    </span>
                  </TableCell>

                  <TableCell className="w-[10%] px-4 py-3 align-middle whitespace-nowrap">
                    <StatusBadge tone={service.is_active ? "success" : "neutral"}>
                      {service.is_active ? "Aktif" : "Non-aktif"}
                    </StatusBadge>
                  </TableCell>

                  <TableCell className="w-[6%] px-4 py-3 text-right align-middle whitespace-nowrap">
                    <RowActions
                      onEdit={() => onEdit(service)}
                      onDelete={() => onDelete(service)}
                      editLabel="Edit layanan"
                      deleteLabel="Hapus layanan"
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
          title={hasFilters ? "Tidak ada layanan yang cocok" : "Belum ada layanan"}
          description={
            hasFilters
              ? "Coba ubah kata kunci atau pilih kategori lain pada filter."
              : "Tambahkan layanan AC atau tata udara pertama agar tampil di website publik."
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
                    className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-3.5 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
                  >
                    <Plus aria-hidden="true" />
                    Tambah Layanan
                  </Button>
                )
          }
        />
      )}
    </div>
  );
}

export default ServicesTable;
