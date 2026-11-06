"use client";

import { useRef, useState } from "react";
import { Clock } from "lucide-react";
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
import type { JamOperasionalItem, JamOperasionalPayload } from "@/lib/jamOperasional";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type JamOperasionalDialogProps = {
  item: JamOperasionalItem | null;
  onClose: () => void;
  onSubmit: (payload: JamOperasionalPayload) => Promise<void>;
};

type FormErrors = {
  dayLabel?: string;
  hours?: string;
  sortOrder?: string;
};

export function JamOperasionalDialog({
  item,
  onClose,
  onSubmit,
}: JamOperasionalDialogProps) {
  const dayLabelRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLInputElement>(null);

  const [dayLabel, setDayLabel] = useState(item?.day_label ?? "");
  const [hours, setHours] = useState(item?.hours ?? "08.00 – 16.00");
  const [isClosed, setIsClosed] = useState(item?.is_closed ?? false);
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedDay = dayLabel.trim();
    const trimmedHours = hours.trim();

    if (trimmedDay.length < 2) {
      nextErrors.dayLabel = "Nama hari minimal 2 karakter.";
    }
    if (trimmedHours.length < 2) {
      nextErrors.hours = "Jam kerja minimal 2 karakter.";
    }

    const parsedSortOrder = Number(sortOrder);
    if (!sortOrder.trim() || !Number.isFinite(parsedSortOrder)) {
      nextErrors.sortOrder = "Urutan harus berupa angka.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.dayLabel) dayLabelRef.current?.focus();
      else if (nextErrors.hours) hoursRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        day_label: trimmedDay,
        hours: isClosed ? "Libur" : trimmedHours,
        is_closed: isClosed,
        sort_order: Math.trunc(parsedSortOrder),
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan jadwal operasional. Silakan coba lagi.";
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
      icon={<Clock className="size-5 text-[#A82020]" />}
      title={item ? "Edit Baris Jadwal" : "Tambah Baris Jadwal"}
      description="Kelola hari dan jam kerja yang tampil di kartu Jam Operasional."
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
            form="jam-operasional-form"
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
              "Simpan Jadwal"
            )}
          </Button>
        </>
      }
    >
      <form id="jam-operasional-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        <Field data-invalid={Boolean(errors.dayLabel)}>
          <FieldLabel htmlFor="jam-day">
            Nama Hari / Keterangan Hari <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            id="jam-day"
            ref={dayLabelRef}
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            placeholder="Contoh: Senin – Jumat / Sabtu / Minggu"
            required
          />
          {errors.dayLabel && <FieldError errors={[{ message: errors.dayLabel }]} />}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.hours)}>
            <FieldLabel htmlFor="jam-hours">
              Jam Kerja <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              id="jam-hours"
              ref={hoursRef}
              value={isClosed ? "Libur" : hours}
              disabled={isClosed}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Contoh: 08.00 – 16.00"
              required={!isClosed}
            />
            {errors.hours && <FieldError errors={[{ message: errors.hours }]} />}
          </Field>

          <Field data-invalid={Boolean(errors.sortOrder)}>
            <FieldLabel htmlFor="jam-sort-order">Urutan Tampil</FieldLabel>
            <Input
              id="jam-sort-order"
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
                checked={isClosed}
                onCheckedChange={(c) => {
                  const closed = Boolean(c);
                  setIsClosed(closed);
                  if (closed) setHours("Libur");
                  else setHours("08.00 – 16.00");
                }}
              />
              <span className="text-rose-700 font-semibold">Tandai Hari Libur (Teks Merah)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <Checkbox
                checked={isActive}
                onCheckedChange={(c) => setIsActive(Boolean(c))}
              />
              <span>Aktifkan / Tampilkan</span>
            </label>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default JamOperasionalDialog;
