"use client";

import Image from "next/image";
import { Wrench } from "lucide-react";
import type { ServiceItem } from "@/lib/dashboard/services";
import ConfirmDialog from "@/components/dashboard/dialogs/ConfirmDialog";

type ServiceDeleteDialogProps = {
  service: ServiceItem;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ServiceDeleteDialog({
  service,
  busy,
  error,
  onCancel,
  onConfirm,
}: ServiceDeleteDialogProps) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Hapus layanan ini?"
      description="Layanan akan dihapus dari daftar dan tidak lagi tampil di halaman publik. Tindakan ini tidak dapat dibatalkan."
      preview={
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            {service.image_url ? (
              <Image
                src={service.image_url}
                alt={service.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-slate-400">
                <Wrench className="size-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 font-medium text-slate-900">{service.title}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Kategori: {service.category || "Umum"} · {service.price || "Kustom"}
            </p>
          </div>
        </div>
      }
      busy={busy}
      error={error}
      onConfirm={onConfirm}
    />
  );
}

export default ServiceDeleteDialog;
