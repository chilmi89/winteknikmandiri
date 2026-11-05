"use client";

import type { PilarLayananItem } from "@/lib/pilarLayanan";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type PilarLayananDeleteDialogProps = {
  item: PilarLayananItem;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PilarLayananDeleteDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}: PilarLayananDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus Pilar Layanan"
      description="Kartu ini akan dihapus dari daftar dan tidak lagi tampil di halaman publik."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#A82020]">
              {item.code || "—"}
            </span>
            <p className="line-clamp-1 text-[13px] font-semibold text-slate-800">
              {item.title}
            </p>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {item.description}
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

export default PilarLayananDeleteDialog;
