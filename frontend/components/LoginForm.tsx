"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

export default function LoginForm() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6">
      {/* Breadcrumb / Back Link */}
      <Link
        href="/"
        className={`mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0A2540]/60 transition-colors hover:text-[#A82020] ${focusRing}`}
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke Beranda
      </Link>

      {/* Login Card */}
      <div className="border border-[#0A2540]/10 bg-white p-6 shadow-[0_4px_24px_rgba(10,37,64,0.06)] sm:p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center border border-[#0A2540]/10 bg-[#F4FAFE]">
            <Image
              src="/logo/logo_wtm.png"
              alt="CV Win Teknik Mandiri"
              width={40}
              height={34}
              className="h-8 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A2540]">
            Portal Masuk
          </h1>
          <p className="mt-1.5 text-xs text-[#0A2540]/60">
            Akses manajemen proyek dan layanan pelanggan WTM
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#0A2540]"
            >
              Email / Username
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0A2540]/40">
                <Mail className="size-4" />
              </div>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="nama@perusahaan.com"
                required
                className={`block w-full border border-[#0A2540]/15 bg-white py-2.5 pr-3 pl-10 text-sm text-[#0A2540] placeholder:text-[#0A2540]/35 focus:border-[#A82020] focus:outline-none ${focusRing}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#0A2540]"
              >
                Kata Sandi
              </label>
              <Link
                href={waLink("Halo Admin CV Win Teknik Mandiri, saya lupa kata sandi akun saya.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#A82020] hover:underline"
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
                placeholder="••••••••"
                required
                className={`block w-full border border-[#0A2540]/15 bg-white py-2.5 pr-3 pl-10 text-sm text-[#0A2540] placeholder:text-[#0A2540]/35 focus:border-[#A82020] focus:outline-none ${focusRing}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember"
              type="checkbox"
              className="size-4 border-[#0A2540]/20 text-[#A82020] focus:ring-[#A82020]"
            />
            <label
              htmlFor="remember"
              className="text-xs text-[#0A2540]/70"
            >
              Ingat saya di perangkat ini
            </label>
          </div>

          <button
            type="submit"


            onClick = {() => {

              window.location.href = "/dashboard";
            }}
            className={`mt-2 flex w-full items-center justify-center gap-2 bg-[#A82020] px-4 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
          >
            Masuk ke Akun
          </button>
        </form>
  
      </div>
    </div>
  );
}
