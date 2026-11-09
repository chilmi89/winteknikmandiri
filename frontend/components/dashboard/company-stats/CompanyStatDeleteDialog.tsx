"use client";

import { ConfirmDialog } from "@/components/dashboard/dialogs/ConfirmDialog";
import type { CompanyStatItem } from "@/lib/companyStats";

type CompanyStatDeleteDialogProps = {
  item: CompanyStatItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  busy?: boolean;
  error?: string | null;
};

export function CompanyStatDeleteDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
  busy = false,
  error,
}: CompanyStatDeleteDialogProps) {
  if (!item) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Statistik Pencapaian?"
      description={
        <span>
          Apakah Anda yakin ingin menghapus data statistik{" "}
          <strong className="text-slate-900">{item.label}</strong> ({item.value})? Kartu ini tidak akan tampil lagi di halaman Beranda, Tentang Kami, dan Galeri.
        </span>
      }
      confirmLabel="Ya, Hapus Statistik"
      cancelLabel="Batal"
      busy={busy}
      error={error}
      onConfirm={onConfirm}
    />
  );
}
