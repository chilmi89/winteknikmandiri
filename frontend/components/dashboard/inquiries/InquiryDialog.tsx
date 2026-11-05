"use client";

import { useRef, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
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
  inquiryStatusMeta,
  inquiryStatusOrder,
  type Inquiry,
  type InquiryPayload,
  type InquiryStatus,
} from "@/lib/dashboard/inquiries";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type InquiryDialogProps = {
  inquiry: Inquiry | null;
  onClose: () => void;
  onSubmit: (payload: InquiryPayload) => Promise<void>;
};

type FormErrors = {
  name?: string;
  phone?: string;
  service?: string;
  address?: string;
};

export function InquiryDialog({
  inquiry,
  onClose,
  onSubmit,
}: InquiryDialogProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState(inquiry?.name ?? "");
  const [phone, setPhone] = useState(inquiry?.phone ?? "");
  const [service, setService] = useState(inquiry?.service ?? "");
  const [address, setAddress] = useState(inquiry?.address ?? "");
  const [notes, setNotes] = useState(inquiry?.notes ?? "");
  const [status, setStatus] = useState<InquiryStatus>(
    inquiry?.status ?? "pending"
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusItems = inquiryStatusOrder.map((value) => ({
    label: inquiryStatusMeta[value].label,
    value,
  }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedService = service.trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2) {
      nextErrors.name = "Nama pelanggan minimal 2 karakter.";
    }
    if (trimmedPhone.replace(/\D/g, "").length < 8) {
      nextErrors.phone = "Nomor telepon minimal 8 digit.";
    }
    if (trimmedService.length < 2) {
      nextErrors.service = "Layanan wajib diisi.";
    }
    if (trimmedAddress.length < 5) {
      nextErrors.address = "Alamat minimal 5 karakter.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.service) serviceRef.current?.focus();
      else addressRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        phone: trimmedPhone,
        service: trimmedService,
        address: trimmedAddress,
        notes: notes.trim(),
        status,
      });
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan permohonan. Silakan coba lagi."
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
      title={inquiry ? "Edit Permohonan" : "Tambah Permohonan"}
      description={
        inquiry
          ? "Perbarui data pelanggan, kebutuhan layanan, atau status pengerjaan."
          : "Catat permohonan baru agar tim dapat menindaklanjuti dengan cepat."
      }
      icon={
        inquiry ? (
          <Pencil aria-hidden="true" className="size-4" />
        ) : (
          <Plus aria-hidden="true" className="size-4" />
        )
      }
      busy={submitting}
      error={serverError}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="h-9 rounded-md border-slate-200 text-xs font-medium text-slate-600"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="inquiry-form"
            disabled={submitting}
            className="h-9 gap-1.5 rounded-md bg-[#0A2540] px-4 text-xs font-semibold text-white hover:bg-[#0A2540]/90"
          >
            {submitting && <Spinner className="size-3.5" />}
            {inquiry ? "Simpan Perubahan" : "Simpan Permohonan"}
          </Button>
        </>
      }
    >
      <form id="inquiry-form" onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel
                htmlFor="inquiry-name"
                className="text-xs font-medium text-slate-700"
              >
                Nama Pelanggan
              </FieldLabel>
              <Input
                ref={nameRef}
                id="inquiry-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                placeholder="Nama pelanggan atau perusahaan"
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-md border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400"
              />
              <FieldError errors={[{ message: errors.name }]} />
            </Field>

            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel
                htmlFor="inquiry-phone"
                className="text-xs font-medium text-slate-700"
              >
                Nomor WhatsApp
              </FieldLabel>
              <Input
                ref={phoneRef}
                id="inquiry-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={24}
                placeholder="0812-1662-2840"
                aria-invalid={Boolean(errors.phone)}
                className="h-10 rounded-md border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400"
              />
              <FieldError errors={[{ message: errors.phone }]} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <Field data-invalid={Boolean(errors.service)}>
              <FieldLabel
                htmlFor="inquiry-service"
                className="text-xs font-medium text-slate-700"
              >
                Layanan
              </FieldLabel>
              <Input
                ref={serviceRef}
                id="inquiry-service"
                value={service}
                onChange={(event) => setService(event.target.value)}
                maxLength={120}
                placeholder="Contoh: Instalasi VRF & Ducting"
                aria-invalid={Boolean(errors.service)}
                className="h-10 rounded-md border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400"
              />
              <FieldError errors={[{ message: errors.service }]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-medium text-slate-700">
                Status
              </FieldLabel>
              <Select
                items={statusItems}
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as InquiryStatus);
                }}
              >
                <SelectTrigger
                  aria-label="Status permohonan"
                  className="h-10 w-full rounded-md border-slate-200 bg-white text-[13px] text-slate-700"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.address)}>
            <FieldLabel
              htmlFor="inquiry-address"
              className="text-xs font-medium text-slate-700"
            >
              Alamat
            </FieldLabel>
            <Textarea
              ref={addressRef}
              id="inquiry-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={2}
              maxLength={240}
              placeholder="Alamat lengkap lokasi pengerjaan"
              aria-invalid={Boolean(errors.address)}
              className="min-h-16 resize-y rounded-md border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400"
            />
            <FieldError errors={[{ message: errors.address }]} />
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel
                htmlFor="inquiry-notes"
                className="text-xs font-medium text-slate-700"
              >
                Catatan Kebutuhan
              </FieldLabel>
              <span className="text-[10px] tabular-nums text-slate-400">
                {notes.length}/500
              </span>
            </div>
            <Textarea
              id="inquiry-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Detail kebutuhan, jumlah unit, atau preferensi jadwal."
              className="min-h-20 resize-y rounded-md border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400"
            />
          </Field>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default InquiryDialog;
