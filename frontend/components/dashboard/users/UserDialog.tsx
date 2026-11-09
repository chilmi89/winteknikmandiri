"use client";

import { useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";
import type { UserItem, CreateUserPayload, UpdateUserPayload } from "@/lib/users";

type UserDialogProps = {
  item: UserItem | null;
  onClose: () => void;
  onSubmitCreate: (payload: CreateUserPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateUserPayload) => Promise<void>;
};

type FormErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
};

export function UserDialog({
  item,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}: UserDialogProps) {
  const isEdit = Boolean(item);

  const [name, setName] = useState(item?.name ?? "");
  const [username, setUsername] = useState(item?.username ?? "");
  const [email, setEmail] = useState(item?.email ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      nextErrors.name = "Nama lengkap minimal 2 karakter.";
    }
    if (trimmedUsername.length < 3) {
      nextErrors.username = "Username minimal 3 karakter tanpa spasi.";
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUsername)) {
      nextErrors.username = "Username hanya boleh berisi huruf, angka, titik, atau underscore.";
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Format alamat email tidak valid.";
    }

    if (!isEdit && password.length < 6) {
      nextErrors.password = "Kata sandi minimal 6 karakter.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (isEdit && item) {
        await onSubmitUpdate(item.id, {
          name: trimmedName,
          username: trimmedUsername,
          email: trimmedEmail,
          is_active: isActive,
        });
      } else {
        await onSubmitCreate({
          name: trimmedName,
          username: trimmedUsername,
          email: trimmedEmail,
          password: password,
        });
      }
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data pengguna. Silakan coba lagi.";
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
      icon={
        isEdit ? (
          <UserCheck className="size-5 text-[#2279cf]" />
        ) : (
          <UserPlus className="size-5 text-[#2279cf]" />
        )
      }
      title={isEdit ? "Edit Profil Pengguna" : "Tambah Pengguna Baru"}
      description={
        isEdit
          ? "Ubah data akun pengguna untuk akses panel admin."
          : "Buat akun pengguna baru dengan username, email, dan kata sandi awal."
      }
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
            form="user-form"
            size="sm"
            disabled={submitting}
            className="gap-2 bg-[#2279cf] text-white hover:bg-[#1a63ab]"
          >
            {submitting ? (
              <>
                <Spinner className="size-3.5" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}</span>
            )}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
            {serverError}
          </div>
        )}

        <div className="space-y-3.5">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              disabled={submitting}
              className="h-9.5 text-xs"
            />
            {errors.name && <p className="text-[11px] text-rose-600 font-medium">{errors.name}</p>}
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
              Username <span className="text-rose-500">*</span>
            </label>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: budi_wtm"
              disabled={submitting}
              className="h-9.5 font-mono text-xs"
            />
            {errors.username && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@winteknikmandiri.com"
              disabled={submitting}
              className="h-9.5 text-xs"
            />
            {errors.email && <p className="text-[11px] text-rose-600 font-medium">{errors.email}</p>}
          </div>

          {/* Kata Sandi (Hanya saat buat akun baru) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Kata Sandi Awal <span className="text-rose-500">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                disabled={submitting}
                className="h-9.5 text-xs font-mono"
              />
              {errors.password && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.password}</p>
              )}
            </div>
          )}

          {/* Status Aktif (Saat Edit) */}
          {isEdit && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked === true)}
                disabled={submitting}
              />
              <label
                htmlFor="is_active"
                className="text-xs font-medium text-slate-700 cursor-pointer select-none"
              >
                Akun aktif (dapat digunakan untuk login)
              </label>
            </div>
          )}
        </div>
      </form>
    </FormDialog>
  );
}
