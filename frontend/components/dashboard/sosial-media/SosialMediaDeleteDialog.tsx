"use client";

import type { SosialMediaItem } from "@/lib/sosialMedia";
import { ConfirmDialog } from "@/components/dashboard/dialogs/ConfirmDialog";

type SosialMediaDeleteDialogProps = {
  item: SosialMediaItem;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SosialMediaDeleteDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}: SosialMediaDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus Sosial Media"
      description="Akun ini akan dihapus dari daftar dan tidak lagi tampil di navigasi/halaman publik."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <p className="line-clamp-1 text-[13px] font-semibold text-slate-800">
            {item.nama}
          </p>
          <p className="line-clamp-1 font-mono text-xs text-slate-500">
            {item.link}
          </p>
        </div>
      }
      confirmLabel="Hapus"
      cancelLabel="Batal"
      busy={busy}
      error={error}
      onConfirm={onConfirm}
    />
  );
}
export default SosialMediaDeleteDialog;
