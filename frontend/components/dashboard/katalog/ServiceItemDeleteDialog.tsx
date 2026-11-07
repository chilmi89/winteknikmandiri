"use client";

import type { ServiceItem } from "@/lib/katalogLayanan";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type ServiceItemDeleteDialogProps = {
  item: ServiceItem;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ServiceItemDeleteDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}: ServiceItemDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus Layanan"
      description="Layanan ini akan dihapus dari katalog, halaman Beranda, dan Tabel Tarif Harga."
      preview={
        <div className="space-y-1.5 rounded-lg border border-slate-300/80 bg-slate-50/70 p-3 shadow-xs">
          <p className="text-[13px] font-semibold text-slate-800">
            {item.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-medium text-slate-700">
              {item.category_name || "Layanan"}
            </span>
            <span>·</span>
            <span className="font-semibold text-[#A82020]">{item.price || "Penawaran"}</span>
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

export default ServiceItemDeleteDialog;
