"use client";

import { useRef, useState } from "react";
import { MessageCircleQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  FAQ_CATEGORIES,
  type Faq,
  type FaqPayload,
} from "@/lib/dashboard/faqs";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type FaqDialogProps = {
  faq: Faq | null;
  onClose: () => void;
  onSubmit: (payload: FaqPayload) => Promise<void>;
};

type FormErrors = {
  question?: string;
  answer?: string;
  sortOrder?: string;
};

export function FaqDialog({ faq, onClose, onSubmit }: FaqDialogProps) {
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const sortOrderRef = useRef<HTMLInputElement>(null);

  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "Umum");
  const [sortOrder, setSortOrder] = useState(String(faq?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(faq?.is_active ?? true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions: string[] = [...FAQ_CATEGORIES];
  if (category && !categoryOptions.includes(category)) {
    categoryOptions.push(category);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (trimmedQuestion.length < 5) {
      nextErrors.question = "Pertanyaan minimal 5 karakter.";
    }
    if (trimmedAnswer.length < 5) {
      nextErrors.answer = "Jawaban minimal 5 karakter.";
    }

    const parsedSortOrder = Number(sortOrder);
    if (!sortOrder.trim() || !Number.isFinite(parsedSortOrder)) {
      nextErrors.sortOrder = "Urutan harus berupa angka.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.question) questionRef.current?.focus();
      else if (nextErrors.answer) answerRef.current?.focus();
      else sortOrderRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        question: trimmedQuestion,
        answer: trimmedAnswer,
        category: category.trim(),
        sort_order: Math.trunc(parsedSortOrder),
        is_active: isActive,
      });
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan FAQ. Silakan coba lagi."
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
      title={faq ? "Edit FAQ" : "Tambah FAQ"}
      icon={
        faq ? (
          <MessageCircleQuestion aria-hidden="true" className="size-4" />
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
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="faq-form"
            disabled={submitting}
            className="h-9 gap-1.5 rounded-lg bg-[#0A2540] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#071a2e] active:scale-[0.98]"
          >
            {submitting && <Spinner className="size-3.5" />}
            {faq ? "Simpan Perubahan" : "Simpan FAQ"}
          </Button>
        </>
      }
    >
      <form id="faq-form" onSubmit={handleSubmit}>
        <FieldGroup className="gap-4">
          {/* Pertanyaan */}
          <Field data-invalid={Boolean(errors.question)}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel
                htmlFor="faq-question"
                className="text-[13px] font-semibold text-slate-800"
              >
                Pertanyaan
              </FieldLabel>
              <span className="font-mono text-[11px] tabular-nums text-slate-400">
                {question.length}/300
              </span>
            </div>
            <Textarea
              ref={questionRef}
              id="faq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Tulis pertanyaan..."
              aria-invalid={Boolean(errors.question)}
              className="min-h-20 resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 shadow-xs transition-all hover:border-slate-400 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 focus:outline-none"
            />
            <FieldError errors={[{ message: errors.question }]} />
          </Field>

          {/* Jawaban */}
          <Field data-invalid={Boolean(errors.answer)}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel
                htmlFor="faq-answer"
                className="text-[13px] font-semibold text-slate-800"
              >
                Jawaban
              </FieldLabel>
              <span className="font-mono text-[11px] tabular-nums text-slate-400">
                {answer.length}/1000
              </span>
            </div>
            <Textarea
              ref={answerRef}
              id="faq-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Tulis jawaban..."
              aria-invalid={Boolean(errors.answer)}
              className="min-h-28 resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-xs transition-all hover:border-slate-400 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 focus:outline-none"
            />
            <FieldError errors={[{ message: errors.answer }]} />
          </Field>

          {/* Kategori & Urutan */}
          <div className="grid gap-3.5 sm:grid-cols-[1fr_110px]">
            <Field>
              <FieldLabel
                htmlFor="faq-category"
                className="text-[13px] font-semibold text-slate-800"
              >
                Kategori
              </FieldLabel>
              <Select
                items={categoryOptions.map((value) => ({
                  label: value,
                  value,
                }))}
                value={category}
                onValueChange={(value) => {
                  if (value) setCategory(value);
                }}
              >
                <SelectTrigger
                  id="faq-category"
                  aria-label="Kategori FAQ"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] text-slate-800 shadow-xs transition-all hover:border-slate-400 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 focus:outline-none"
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-slate-200 bg-white shadow-lg">
                  <SelectGroup>
                    {categoryOptions.map((value) => (
                      <SelectItem key={value} value={value} className="text-[13px]">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field data-invalid={Boolean(errors.sortOrder)}>
              <FieldLabel
                htmlFor="faq-sort-order"
                className="text-[13px] font-semibold text-slate-800"
              >
                Urutan
              </FieldLabel>
              <Input
                ref={sortOrderRef}
                id="faq-sort-order"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                aria-invalid={Boolean(errors.sortOrder)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium tabular-nums text-slate-800 shadow-xs transition-all hover:border-slate-400 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 focus:outline-none"
              />
              <FieldError errors={[{ message: errors.sortOrder }]} />
            </Field>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-300/80 bg-slate-50/60 px-3.5 py-3 transition-colors hover:bg-slate-50">
            <Checkbox
              id="faq-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked)}
              className="size-4 rounded border-slate-300 data-checked:border-[#0A2540] data-checked:bg-[#0A2540]"
            />
            <label
              htmlFor="faq-active"
              className="cursor-pointer select-none text-[13px] font-medium text-slate-700"
            >
              Aktifkan di halaman publik
            </label>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default FaqDialog;
