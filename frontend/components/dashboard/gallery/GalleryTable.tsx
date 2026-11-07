"use client";

import Image from "next/image";
import { Inbox, Plus, SearchX, Images } from "lucide-react";
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
import type { GalleryProject } from "@/lib/galleryService";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";
import { Badge } from "@/components/ui/badge";

type GalleryTableProps = {
  items: GalleryProject[];
  loading: boolean;
  onEdit: (item: GalleryProject) => void;
  onDelete: (item: GalleryProject) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function GalleryTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: GalleryTableProps) {
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
          <TableCaption className="sr-only">Daftar Galeri Proyek</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[10%] px-4 text-xs font-medium text-slate-500">
                Foto
              </TableHead>
              <TableHead className="h-10 w-[36%] px-4 text-xs font-medium text-slate-500">
                Judul &amp; Klien
              </TableHead>
              <TableHead className="h-10 w-[18%] px-4 text-xs font-medium text-slate-500">
                Kategori
              </TableHead>
              <TableHead className="h-10 w-[18%] px-4 text-xs font-medium text-slate-500">
                Lokasi / Lingkup
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
                          <Images className="size-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Judul & Klien */}
                  <TableCell className="w-[36%] px-4 py-3.5 align-middle whitespace-normal">
                    {item.client && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#A82020] font-semibold">
                        {item.client}
                      </p>
                    )}
                    <p
                      className="text-[13px] font-semibold text-slate-900 line-clamp-1"
                      title={item.title}
                    >
                      {item.title}
                    </p>
                    {item.scope && (
                      <p
                        className="mt-0.5 text-xs text-slate-500 line-clamp-1"
                        title={item.scope}
                      >
                        Lingkup: {item.scope}
                      </p>
                    )}
                  </TableCell>

                  {/* Kategori */}
                  <TableCell className="w-[18%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {item.category}
                    </span>
                  </TableCell>

                  {/* Lokasi */}
                  <TableCell className="w-[18%] px-4 py-3.5 align-middle whitespace-normal text-xs text-slate-600">
                    <p className="line-clamp-1">{item.location || "—"}</p>
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
                      editLabel="Edit Proyek"
                      deleteLabel="Hapus Proyek"
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
            title={hasFilters ? "Tidak ada proyek yang cocok" : "Belum ada data proyek"}
            description={
              hasFilters
                ? "Coba ubah kata kunci pencarian, filter kategori, atau tampilkan status non-aktif."
                : "Tambahkan dokumentasi proyek pertama Anda."
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
                      Tambah Proyek
                    </Button>
                  )
            }
          />
        </div>
      )}
    </div>
  );
}

export default GalleryTable;
