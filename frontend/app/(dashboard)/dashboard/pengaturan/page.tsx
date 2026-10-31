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
import Badge from "@/components/dashboard/Badge";
import Panel, { PanelHeader } from "@/components/dashboard/Panel";
import PageHeader from "@/components/dashboard/PageHeader";

export const metadata: Metadata = {
  title: "Pengaturan",
};

const companyFields = [
  { label: "Nama badan usaha", value: site.legalName, icon: Building2 },
  { label: "Telepon", value: site.phoneDisplay, icon: Phone },
  { label: "Email", value: site.email, icon: Mail },
  { label: "Alamat workshop", value: site.address, icon: MapPin },
];

const integrations = [
  {
    name: "Backend API",
    description: "Go · Gin · GORM",
    status: "Aktif",
    tone: "success" as const,
    icon: Server,
  },
  {
    name: "Database",
    description: "PostgreSQL 16",
    status: "Terhubung",
    tone: "success" as const,
    icon: Database,
  },
  {
    name: "Reverse proxy",
    description: "Caddy · otomatis HTTPS",
    status: "Berjalan",
    tone: "info" as const,
    icon: Globe,
  },
  {
    name: "Autentikasi admin",
    description: "Belum diaktifkan pada fase UI",
    status: "Rencana",
    tone: "pending" as const,
    icon: ShieldCheck,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sistem"
        title="Pengaturan"
        description="Informasi perusahaan, kontak resmi, dan status integrasi layanan dashboard."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel flush className="dash-fade-up dash-d2">
          <PanelHeader
            title="Identitas Perusahaan"
            description="Data ini dipakai pada halaman publik dan dokumen resmi."
          />
          <dl className="divide-y divide-[#0A2540]/6">
            {companyFields.map((field) => (
              <div
                key={field.label}
                className="flex items-start gap-3 px-5 py-3.5"
              >
                <field.icon
                  className="mt-0.5 size-4 shrink-0 text-[#0A2540]/35"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold tracking-[0.12em] text-[#0A2540]/45 uppercase">
                    {field.label}
                  </dt>
                  <dd className="mt-0.5 text-[13px] leading-snug text-[#0A2540]">
                    {field.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel flush className="dash-fade-up dash-d3">
          <PanelHeader
            title="Integrasi Sistem"
            description="Ringkasan status layanan yang menopang dashboard."
          />
          <ul className="divide-y divide-[#0A2540]/6">
            {integrations.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center border border-[#0A2540]/10 bg-[#F4FAFE] text-[#0A2540]/60">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#0A2540]">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#0A2540]/45">
                    {item.description}
                  </p>
                </div>
                <Badge tone={item.tone} dot>
                  {item.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="dash-fade-up dash-d4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-[#A82020]"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-semibold text-[#0A2540]">
              Catatan keamanan
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#0A2540]/55">
              Dashboard saat ini terbuka untuk tahap pengembangan UI dan sudah
              ditandai <code className="bg-[#0A2540]/5 px-1">noindex</code> agar
              tidak diindeks mesin pencari. Sebelum dipublikasikan, aktifkan
              autentikasi admin di backend Go dan lindungi seluruh rute{" "}
              <code className="bg-[#0A2540]/5 px-1">/dashboard</code> dengan
              middleware sesi.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
