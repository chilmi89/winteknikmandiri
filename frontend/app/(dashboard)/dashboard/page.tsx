import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, Inbox, Users, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const stats = [
    {
      label: "Permohonan Masuk",
      value: "14",
      desc: "Menunggu tindak lanjut",
      href: "/dashboard/inquiries",
      icon: Inbox,
    },
    {
      label: "Proyek Aktif",
      value: "8",
      desc: "Sedang dikerjakan",
      href: "/dashboard/proyek",
      icon: FolderKanban,
    },
    {
      label: "Pelanggan",
      value: "42",
      desc: "Terdaftar dalam sistem",
      href: "/dashboard/pelanggan",
      icon: Users,
    },
    {
      label: "Layanan Tersedia",
      value: "6",
      desc: "Katalog publik",
      href: "/dashboard/layanan",
      icon: Wrench,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard Ringkasan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selamat datang di panel kontrol operasional CV Win Teknik Mandiri.
        </p>
      </div>

      {/* Grid Statistik Ringkas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                {stat.label}
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-[#8A1515]/10 group-hover:text-[#8A1515]">
                <stat.icon className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {stat.value}
              </span>
              <span className="inline-flex items-center text-xs font-medium text-slate-400 group-hover:text-[#8A1515]">
                Lihat
                <ArrowUpRight className="ml-0.5 size-3" />
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{stat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Container Konten Utama */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">
          Aktivitas & Pantauan
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Area slot konten kustom untuk grafik, tabel permohonan terbaru, atau catatan operasional.
        </p>

        <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-400">
          <p className="text-sm font-medium">Slot Konten Kustom</p>
          <span className="mt-1 text-xs">
            (Bisa diisi tabel kustom, grafik recharts, atau list data operasional Anda)
          </span>
        </div>
      </div>
    </div>
  );
}
