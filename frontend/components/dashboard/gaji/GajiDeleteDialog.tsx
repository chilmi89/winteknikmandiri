"use client";

import { ConfirmDialog } from "@/components/dashboard/dialogs/ConfirmDialog";
import type { Gaji } from "@/lib/gaji";

type GajiDeleteDialogProps = {
  gaji: Gaji | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  busy?: boolean;
  error?: string | null;
};

export function GajiDeleteDialog({
  gaji,
  open,
  onOpenChange,
  onConfirm,
  busy = false,
  error,
}: GajiDeleteDialogProps) {
  if (!gaji) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Slip Gaji?"
      description={
        <span>
          Apakah Anda yakin ingin menghapus slip gaji{" "}
          <strong className="text-slate-900">{gaji.kode_gaji}</strong> untuk tim{" "}
          <strong className="text-slate-900">{gaji.team_name}</strong> dengan total{" "}
          <strong className="text-emerald-600">{gaji.total_gaji}</strong>? Tindakan ini
          dapat dipulihkan dari arsip database.
        </span>
      }
      confirmLabel="Ya, Hapus Slip Gaji"
      cancelLabel="Batal"
      busy={busy}
      error={error}
      onConfirm={onConfirm}
    />
  );
}
