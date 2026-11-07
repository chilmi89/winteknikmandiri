"use client";

import type { TeamMemberItem } from "@/lib/teamMembers";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type TeamDeleteDialogProps = {
  item: TeamMemberItem;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function TeamDeleteDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}: TeamDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus Anggota Tim"
      description="Data tim dan foto terkait akan dihapus secara permanen dari daftar."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <p className="text-[13px] font-semibold text-slate-800">
            {item.name}
          </p>
          <p className="text-xs text-slate-500">
            {item.skill}
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

export default TeamDeleteDialog;
