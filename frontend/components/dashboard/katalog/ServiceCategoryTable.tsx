"use client";

import { FolderPlus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceCategory } from "@/lib/katalogLayanan";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";

type ServiceCategoryTableProps = {
  items: ServiceCategory[];
  loading: boolean;
  onEdit: (cat: ServiceCategory) => void;
  onDelete: (cat: ServiceCategory) => void;
  onCreate: () => void;
};

export function ServiceCategoryTable({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
}: ServiceCategoryTableProps) {
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed border-slate-200">
        <FolderPlus className="size-8 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-800">Belum ada kategori layanan</p>
        <p className="text-xs text-slate-500 mb-4">Tambahkan kategori untuk mengelompokkan kartu layanan.</p>
        <Button size="sm" onClick={onCreate} className="bg-[#0A2540] text-white">
          Tambah Kategori
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-slate-50 border-slate-200">
            <TableHead className="h-10 w-[15%] px-4 text-xs font-medium text-slate-500">
              Kode Nomor
            </TableHead>
            <TableHead className="h-10 w-[55%] px-4 text-xs font-medium text-slate-500">
              Nama Kategori
            </TableHead>
            <TableHead className="h-10 w-[15%] px-4 text-xs font-medium text-slate-500">
              Status
            </TableHead>
            <TableHead className="h-10 w-[15%] px-4 text-right text-xs font-medium text-slate-500">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((cat) => (
            <TableRow key={cat.id} className="border-slate-100 hover:bg-slate-50/70">
              <TableCell className="px-4 py-3 font-mono text-xs font-bold text-[#A82020]">
                {cat.code}
              </TableCell>

              <TableCell className="px-4 py-3 text-xs font-semibold text-slate-800">
                {cat.name}
              </TableCell>

              <TableCell className="px-4 py-3">
                <StatusBadge tone={cat.is_active ? "success" : "neutral"}>
                  {cat.is_active ? "Aktif" : "Non-aktif"}
                </StatusBadge>
              </TableCell>

              <TableCell className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(cat)}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(cat)}
                    className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ServiceCategoryTable;
