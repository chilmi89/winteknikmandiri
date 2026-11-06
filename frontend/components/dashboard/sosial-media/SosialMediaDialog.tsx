"use client";

import { useRef, useState } from "react";
import { Share2 } from "lucide-react";
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
import type { SosialMediaItem, SosialMediaPayload } from "@/lib/sosialMedia";
import { FormDialog } from "@/components/dashboard/dialogs/FormDialog";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/SocialIcons";

type SosialMediaDialogProps = {
  item: SosialMediaItem | null;
  onClose: () => void;
  onSubmit: (payload: SosialMediaPayload) => Promise<void>;
};

type FormErrors = {
  nama?: string;
  link?: string;
  sortOrder?: string;
};

const ICON_OPTIONS = [
  { value: "instagram", label: "Instagram", Icon: InstagramIcon },
  { value: "tiktok", label: "TikTok", Icon: TikTokIcon },
  { value: "facebook", label: "Facebook", Icon: FacebookIcon },
  { value: "youtube", label: "YouTube", Icon: null },
  { value: "whatsapp", label: "WhatsApp", Icon: null },
  { value: "globe", label: "Web / Lainnya", Icon: null },
];

export function SosialMediaDialog({
  item,
  onClose,
  onSubmit,
}: SosialMediaDialogProps) {
  const namaRef = useRef<HTMLInputElement>(null);

  const [nama, setNama] = useState(item?.nama ?? "");
  const [link, setLink] = useState(item?.link ?? "");
  const [icon, setIcon] = useState(item?.icon ?? "instagram");
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedNama = nama.trim();
    const trimmedLink = link.trim();

    if (trimmedNama.length < 2) {
      nextErrors.nama = "Nama minimal 2 karakter.";
    }

    if (!trimmedLink) {
      nextErrors.link = "Tautan link wajib diisi.";
    }

    const parsedOrder = parseInt(sortOrder, 10);
    if (isNaN(parsedOrder)) {
      nextErrors.sortOrder = "Urutan harus berupa angka bulat.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.nama) namaRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        nama: trimmedNama,
        link: trimmedLink,
        icon: icon.trim().toLowerCase(),
        sort_order: parsedOrder,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan sosial media. Periksa koneksi lalu coba lagi.";
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
      title={isEditing ? "Edit Sosial Media" : "Tambah Sosial Media"}
      description={
        isEditing
          ? "Perbarui nama, tautan link, atau status aktif kanal sosial media."
          : "Tambahkan tautan akun media sosial resmi yang akan tampil di situs."
      }
      icon={<Share2 className="size-4 text-[#2279cf]" aria-hidden="true" />}
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
            form="sosial-media-form"
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
              "Tambah Sosmed"
            )}
          </Button>
        </>
      }
    >
      <form id="sosial-media-form" onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup>
          {/* Nama Platform */}
          <Field>
            <FieldLabel htmlFor="sosmed-nama">
              Nama Platform <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              ref={namaRef}
              id="sosmed-nama"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (errors.nama) setErrors((prev) => ({ ...prev, nama: undefined }));
              }}
              placeholder="mis. Instagram, TikTok, Facebook"
              aria-invalid={Boolean(errors.nama)}
              className="h-9.5 text-sm"
              disabled={submitting}
            />
            {errors.nama ? <FieldError>{errors.nama}</FieldError> : null}
          </Field>

          {/* Tautan Link */}
          <Field>
            <FieldLabel htmlFor="sosmed-link">
              Tautan URL <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              id="sosmed-link"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                if (errors.link) setErrors((prev) => ({ ...prev, link: undefined }));
              }}
              placeholder="https://www.instagram.com/winteknikmandiri"
              aria-invalid={Boolean(errors.link)}
              className="h-9.5 font-mono text-xs"
              disabled={submitting}
            />
            {errors.link ? <FieldError>{errors.link}</FieldError> : null}
          </Field>

          {/* Pilihan Icon */}
          <Field>
            <FieldLabel>Pilih Ikon</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const isSelected = icon === opt.value;
                const IconComponent = opt.Icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-[#2279cf] bg-[#2279cf]/5 text-[#2279cf] shadow-2xs font-semibold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {IconComponent ? (
                      <IconComponent className="size-4 shrink-0" />
                    ) : (
                      <span className="size-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold">
                        {opt.label[0]}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Urutan & Status Aktif */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Field>
              <FieldLabel htmlFor="sosmed-sort-order">Urutan Tampil</FieldLabel>
              <Input
                id="sosmed-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  if (errors.sortOrder)
                    setErrors((prev) => ({ ...prev, sortOrder: undefined }));
                }}
                className="h-9.5 text-sm"
                disabled={submitting}
              />
              {errors.sortOrder ? (
                <FieldError>{errors.sortOrder}</FieldError>
              ) : null}
            </Field>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  disabled={submitting}
                />
                <span>Aktif di Situs</span>
              </label>
            </div>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}
export default SosialMediaDialog;
