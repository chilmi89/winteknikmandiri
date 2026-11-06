"use client";

import type { JamOperasionalItem } from "@/lib/jamOperasional";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type JamOperasionalDeleteDialogProps = {
  item: JamOperasionalItem;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function JamOperasionalDeleteDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}: JamOperasionalDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus Baris Jadwal"
      description="Jadwal ini akan dihapus dari daftar dan tidak lagi tampil di halaman publik."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <p className="text-[13px] font-semibold text-slate-800">
            {item.day_label}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`font-mono font-medium ${
                item.is_closed ? "text-[#A82020]" : "text-slate-600"
              }`}
            >
              {item.hours}
            </span>
            <span>·</span>
            <span className="text-slate-500">
              Urutan {String(item.sort_order).padStart(2, "0")}
            </span>
          </div>
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

export default JamOperasionalDeleteDialog;
