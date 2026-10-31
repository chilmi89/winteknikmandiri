import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "./Button";
import Panel from "./Panel";
import PageHeader from "./PageHeader";

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  moduleName: string;
  icon: ReactNode;
  features: string[];
};

/**
 * Halaman modul yang belum punya backend. Struktur, header, dan panel
 * sudah final sehingga tinggal mengganti isi `Panel` dengan tabel asli.
 */
export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  moduleName,
  icon,
  features,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Link
            href="/dashboard/inquiries"
            className={buttonClass({ variant: "secondary", size: "md" })}
          >
            Buka permohonan
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="dash-fade-up dash-d2 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel flush className="lg:col-span-2">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-14 items-center justify-center border border-[#0A2540]/10 bg-[#F4FAFE] text-[#A82020]">
              {icon}
            </span>
            <h2 className="text-sm font-semibold text-[#0A2540]">
              Modul {moduleName} siap dikembangkan
            </h2>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#0A2540]/50">
              Kerangka halaman, navigasi, dan komponen tabel sudah terpasang.
              Hubungkan ke endpoint backend untuk mengaktifkan pengelolaan data.
            </p>
          </div>
        </Panel>

        <Panel className="dash-fade-up dash-d3">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#0A2540]/50 uppercase">
            Rencana fitur
          </h2>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-[13px] leading-snug text-[#0A2540]/75"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 bg-[#8ACFF8]"
                />
                {feature}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export default ModulePlaceholder;
