import type { Metadata } from "next";
import {
  Building2,
  Database,
  Globe,
  Mail,
  MapPin,
  Phone,
  Server,
  ShieldCheck,
} from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pengaturan Sistem",
};

export default function SettingsPage() {
  const companyInfo = [
    { label: "Nama Perusahaan", value: site.legalName, icon: Building2 },
    { label: "Nomor Telepon", value: site.phoneDisplay, icon: Phone },
    { label: "Alamat Email", value: site.email, icon: Mail },
    { label: "Lokasi Workshop", value: site.address, icon: MapPin },
  ];

  const systemStatus = [
    { name: "Backend Go Gin", desc: "API v1 terhubung", status: "Aktif", icon: Server },
    { name: "PostgreSQL 16", desc: "Database utama", status: "Terhubung", icon: Database },
    { name: "Caddy Web Server", desc: "Reverse proxy & SSL", status: "Berjalan", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pengaturan Sistem
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Informasi profil perusahaan dan status integrasi teknis dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Identitas Perusahaan */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900">
            Identitas Perusahaan
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Data resmi yang terhubung ke dokumen dan footer situs.
          </p>

          <dl className="mt-5 divide-y divide-slate-100">
            {companyInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <info.icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs font-medium text-slate-400">{info.label}</dt>
                  <dd className="text-sm font-semibold text-slate-800">{info.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Status Integrasi */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900">
            Status Integrasi
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Layanan infrastruktur yang menopang operasional dashboard.
          </p>

          <div className="mt-5 space-y-3">
            {systemStatus.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-white text-slate-600 shadow-xs">
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">{item.name}</h3>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catatan Keamanan */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div className="text-xs text-amber-800">
          <span className="font-semibold">Catatan Keamanan (Tahap UI):</span>
          <p className="mt-0.5 text-amber-700">
            Halaman dashboard saat ini terbuka untuk penyesuaian tata letak UI dan sudah diproteksi dengan header <code className="rounded bg-amber-100/70 px-1 font-mono text-[11px]">noindex</code> agar tidak terindeks search engine.
          </p>
        </div>
      </div>
    </div>
  );
}
