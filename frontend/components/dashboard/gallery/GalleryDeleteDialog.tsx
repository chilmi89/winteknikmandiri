"use client";

import type { GalleryProject } from "@/lib/galleryService";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type GalleryDeleteDialogProps = {
  item: GalleryProject;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function GalleryDeleteDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}: GalleryDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus Proyek Galeri"
      description="Dokumentasi proyek ini akan dihapus dari daftar dan halaman galeri publik."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <p className="text-[13px] font-semibold text-slate-800">
            {item.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-medium text-slate-700">
              {item.category}
            </span>
            <span>·</span>
            <span>{item.client || item.location}</span>
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

export default GalleryDeleteDialog;
