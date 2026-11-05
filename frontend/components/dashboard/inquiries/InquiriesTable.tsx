"use client";

import { Check, Inbox, MessageCircle, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  inquiryStatusMeta,
  inquiryStatusOrder,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/dashboard/inquiries";
import { formatDateTime, initials, waChatLink } from "@/lib/dashboard/format";
import DataTableEmpty from "@/components/dashboard/data-table/DataTableEmpty";
import DataTableSkeleton from "@/components/dashboard/data-table/DataTableSkeleton";
import RowActions from "@/components/dashboard/data-table/RowActions";
import StatusBadge from "@/components/dashboard/data-table/StatusBadge";

type InquiriesTableProps = {
  items: Inquiry[];
  loading: boolean;
  updatingStatusId?: string | null;
  onEdit: (inquiry: Inquiry) => void;
  onDelete: (inquiry: Inquiry) => void;
  onStatusChange: (inquiry: Inquiry, status: InquiryStatus) => void;
  onCreate?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
};

export function InquiriesTable({
  items,
  loading,
  updatingStatusId,
  onEdit,
  onDelete,
  onStatusChange,
  onCreate,
  onResetFilters,
  hasFilters = false,
}: InquiriesTableProps) {
  const showSkeleton = loading && items.length === 0;
  const showEmpty = !loading && items.length === 0;

  return (
    <div className="relative">
      {!showEmpty && (
        <Table
          aria-busy={loading}
          containerClassName="dash-table-scroll"
          className="min-w-[980px]"
        >
          <TableCaption className="sr-only">Daftar permohonan masuk</TableCaption>

          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-10 w-[28%] px-4 text-xs font-medium text-slate-500">
                Pelanggan & kontak
              </TableHead>
              <TableHead className="h-10 w-[17%] px-4 text-xs font-medium text-slate-500">
                Layanan
              </TableHead>
              <TableHead className="h-10 w-[24%] px-4 text-xs font-medium text-slate-500">
                Alamat / kebutuhan
              </TableHead>
              <TableHead className="h-10 w-[12%] px-4 text-xs font-medium text-slate-500">
                Tanggal
              </TableHead>
              <TableHead className="h-10 w-[11%] px-4 text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-10 w-[8%] px-4 text-right text-xs font-medium text-slate-500">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton && <DataTableSkeleton columns={6} rows={5} />}

            {!showSkeleton &&
              items.map((item) => {
                const status = inquiryStatusMeta[item.status];
                const whatsapp = waChatLink(
                  item.phone,
                  `Halo ${item.name}, kami dari CV Win Teknik Mandiri ingin menindaklanjuti permohonan ${item.service}.`
                );

                return (
                  <TableRow
                    key={item.id}
                    className="border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    <TableCell className="w-[28%] px-4 py-3.5 align-middle whitespace-normal">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500"
                        >
                          {initials(item.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-[13px] font-medium text-slate-900">
                            {item.name}
                          </p>
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Chat WhatsApp ${item.name}`}
                            className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-slate-500 transition-colors hover:text-slate-800"
                          >
                            <MessageCircle
                              aria-hidden="true"
                              className="size-3 text-slate-400"
                            />
                            {item.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="w-[17%] px-4 py-3.5 align-middle whitespace-nowrap">
                      <span
                        className="block max-w-[180px] truncate text-xs text-slate-600"
                        title={item.service}
                      >
                        {item.service}
                      </span>
                    </TableCell>

                    <TableCell className="w-[24%] px-4 py-3.5 align-middle whitespace-normal">
                      <p
                        className="line-clamp-1 text-xs text-slate-700"
                        title={item.address}
                      >
                        {item.address}
                      </p>
                      <p
                        className="mt-1 line-clamp-1 text-[11px] text-slate-400"
                        title={item.notes}
                      >
                        {item.notes}
                      </p>
                    </TableCell>

                    <TableCell className="w-[12%] px-4 py-3.5 align-middle text-xs whitespace-nowrap text-slate-500">
                      {formatDateTime(item.date)}
                    </TableCell>

                    <TableCell className="w-[11%] px-4 py-3.5 align-middle whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={updatingStatusId === item.id}
                          render={
                            <button
                              type="button"
                              aria-label={`Ubah status permohonan ${item.name}`}
                              className="rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                            />
                          }
                        >
                          <StatusBadge tone={status.tone}>
                            {status.label}
                          </StatusBadge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-md p-1">
                          {inquiryStatusOrder.map((nextStatus) => {
                            const meta = inquiryStatusMeta[nextStatus];
                            return (
                              <DropdownMenuItem
                                key={nextStatus}
                                onClick={() => onStatusChange(item, nextStatus)}
                                className="gap-2 rounded-sm py-1.5 text-xs"
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    nextStatus === "pending" && "bg-amber-500",
                                    nextStatus === "diproses" && "bg-sky-500",
                                    nextStatus === "selesai" && "bg-emerald-500",
                                    nextStatus === "batal" && "bg-rose-500"
                                  )}
                                />
                                <span>{meta.label}</span>
                                {item.status === nextStatus && (
                                  <Check
                                    aria-hidden="true"
                                    className="ml-auto size-3.5 text-slate-600"
                                  />
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    <TableCell className="w-[8%] px-4 py-3.5 text-right align-middle whitespace-nowrap">
                      <RowActions
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item)}
                        editLabel="Edit permohonan"
                        deleteLabel="Hapus permohonan"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      )}

      {showEmpty && (
        <DataTableEmpty
          icon={hasFilters ? <SearchX /> : <Inbox />}
          title={
            hasFilters
              ? "Tidak ada permohonan yang cocok"
              : "Belum ada permohonan"
          }
          description={
            hasFilters
              ? "Coba ubah kata kunci atau pilih status lain pada filter di atas."
              : "Permohonan dari form kontak publik akan muncul di sini untuk ditindaklanjuti."
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
                    Tambah Permohonan
                  </Button>
                )
          }
        />
      )}
    </div>
  );
}

export default InquiriesTable;
