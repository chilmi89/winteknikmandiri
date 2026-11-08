"use client";

import { ConfirmDialog } from "@/components/dashboard/dialogs/ConfirmDialog";
import type { JurnalKeuangan } from "@/lib/keuangan";

type JurnalDeleteDialogProps = {
  jurnal: JurnalKeuangan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  busy?: boolean;
  error?: string | null;
};

export function JurnalDeleteDialog({
  jurnal,
  open,
  onOpenChange,
  onConfirm,
  busy = false,
  error,
}: JurnalDeleteDialogProps) {
  if (!jurnal) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Transaksi Jurnal?"
      description={
        <span>
          Apakah Anda yakin ingin menghapus transaksi{" "}
          <strong className="text-slate-900">{jurnal.kode_jurnal}</strong> -{" "}
          <strong className="text-slate-900">"{jurnal.judul}"</strong> senilai{" "}
          <strong className={jurnal.tipe === "pemasukan" ? "text-emerald-600" : "text-rose-600"}>
            {jurnal.nominal}
          </strong>? Data yang dihapus dapat dipulihkan dari arsip database.
        </span>
      }
      confirmLabel="Ya, Hapus Transaksi"
      cancelLabel="Batal"
      busy={busy}
      error={error}
      onConfirm={onConfirm}
    />
  );
}
