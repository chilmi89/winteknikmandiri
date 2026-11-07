"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Wrench, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type {
  ServiceItem,
  ServiceItemPayload,
  ServiceCategory,
} from "@/lib/katalogLayanan";
import { uploadServicePhoto } from "@/lib/katalogLayanan";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type ServiceItemDialogProps = {
  item: ServiceItem | null;
  categories: ServiceCategory[];
  onClose: () => void;
  onSubmit: (payload: ServiceItemPayload) => Promise<void>;
};

export function ServiceItemDialog({
  item,
  categories,
  onClose,
  onSubmit,
}: ServiceItemDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState(
    item?.category_id ?? (categories[0]?.id || "")
  );
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [highlightsText, setHighlightsText] = useState(
    (item?.highlights ?? []).join(", ")
  );
  const [pricePrefix, setPricePrefix] = useState(item?.price_prefix ?? "Mulai dari");
  const [price, setPrice] = useState(item?.price ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "/ unit");
  const [priceNote, setPriceNote] = useState(item?.price_note ?? "");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [imageKey, setImageKey] = useState(item?.image_key ?? "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  const [errors, setErrors] = useState<{ title?: string; categoryId?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setServerError(null);
    try {
      const res = await uploadServicePhoto(file);
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

    const nextErrors: { title?: string; categoryId?: string } = {};
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 2) {
      nextErrors.title = "Nama layanan minimal 2 karakter.";
    }
    if (!categoryId) {
      nextErrors.categoryId = "Kategori wajib dipilih.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title) titleRef.current?.focus();
      return;
    }

    // Parsing highlights dari koma
    const highlights = highlightsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await onSubmit({
        category_id: categoryId,
        title: trimmedTitle,
        description: description.trim(),
        highlights,
        price_prefix: pricePrefix.trim() || "Mulai dari",
        price: price.trim(),
        unit: unit.trim() || "/ unit",
        price_note: priceNote.trim(),
        image_url: imageUrl.trim(),
        image_key: imageKey.trim(),
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan layanan.";
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
      icon={<Wrench className="size-5 text-[#A82020]" />}
      title={item ? "Edit Item Layanan" : "Tambah Item Layanan"}
      description="Data ini otomatis tampil di /layanan, Produk Beranda, dan Tabel Tarif Harga."
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
            form="service-item-form"
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
              "Simpan Layanan"
            )}
          </Button>
        </>
      }
    >
      <form id="service-item-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.categoryId)}>
            <FieldLabel htmlFor="item-category">
              Kategori <span className="text-rose-500">*</span>
            </FieldLabel>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val ?? "")}>
              <SelectTrigger id="item-category" className="h-9 w-full bg-white text-xs">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} · {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.categoryId && <FieldError errors={[{ message: errors.categoryId }]} />}
          </Field>

          <Field data-invalid={Boolean(errors.title)} className="sm:col-span-2">
            <FieldLabel htmlFor="item-title">
              Nama Layanan <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              id="item-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cuci AC Split Standard"
              required
            />
            {errors.title && <FieldError errors={[{ message: errors.title }]} />}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="item-desc">Deskripsi Singkat</FieldLabel>
          <Textarea
            id="item-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Bersih menyeluruh, bebas becek, garansi 7 hari."
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="item-highlights">
            Poin Highlights Merah (Pisahkan dengan koma)
          </FieldLabel>
          <Input
            id="item-highlights"
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            placeholder="Tanpa becek, Cek freon gratis, Garansi 7 hari"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="item-prefix">Prefix Harga</FieldLabel>
            <Input
              id="item-prefix"
              value={pricePrefix}
              onChange={(e) => setPricePrefix(e.target.value)}
              placeholder="Mulai dari / Tarif / Biaya cek"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="item-price">Harga (Kosongkan jika Penawaran)</FieldLabel>
            <Input
              id="item-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Rp 65.000"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="item-unit">Satuan</FieldLabel>
            <Input
              id="item-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="/ unit / meter / kunjungan"
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="item-price-note">Catatan Variasi Harga</FieldLabel>
          <Input
            id="item-price-note"
            value={priceNote}
            onChange={(e) => setPriceNote(e.target.value)}
            placeholder="1,5–2 PK Rp 85.000 · cassette menyesuaikan."
          />
        </Field>

        {/* Upload Foto (Auto WebP) */}
        <Field>
          <FieldLabel>Foto Layanan (Auto-Convert WebP ke MinIO)</FieldLabel>
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
                  <Wrench className="size-6" />
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
                Otomatis dikonversi ke format WebP ringan dan disimpan di MinIO bucket <code>services/</code>.
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
            <span>Aktifkan / Tampilkan Layanan di Publik</span>
          </label>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default ServiceItemDialog;
