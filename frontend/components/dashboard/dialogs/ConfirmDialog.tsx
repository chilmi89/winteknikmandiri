"use client";

import { AlertTriangle, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  preview?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  className?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  preview,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  busy = false,
  error,
  onConfirm,
  className,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent
        size="sm"
        className={cn(
          "gap-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-0 text-slate-800 shadow-xl sm:max-w-md",
          className
        )}
      >
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
              <AlertTriangle aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="text-base font-semibold tracking-tight text-slate-900">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 text-xs leading-relaxed text-slate-500">
                {description}
              </AlertDialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              aria-label="Tutup dialog"
              className="shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          {preview && (
            <div className="mt-4">
              {preview}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-9 gap-1.5 rounded-lg bg-[#DC2626] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#B91C1C] active:scale-[0.98]"
          >
            {busy && <Spinner className="size-3.5" />}
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
