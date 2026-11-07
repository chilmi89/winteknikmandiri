"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Images, Upload, X } from "lucide-react";
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
import type { GalleryProject, GalleryPayload } from "@/lib/galleryService";
import { uploadGalleryPhoto } from "@/lib/galleryService";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type GalleryDialogProps = {
  item: GalleryProject | null;
  existingCategories: string[];
  onClose: () => void;
  onSubmit: (payload: GalleryPayload) => Promise<void>;
};

type FormErrors = {
  title?: string;
  category?: string;
};

export function GalleryDialog({
  item,
  existingCategories,
  onClose,
  onSubmit,
}: GalleryDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  const [scope, setScope] = useState(item?.scope ?? "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [imageKey, setImageKey] = useState(item?.image_key ?? "");
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setServerError(null);
    try {
      const res = await uploadGalleryPhoto(file);
      setImageUrl(res.image_url);
      setImageKey(res.image_key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setServerError(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();

    if (trimmedTitle.length < 2) {
      nextErrors.title = "Judul proyek minimal 2 karakter.";
    }
    if (trimmedCategory.length < 2) {
      nextErrors.category = "Kategori minimal 2 karakter.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title) titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        category: trimmedCategory,
        client: client.trim(),
        scope: scope.trim(),
        location: location.trim(),
        image_url: imageUrl.trim(),
        image_key: imageKey.trim(),
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan proyek galeri. Silakan coba lagi.";
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
      icon={<Images className="size-5 text-[#A82020]" />}
      title={item ? "Edit Proyek Galeri" : "Tambah Proyek Galeri"}
      description="Unggah foto dokumentasi proyek (auto-convert ke WebP) dan kelola kategori secara bebas."
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
            form="gallery-form"
            size="sm"
            disabled={submitting || uploading}
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
              "Simpan Proyek"
            )}
          </Button>
        </>
      }
    >
      <form id="gallery-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor="gallery-title">
            Judul Proyek <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            id="gallery-title"
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Instalasi AHU Mall Galeria Bali"
            required
          />
          {errors.title && <FieldError errors={[{ message: errors.title }]} />}
        </Field>

        {/* Kategori Bebas dengan Datalist Rekomendasi */}
        <Field data-invalid={Boolean(errors.category)}>
          <FieldLabel htmlFor="gallery-category">
            Kategori Proyek (Ketik Bebas) <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            id="gallery-category"
            list="category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ketik kategori baru atau pilih (misal: Mall & Retail, Sekolah & Fasilitas)"
            required
          />
          <datalist id="category-suggestions">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && <FieldError errors={[{ message: errors.category }]} />}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="gallery-client">Nama Klien / Gedung</FieldLabel>
            <Input
              id="gallery-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Contoh: Mall Galeria Bali / Nike Store"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="gallery-location">Lokasi Proyek</FieldLabel>
            <Input
              id="gallery-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Kuta, Bali / Kota Kediri"
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="gallery-scope">Lingkup Pekerjaan (Scope of Work)</FieldLabel>
          <Input
            id="gallery-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Contoh: Air Handling Unit & Ducting / Pipa Refrigerant"
          />
        </Field>

        {/* Upload Foto (Auto-Convert WebP) */}
        <Field>
          <FieldLabel>Foto Proyek (Auto-Convert &amp; Kompres WebP)</FieldLabel>
          <div className="mt-1.5 flex items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || "Preview"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-slate-400">
                  <Images className="size-6" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="gallery-photo-file"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-8 text-xs gap-1.5"
                >
                  {uploading ? (
                    <>
                      <Spinner className="size-3" />
                      Mengompres...
                    </>
                  ) : (
                    <>
                      <Upload className="size-3" />
                      Pilih Foto (JPG/PNG)
                    </>
                  )}
                </Button>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setImageKey("");
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Otomatis dikonversi ke format WebP ringan dan disimpan di MinIO bucket <code>gallery/</code>.
              </p>
            </div>
          </div>
        </Field>

        <FieldGroup className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <Checkbox
              checked={isActive}
              onCheckedChange={(c) => setIsActive(Boolean(c))}
            />
            <span>Aktifkan / Tampilkan di Halaman Galeri</span>
          </label>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default GalleryDialog;
