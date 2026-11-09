"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";
import type { UserItem } from "@/lib/users";

type ResetPasswordDialogProps = {
  user: UserItem;
  onClose: () => void;
  onSubmitReset: (id: string, newPassword: string) => Promise<void>;
};

export function ResetPasswordDialog({
  user,
  onClose,
  onSubmitReset,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Buat kata sandi acak otomatis untuk kemudahan admin
  function handleGenerateRandom() {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setServerError(null);

    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitReset(user.id, newPassword);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal me-reset kata sandi.";
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
      icon={<KeyRound className="size-5 text-[#A82020]" />}
      title="Reset Kata Sandi"
      description={`Atur ulang kata sandi akses akun untuk ${user.name} (@${user.username}).`}
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
            form="reset-password-form"
            size="sm"
            disabled={submitting}
            className="gap-2 bg-[#A82020] text-white hover:bg-[#8e1919]"
          >
            {submitting ? (
              <>
                <Spinner className="size-3.5" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Kata Sandi Baru</span>
            )}
          </Button>
        </>
      }
    >
      <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
            {serverError}
          </div>
        )}

        {/* Ringkasan Akun */}
        <div className="rounded-lg border border-slate-200/90 bg-slate-50/70 p-3 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">{user.name}</span>
            <span className="font-mono text-slate-500">@{user.username}</span>
          </div>
          <p className="mt-0.5 text-slate-500">{user.email}</p>
        </div>

        <div className="space-y-3.5">
          {/* Kata Sandi Baru */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="new_password" className="block text-xs font-semibold text-slate-700">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2279cf] hover:underline"
              >
                <RefreshCw className="size-3" />
                Buat Acak
              </button>
            </div>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Minimal 6 karakter"
                disabled={submitting}
                className="h-9.5 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div className="space-y-1.5">
            <label htmlFor="confirm_password" className="block text-xs font-semibold text-slate-700">
              Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              placeholder="Ulangi kata sandi baru"
              disabled={submitting}
              className="h-9.5 font-mono text-xs"
            />
            {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
          </div>
        </div>
      </form>
    </FormDialog>
  );
}
