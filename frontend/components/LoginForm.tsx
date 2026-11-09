"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { waLink } from "@/lib/site";
import { loginAdmin } from "@/lib/auth";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2279CF]";

const brandPoints = [
  "Pantau proyek & invoice secara real-time",
  "Kelola layanan dan data pelanggan",
  "Laporan keuangan tanpa rekap manual",
];

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setError("Username / email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginAdmin(trimmedId, trimmedPass);
      if (res.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setError(res.error || "Username atau kata sandi tidak cocok.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      {/* Breadcrumb / Back Link */}
      <Link
        href="/"
        className={`mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0A2540]/60 transition-colors hover:text-[#2279CF] ${focusRing}`}
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke Beranda
      </Link>

      <div className="grid overflow-hidden rounded-2xl border border-[#0A2540]/10 bg-white shadow-[0_24px_70px_-24px_rgba(10,37,64,0.35)] md:grid-cols-[1.05fr_1fr]">
        {/* Panel Brand — dominan biru */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#103a63] to-[#2279CF] p-9 text-white md:flex">
          {/* Dekorasi halus */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-[#8ACFF8]/20 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-[#2279CF]/40 blur-3xl"
          />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/95">
              <Image
                src="/logo/logo_wtm.png"
                alt="CV Win Teknik Mandiri"
                width={32}
                height={27}
                className="h-6 w-auto object-contain"
              />
            </div>
            <div className="text-sm font-semibold leading-tight tracking-tight">
              WIN TEKNIK
              <span className="block text-[11px] font-normal text-white/60">
                MANDIRI
              </span>
            </div>
          </div>

          {/* Value proposition */}
          <div className="relative mt-10">
            <h2 className="text-2xl font-semibold leading-snug tracking-tight">
              Satu portal untuk proyek, layanan, dan pertumbuhan bisnis.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/70">
              Masuk untuk mengelola operasional CV Win Teknik Mandiri dalam satu
              tempat.
            </p>

            <ul className="mt-7 space-y-3">
              {brandPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-xs text-white/85"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#8ACFF8]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 text-[11px] text-white/50">
            CV Win Teknik Mandiri · Kediri
          </p>
        </div>

        {/* Panel Form */}
        <div className="p-6 sm:p-8">
          {/* Logo ringkas untuk mobile */}
          <div className="mb-6 flex items-center gap-2.5 md:hidden">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#F4FAFE]">
              <Image
                src="/logo/logo_wtm.png"
                alt="CV Win Teknik Mandiri"
                width={28}
                height={24}
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-[#0A2540]">
              WIN TEKNIK <span className="text-[#2279CF]">MANDIRI</span>
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0A2540]">
              Portal Masuk
            </h1>
            <p className="mt-1 text-xs text-[#0A2540]/60">
              Akses manajemen proyek dan layanan pelanggan.
            </p>
          </div>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            {/* Pesan Error Login */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-medium text-[#0A2540]"
              >
                Username atau Email
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0A2540]/40">
                  <User className="size-4" />
                </div>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="admin atau nama@perusahaan.com"
                  required
                  disabled={loading}
                  autoComplete="username"
                  className={`block w-full rounded-lg border border-[#0A2540]/10 bg-white py-2.5 pr-3 pl-10 text-sm text-[#0A2540] transition placeholder:text-[#0A2540]/35 focus:border-[#2279CF] focus:ring-2 focus:ring-[#2279CF]/20 focus:outline-none ${focusRing}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[#0A2540]"
                >
                  Kata Sandi
                </label>
                <Link
                  href={waLink(
                    "Halo Admin CV Win Teknik Mandiri, saya lupa kata sandi akun saya."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#2279CF] hover:underline"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0A2540]/40">
                  <Lock className="size-4" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className={`block w-full rounded-lg border border-[#0A2540]/10 bg-white py-2.5 pr-3 pl-10 text-sm text-[#0A2540] transition placeholder:text-[#0A2540]/35 focus:border-[#2279CF] focus:ring-2 focus:ring-[#2279CF]/20 focus:outline-none ${focusRing}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2279CF] px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_10px_24px_-10px_rgba(34,121,207,0.8)] transition hover:bg-[#1a63ab] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memverifikasi akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#0A2540]/45">
            Butuh bantuan akses?{" "}
            <Link
              href={waLink(
                "Halo Admin CV Win Teknik Mandiri, saya butuh bantuan akses portal."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#2279CF] hover:underline"
            >
              Hubungi admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
