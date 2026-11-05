"use client";

import { useRef, useState } from "react";
import { Columns3 } from "lucide-react";
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
import type { PilarLayananItem, PilarLayananPayload } from "@/lib/pilarLayanan";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type PilarLayananDialogProps = {
  item: PilarLayananItem | null;
  onClose: () => void;
  onSubmit: (payload: PilarLayananPayload) => Promise<void>;
};

type FormErrors = {
  title?: string;
  code?: string;
  sortOrder?: string;
};

export function PilarLayananDialog({
  item,
  onClose,
  onSubmit,
}: PilarLayananDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState(item?.code ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [linkUrl, setLinkUrl] = useState(item?.link_url ?? "/layanan");
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);
  const [ctaText, setCtaText] = useState(item?.cta_text ?? "");
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

    if (trimmedTitle.length < 2) {
      nextErrors.title = "Judul minimal 2 karakter.";
    }

    const parsedSortOrder = Number(sortOrder);
    if (!sortOrder.trim() || !Number.isFinite(parsedSortOrder)) {
      nextErrors.sortOrder = "Urutan harus berupa angka.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title) titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        code: code.trim(),
        title: trimmedTitle,
        description: description.trim(),
        link_url: linkUrl.trim() || "/layanan",
        is_featured: isFeatured,
        cta_text: ctaText.trim(),
        sort_order: Math.trunc(parsedSortOrder),
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pilar layanan. Silakan coba lagi.";
      setServerError(message);
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
      icon={<Columns3 className="size-5 text-[#A82020]" />}
      title={item ? "Edit Pilar Layanan" : "Tambah Pilar Layanan"}
      description="Kelola kartu pilar layanan yang tampil di section 'Pilar Layanan' Beranda."
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
            form="pilar-layanan-form"
            size="sm"
            disabled={submitting}
            className="bg-[#A82020] text-white hover:bg-[#8e1919]"
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 size-3.5" />
                Menyimpan...
              </>
            ) : item ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Pilar"
            )}
          </Button>
        </>
      }
    >
      <form id="pilar-layanan-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.code)}>
            <FieldLabel htmlFor="pilar-code">Kode Kartu</FieldLabel>
            <Input
              id="pilar-code"
              ref={codeRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="01, 02, dsb."
              maxLength={10}
            />
          </Field>

          <Field data-invalid={Boolean(errors.title)} className="sm:col-span-2">
            <FieldLabel htmlFor="pilar-title">
              Judul Pilar <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              id="pilar-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Supply & pengadaan AC"
              required
            />
            {errors.title && <FieldError errors={[{ message: errors.title }]} />}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="pilar-description">Deskripsi</FieldLabel>
          <Textarea
            id="pilar-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Keterangan singkat pilar..."
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="pilar-link">Tautan / Link URL</FieldLabel>
          <Input
            id="pilar-link"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/layanan atau https://wa.me/..."
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pilar-cta">Teks Tombol (Opsional)</FieldLabel>
            <Input
              id="pilar-cta"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Contoh: Konsultasi"
            />
          </Field>

          <Field data-invalid={Boolean(errors.sortOrder)}>
            <FieldLabel htmlFor="pilar-sort-order">Urutan Tampil</FieldLabel>
            <Input
              id="pilar-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min={0}
            />
            {errors.sortOrder && <FieldError errors={[{ message: errors.sortOrder }]} />}
          </Field>
        </div>

        <FieldGroup className="pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <Checkbox
                checked={isFeatured}
                onCheckedChange={(c) => setIsFeatured(Boolean(c))}
              />
              <span>Kartu Aksen Merah (Featured / Kotak Khusus)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <Checkbox
                checked={isActive}
                onCheckedChange={(c) => setIsActive(Boolean(c))}
              />
              <span>Aktifkan / Tampilkan di Publik</span>
            </label>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default PilarLayananDialog;
