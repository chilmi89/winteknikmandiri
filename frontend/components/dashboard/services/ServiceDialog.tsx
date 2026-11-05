"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  SERVICE_CATEGORIES,
  uploadServiceImage,
  type ServiceItem,
  type ServicePayload,
} from "@/lib/dashboard/services";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type ServiceDialogProps = {
  service: ServiceItem | null;
  onClose: () => void;
  onSubmit: (payload: ServicePayload) => Promise<void>;
};

type FormErrors = {
  title?: string;
  slug?: string;
};

export function ServiceDialog({ service, onClose, onSubmit }: ServiceDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [category, setCategory] = useState(
    service?.category || SERVICE_CATEGORIES[0]
  );
  const [pricePrefix, setPricePrefix] = useState(service?.price_prefix ?? "Mulai dari");
  const [price, setPrice] = useState(service?.price ?? "Rp 65.000");
  const [unit, setUnit] = useState(service?.unit ?? "/ unit");
  const [priceNote, setPriceNote] = useState(service?.price_note ?? "");
  const [imageUrl, setImageUrl] = useState(service?.image_url ?? "");
  const [imageKey, setImageKey] = useState(service?.image_key ?? "");
  const [summary, setSummary] = useState(service?.summary ?? "");
  const [sortOrder, setSortOrder] = useState(String(service?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(service?.is_active ?? true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const categoryOptions: string[] = [...SERVICE_CATEGORIES];
  if (category && !categoryOptions.includes(category)) {
    categoryOptions.push(category);
  }

  // Otomatis isi slug saat title diisi bila slug masih kosong
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!service && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setServerError(null);

    try {
      const res = await uploadServiceImage(file);
      setImageUrl(res.image_url);
      setImageKey(res.image_key);
    } catch (uploadErr) {
      // Jika backend/storage offline, gunakan local blob preview untuk UI
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
      setImageKey("");
      setServerError(
        uploadErr instanceof Error
          ? `Catatan: ${uploadErr.message}. Foto ditampilkan lewat preview lokal.`
          : "Gagal mengunggah foto ke storage, memakai preview lokal."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3) {
      nextErrors.title = "Nama layanan minimal 3 karakter.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        slug: slug.trim() || undefined,
        category: category.trim(),
        price_prefix: pricePrefix.trim() || "Mulai dari",
        price: price.trim() || null,
        unit: unit.trim() || "/ unit",
        price_note: priceNote.trim(),
        image_url: imageUrl.trim() || "/images/ac-split-clean.jpg",
        image_key: imageKey.trim(),
        summary: summary.trim(),
        sort_order: Number.parseInt(sortOrder, 10) || 0,
        is_active: isActive,
      });
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan layanan. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={service ? "Edit Layanan" : "Tambah Layanan"}
      description={
        service
          ? "Perbarui tarif, foto, deskripsi, atau status layanan AC publik."
          : "Layanan baru akan tampil di halaman publik dan katalog layanan WTM."
      }
      icon={
        service ? (
          <Pencil aria-hidden="true" className="size-4" />
        ) : (
          <Plus aria-hidden="true" className="size-4" />
        )
      }
      busy={submitting || uploadingImage}
      error={serverError}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting || uploadingImage}
            className="h-9 rounded-md border-slate-200 text-xs font-medium text-slate-600"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="service-form"
            disabled={submitting || uploadingImage}
            className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-4 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
          >
            {submitting && <Spinner className="size-3.5" />}
            {service ? "Simpan Perubahan" : "Simpan Layanan"}
          </Button>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Upload Foto Layanan (MinIO) */}
          <Field>
            <FieldLabel className="text-xs font-medium text-slate-700">
              Foto Layanan (MinIO Storage)
            </FieldLabel>
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview foto layanan"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-slate-400">
                    <Wrench className="size-5" />
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    <Spinner className="size-4" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 gap-1.5 rounded-md border-slate-200 text-xs font-medium text-slate-700"
                  >
                    <ImagePlus className="size-3.5" />
                    {imageUrl ? "Ganti Foto" : "Unggah Foto"}
                  </Button>

                  {imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImageUrl("");
                        setImageKey("");
                      }}
                      className="h-8 rounded-md text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="size-3.5" />
                      Hapus
                    </Button>
                  )}
                </div>
                <FieldDescription className="text-[10.5px] text-slate-400">
                  {imageKey ? `Tersimpan di MinIO: ${imageKey}` : "JPG, PNG, atau WEBP maks 10MB."}
                </FieldDescription>
              </div>
            </div>
          </Field>

          {/* Nama Layanan & Slug */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="service-title" className="text-xs font-medium text-slate-700">
                Nama Layanan
              </FieldLabel>
              <Input
                ref={titleRef}
                id="service-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                maxLength={200}
                placeholder="Contoh: Cuci AC Split 1 PK"
                aria-invalid={Boolean(errors.title)}
                className="h-10 rounded-md border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400"
              />
              <FieldError errors={[{ message: errors.title }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="service-slug" className="text-xs font-medium text-slate-700">
                Slug URL
              </FieldLabel>
              <Input
                id="service-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                maxLength={120}
                placeholder="cuci-ac-split"
                className="h-10 rounded-md border-slate-200 bg-white font-mono text-xs text-slate-700 placeholder:text-slate-400"
              />
            </Field>
          </div>

          {/* Kategori & Tarif */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="service-category" className="text-xs font-medium text-slate-700">
                Kategori
              </FieldLabel>
              <Select
                items={categoryOptions.map((val) => ({ label: val, value: val }))}
                value={category}
                onValueChange={(val) => {
                  if (val) setCategory(val);
                }}
              >
                <SelectTrigger
                  id="service-category"
                  aria-label="Kategori Layanan"
                  className="h-10 w-full rounded-md border-slate-200 bg-white text-[13px] text-slate-700"
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categoryOptions.map((val) => (
                      <SelectItem key={val} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="service-price" className="text-xs font-medium text-slate-700">
                Tarif / Harga
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="service-price-prefix"
                  value={pricePrefix}
                  onChange={(e) => setPricePrefix(e.target.value)}
                  placeholder="Mulai dari"
                  className="h-10 w-24 rounded-md border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400"
                />
                <Input
                  id="service-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Rp 65.000"
                  className="h-10 flex-1 rounded-md border-slate-200 bg-white text-[13px] font-semibold text-slate-700 placeholder:text-slate-400"
                />
                <Input
                  id="service-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="/ unit"
                  className="h-10 w-20 rounded-md border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </Field>
          </div>

          {/* Ringkasan */}
          <Field>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="service-summary" className="text-xs font-medium text-slate-700">
                Ringkasan Layanan
              </FieldLabel>
              <span className="text-[10px] tabular-nums text-slate-400">
                {summary.length}/300
              </span>
            </div>
            <Textarea
              id="service-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Penjelasan singkat keunggulan atau cakupan pengerjaan."
              className="min-h-16 resize-y rounded-md border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400"
            />
          </Field>

          {/* Catatan Tarif & Urutan */}
          <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
            <Field>
              <FieldLabel htmlFor="service-price-note" className="text-xs font-medium text-slate-700">
                Catatan Tarif (Opsional)
              </FieldLabel>
              <Input
                id="service-price-note"
                value={priceNote}
                onChange={(e) => setPriceNote(e.target.value)}
                placeholder="1,5-2 PK Rp 85.000 atau cassette menyesuaikan"
                className="h-10 rounded-md border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="service-sort-order" className="text-xs font-medium text-slate-700">
                Urutan
              </FieldLabel>
              <Input
                id="service-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-10 rounded-md border-slate-200 bg-white text-[13px] tabular-nums text-slate-700"
              />
            </Field>
          </div>

          {/* Checkbox Status Aktif */}
          <Field
            orientation="horizontal"
            className="rounded-md border border-slate-200 bg-slate-50/60 p-3"
          >
            <Checkbox
              id="service-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked)}
              className="mt-0.5"
            />
            <FieldContent>
              <FieldLabel
                htmlFor="service-active"
                className="cursor-pointer text-xs font-medium text-slate-700"
              >
                Tampilkan sebagai Layanan aktif
              </FieldLabel>
              <FieldDescription className="text-[11px] text-slate-500">
                Layanan akan muncul di katalog publik dan dapat dipilih saat pengunjung konsultasi.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default ServiceDialog;
