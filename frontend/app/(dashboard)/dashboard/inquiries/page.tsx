import type { Metadata } from "next";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Permohonan Masuk",
};

export default function InquiriesPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Permohonan Masuk
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola dan tindak lanjuti permintaan permohonan service AC dari website.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2279cf] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#721111]"
          >
            <Plus className="size-4" />
            Tambah Data
          </button>
        </div>
      </div>

      {/* 2. Container Card Putih (Siap Diisi Konten Kustom Anda) */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        {/*
          =======================================================
          AREA KONTEN KUSTOM ANDA
          =======================================================
          Di sini Anda bebas memasang elemen apa saja:
          - Tabel buatan sendiri <table>...</table>
          - Filter input atau form
          - Card grid / list data
        */}
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            Container Konten Siap Pakai
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Silakan masukkan markup tabel kustom atau komponen Anda langsung di
            dalam card ini tanpa terikat abstraksi bawaan.
          </p>
        </div>
      </div>
    </div>
  );
}
