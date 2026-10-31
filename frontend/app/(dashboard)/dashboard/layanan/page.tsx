import type { Metadata } from "next";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Katalog Layanan",
};

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Katalog Layanan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola daftar layanan AC, ducting, dan tata udara yang tampil pada situs publik.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2279cf] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#721111]"
        >
          <Plus className="size-4" />
          Layanan Baru
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-400">
          <p className="text-sm font-medium">Slot Daftar Layanan</p>
          <span className="mt-1 text-xs">
            (Siap diisi tabel atau kartu manajemen layanan, harga, dan deskripsi)
          </span>
        </div>
      </div>
    </div>
  );
}
