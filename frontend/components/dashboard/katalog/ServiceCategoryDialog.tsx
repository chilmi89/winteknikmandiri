"use client";

import { useRef, useState } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type {
  ServiceCategory,
  ServiceCategoryPayload,
} from "@/lib/katalogLayanan";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type ServiceCategoryDialogProps = {
  category: ServiceCategory | null;
  onClose: () => void;
  onSubmit: (payload: ServiceCategoryPayload) => Promise<void>;
};

export function ServiceCategoryDialog({
  category,
  onClose,
  onSubmit,
}: ServiceCategoryDialogProps) {
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState(category?.code ?? "");
  const [name, setName] = useState(category?.name ?? "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  const [errors, setErrors] = useState<{ code?: string; name?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const nextErrors: { code?: string; name?: string } = {};
    if (!code.trim()) nextErrors.code = "Kode wajib diisi (mis. 01).";
    if (name.trim().length < 2) nextErrors.name = "Nama kategori minimal 2 karakter.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.code) codeRef.current?.focus();
      else nameRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kategori.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
      icon={<FolderPlus className="size-5 text-[#A82020]" />}
      title={category ? "Edit Kategori Layanan" : "Tambah Kategori Layanan"}
      description="Super minimalis: cukup tentukan kode (misal 01) dan nama kategori."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="category-form"
            size="sm"
            disabled={submitting}
            className="bg-[#A82020] text-white hover:bg-[#8e1919]"
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 size-3.5" />
                Menyimpan...
              </>
            ) : category ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Kategori"
            )}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.code)}>
            <FieldLabel htmlFor="cat-code">
              Kode Nomor <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              id="cat-code"
              ref={codeRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="01, 02, dsb."
              maxLength={10}
              required
            />
            {errors.code && <FieldError errors={[{ message: errors.code }]} />}
          </Field>

          <Field data-invalid={Boolean(errors.name)} className="sm:col-span-2">
            <FieldLabel htmlFor="cat-name">
              Nama Kategori <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              id="cat-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Perawatan & Cuci AC"
              required
            />
            {errors.name && <FieldError errors={[{ message: errors.name }]} />}
          </Field>
        </div>

        <FieldGroup className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <Checkbox
              checked={isActive}
              onCheckedChange={(c) => setIsActive(Boolean(c))}
            />
            <span>Aktifkan / Tampilkan Kategori</span>
          </label>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default ServiceCategoryDialog;
