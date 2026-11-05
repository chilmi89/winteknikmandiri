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
import type { Faq } from "@/lib/dashboard/faqs";
import { formatDate } from "@/lib/dashboard/format";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import StatusBadge from "@/components/dashboard/data-table/StatusBadge";

type FaqTableProps = {
  items: Faq[];
  loading: boolean;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function FaqTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: FaqTableProps) {
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
          <TableCaption className="sr-only">Daftar FAQ</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[44%] px-4 text-xs font-medium text-slate-500">
                Pertanyaan & jawaban
              </TableHead>
              <TableHead className="h-10 w-[16%] px-4 text-xs font-medium text-slate-500">
                Kategori
              </TableHead>
              <TableHead className="h-10 w-[8%] px-3 text-center text-xs font-medium text-slate-500">
                Urutan
              </TableHead>
              <TableHead className="h-10 w-[12%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[12%] px-4 text-xs font-medium text-slate-500">
                Diperbarui
              </TableHead>
              <TableHead className="h-10 w-[8%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={6} rows={5} />}

            {!showSkeleton &&
              items.map((faq) => (
                <TableRow
                  key={faq.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  <TableCell className="w-[44%] px-4 py-3.5 align-middle whitespace-normal">
                    <p
                      className="line-clamp-1 text-[13px] font-medium text-slate-900"
                      title={faq.question}
                    >
                      {faq.question}
                    </p>
                    <p
                      className="mt-1 line-clamp-1 text-xs leading-relaxed text-slate-500"
                      title={faq.answer}
                    >
                      {faq.answer}
                    </p>
                  </TableCell>

                  <TableCell className="w-[16%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <span className="text-xs text-slate-600">
                      {faq.category || "Umum"}
                    </span>
                  </TableCell>

                  <TableCell className="w-[8%] px-3 py-3.5 text-center align-middle whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {String(faq.sort_order).padStart(2, "0")}
                    </span>
                  </TableCell>

                  <TableCell className="w-[12%] px-4 py-3.5 align-middle whitespace-nowrap">
                    <StatusBadge tone={faq.is_active ? "success" : "neutral"}>
                      {faq.is_active ? "Aktif" : "Non-aktif"}
                    </StatusBadge>
                  </TableCell>

                  <TableCell className="w-[12%] px-4 py-3.5 align-middle text-xs whitespace-nowrap text-slate-500">
                    {formatDate(faq.updated_at)}
                  </TableCell>

                  <TableCell className="w-[8%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                    <RowActions
                      onEdit={() => onEdit(faq)}
                      onDelete={() => onDelete(faq)}
                      editLabel="Edit FAQ"
                      deleteLabel="Hapus FAQ"
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
          title={hasFilters ? "Tidak ada FAQ yang cocok" : "Belum ada FAQ"}
          description={
            hasFilters
              ? "Coba ubah kata kunci, kategori, atau tampilkan FAQ non-aktif."
              : "Tambahkan pertanyaan pertama agar bagian FAQ di halaman publik mulai terisi."
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
                    Tambah FAQ
                  </Button>
                )
          }
        />
      )}
    </div>
  );
}

export default FaqTable;
