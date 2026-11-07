"use client";

import Image from "next/image";
import { Inbox, Plus, SearchX, Users } from "lucide-react";
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
import type { TeamMemberItem } from "@/lib/teamMembers";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";

type TeamTableProps = {
  items: TeamMemberItem[];
  loading: boolean;
  onEdit: (item: TeamMemberItem) => void;
  onDelete: (item: TeamMemberItem) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function TeamTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: TeamTableProps) {
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
          <TableCaption className="sr-only">Daftar Tim Teknisi</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[12%] px-4 text-xs font-medium text-slate-500">
                Foto
              </TableHead>
              <TableHead className="h-10 w-[38%] px-4 text-xs font-medium text-slate-500">
                Nama Tim
              </TableHead>
              <TableHead className="h-10 w-[30%] px-4 text-xs font-medium text-slate-500">
                Skill / Spesialisasi
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
            {showSkeleton && <DataTableSkeleton columns={5} rows={4} />}

            {!showSkeleton &&
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  {/* Foto Thumbnail */}
                  <TableCell className="w-[12%] px-4 py-3 align-middle">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-slate-400">
                          <Users className="size-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Nama Tim */}
                  <TableCell className="w-[38%] px-4 py-3.5 align-middle whitespace-normal">
                    <p className="text-[13px] font-semibold text-slate-900 line-clamp-1">
                      {item.name}
                    </p>
                  </TableCell>

                  {/* Skill / Peran */}
                  <TableCell className="w-[30%] px-4 py-3.5 align-middle whitespace-normal">
                    <span className="text-xs text-slate-600 line-clamp-2">
                      {item.skill}
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
                      editLabel="Edit Tim"
                      deleteLabel="Hapus Tim"
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
            title={hasFilters ? "Tidak ada tim yang cocok" : "Belum ada data tim"}
            description={
              hasFilters
                ? "Coba ubah kata kunci pencarian atau tampilkan status non-aktif."
                : "Tambahkan anggota tim teknisi pertama Anda."
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
                      Tambah Tim
                    </Button>
                  )
            }
          />
        </div>
      )}
    </div>
  );
}

export default TeamTable;
