"use client";

import { useRef, useState } from "react";
import { Target } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { MisiItem, MisiPayload } from "@/lib/visiMisi";
import { FormDialog } from "@/components/dashboard/dialogs/FormDialog";

type MisiDialogProps = {
  item: MisiItem | null;
  onClose: () => void;
  onSubmit: (payload: MisiPayload) => Promise<void>;
};

type FormErrors = {
  title?: string;
  code?: string;
  description?: string;
  sortOrder?: string;
};

export function MisiDialog({ item, onClose, onSubmit }: MisiDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState(item?.code ?? "01");
  const [title, setTitle] = useState(item?.title ?? "");
  const [tagline, setTagline] = useState(item?.tagline ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (trimmedTitle.length < 2) {
      nextErrors.title = "Judul minimal 2 karakter.";
    }

    if (trimmedDesc.length < 5) {
      nextErrors.description = "Deskripsi minimal 5 karakter.";
    }

    const parsedOrder = parseInt(sortOrder, 10);
    if (isNaN(parsedOrder)) {
      nextErrors.sortOrder = "Urutan harus berupa angka.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.title) titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        code: code.trim() || "01",
        title: trimmedTitle,
        tagline: tagline.trim(),
        description: trimmedDesc,
        sort_order: parsedOrder,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan misi. Periksa koneksi lalu coba lagi.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const isEditing = Boolean(item);

  return (
    <FormDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={isEditing ? "Edit Butir Misi" : "Tambah Butir Misi"}
      description={
        isEditing
          ? "Perbarui judul, tagline, deskripsi, atau urutan kartu misi."
          : "Tambahkan butir kartu misi baru untuk ditampilkan di bagian Visi & Misi."
      }
      icon={<Target className="size-4 text-[#2279cf]" aria-hidden="true" />}
      busy={submitting}
      error={serverError}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="h-9 px-4 text-xs font-semibold text-slate-700"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="misi-form"
            disabled={submitting}
            className="h-9 bg-[#2279cf] px-4 text-xs font-semibold text-white hover:bg-[#1b64ad]"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-3.5 text-white" />
                <span>Menyimpan...</span>
              </span>
            ) : isEditing ? (
              "Simpan Perubahan"
            ) : (
              "Tambah Misi"
            )}
          </Button>
        </>
      }
    >
      <form id="misi-form" onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup>
          <div className="grid grid-cols-3 gap-3">
            {/* Nomor / Code */}
            <Field>
              <FieldLabel htmlFor="misi-code">Nomor (Kode)</FieldLabel>
              <Input
                id="misi-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="01"
                className="h-9.5 font-mono text-sm"
                disabled={submitting}
              />
            </Field>

            {/* Tagline kanan atas */}
            <Field className="col-span-2">
              <FieldLabel htmlFor="misi-tagline">Tagline Kanan Atas</FieldLabel>
              <Input
                id="misi-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Presisi & Tepat Waktu"
                className="h-9.5 text-sm"
                disabled={submitting}
              />
            </Field>
          </div>

          {/* Judul Misi */}
          <Field>
            <FieldLabel htmlFor="misi-title">
              Judul Misi <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              ref={titleRef}
              id="misi-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="mis. Layanan Prima"
              aria-invalid={Boolean(errors.title)}
              className="h-9.5 text-sm"
              disabled={submitting}
            />
            {errors.title ? <FieldError>{errors.title}</FieldError> : null}
          </Field>

          {/* Deskripsi Misi */}
          <Field>
            <FieldLabel htmlFor="misi-description">
              Deskripsi Misi <span className="text-red-500">*</span>
            </FieldLabel>
            <Textarea
              id="misi-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Jelaskan prosedur teknis atau standar komitmen misi ini..."
              aria-invalid={Boolean(errors.description)}
              className="text-xs"
              disabled={submitting}
            />
            {errors.description ? (
              <FieldError>{errors.description}</FieldError>
            ) : null}
          </Field>

          {/* Urutan & Status Aktif */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Field>
              <FieldLabel htmlFor="misi-sort-order">Urutan Tampil</FieldLabel>
              <Input
                id="misi-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-9.5 text-sm"
                disabled={submitting}
              />
            </Field>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  disabled={submitting}
                />
                <span>Aktif di Publik</span>
              </label>
            </div>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}
export default MisiDialog;
