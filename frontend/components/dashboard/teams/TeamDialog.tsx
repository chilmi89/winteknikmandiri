"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Users, Upload, X } from "lucide-react";
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
import type { TeamMemberItem, TeamMemberPayload } from "@/lib/teamMembers";
import { uploadTeamPhoto } from "@/lib/teamMembers";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type TeamDialogProps = {
  item: TeamMemberItem | null;
  onClose: () => void;
  onSubmit: (payload: TeamMemberPayload) => Promise<void>;
};

type FormErrors = {
  name?: string;
  skill?: string;
};

export function TeamDialog({ item, onClose, onSubmit }: TeamDialogProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(item?.name ?? "");
  const [skill, setSkill] = useState(item?.skill ?? "");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [imageKey, setImageKey] = useState(item?.image_key ?? "");
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
      const res = await uploadTeamPhoto(file);
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
    const trimmedName = name.trim();
    const trimmedSkill = skill.trim();

    if (trimmedName.length < 2) {
      nextErrors.name = "Nama tim minimal 2 karakter.";
    }
    if (trimmedSkill.length < 2) {
      nextErrors.skill = "Skill / spesialisasi minimal 2 karakter.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        skill: trimmedSkill,
        image_url: imageUrl.trim(),
        image_key: imageKey.trim(),
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data tim. Silakan coba lagi.";
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
      icon={<Users className="size-5 text-[#A82020]" />}
      title={item ? "Edit Anggota Tim" : "Tambah Anggota Tim"}
      description="Super minimalis: masukkan nama, spesialisasi, dan unggah foto tim (auto-convert ke WebP)."
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
            form="team-form"
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
              "Simpan Tim"
            )}
          </Button>
        </>
      }
    >
      <form id="team-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="team-name">
            Nama Tim <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            id="team-name"
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Team Wahyu"
            required
          />
          {errors.name && <FieldError errors={[{ message: errors.name }]} />}
        </Field>

        <Field data-invalid={Boolean(errors.skill)}>
          <FieldLabel htmlFor="team-skill">
            Skill / Spesialisasi <span className="text-rose-500">*</span>
          </FieldLabel>
          <Input
            id="team-skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Contoh: Spesialis VRF & Unit Komersial"
            required
          />
          {errors.skill && <FieldError errors={[{ message: errors.skill }]} />}
        </Field>

        {/* Upload Foto (Auto-Convert WebP) */}
        <Field>
          <FieldLabel>Foto Tim (Otomatis Kompres ke WebP)</FieldLabel>
          <div className="mt-1.5 flex items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name || "Preview"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-slate-400">
                  <Users className="size-6" />
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
                id="team-photo-file"
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
                Format didukung: JPG, PNG, WEBP. Otomatis dikompres &amp; diubah ke format WebP ringan.
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
            <span>Aktifkan / Tampilkan di Halaman Tentang Kami</span>
          </label>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default TeamDialog;
