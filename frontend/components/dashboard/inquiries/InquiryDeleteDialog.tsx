"use client";

import type { Inquiry } from "@/lib/dashboard/inquiries";
import { inquiryStatusMeta } from "@/lib/dashboard/inquiries";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type InquiryDeleteDialogProps = {
  inquiry: Inquiry;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function InquiryDeleteDialog({
  inquiry,
  busy,
  error,
  onCancel,
  onConfirm,
}: InquiryDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus permohonan ini?"
      description="Data permohonan akan dihapus dari daftar dan tidak dapat dikembalikan."
      preview={
        <div className="space-y-1.5">
          <p className="font-medium text-slate-900">{inquiry.name}</p>
          <p className="text-[11px] text-slate-500">
            {inquiry.service} · {inquiryStatusMeta[inquiry.status].label}
          </p>
          <p className="line-clamp-1 text-[11px] text-slate-400">
            {inquiry.address}
          </p>
        </div>
      }
      busy={busy}
      error={error}
      onConfirm={onConfirm}
    />
  );
}

export default InquiryDeleteDialog;
