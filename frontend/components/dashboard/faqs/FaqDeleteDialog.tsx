"use client";

import type { Faq } from "@/lib/dashboard/faqs";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type FaqDeleteDialogProps = {
  faq: Faq;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function FaqDeleteDialog({
  faq,
  busy,
  error,
  onCancel,
  onConfirm,
}: FaqDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus FAQ"
      description="Pertanyaan ini akan dihapus dari daftar dan halaman publik."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <p className="line-clamp-2 text-[13px] font-semibold text-slate-800">
            {faq.question}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-medium text-slate-700">
              {faq.category || "Umum"}
            </span>
            <span>·</span>
            <span>Urutan {String(faq.sort_order).padStart(2, "0")}</span>
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

export default FaqDeleteDialog;
