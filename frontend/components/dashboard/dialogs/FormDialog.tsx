"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  busy?: boolean;
  error?: string | null;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  busy = false,
  error,
  children,
  footer,
  className,
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-0 text-slate-800 shadow-xl sm:max-w-lg",
          className
        )}
      >
        <div className="flex shrink-0 items-start gap-3.5 border-b border-slate-100 px-5 py-4">
          {icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-[#0A2540] shadow-2xs">
              {icon}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold tracking-tight text-slate-900">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {description}
              </DialogDescription>
            )}
          </div>

          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup dialog"
                className="shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              />
            }
          >
            <X aria-hidden="true" />
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700"
            >
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FormDialog;
