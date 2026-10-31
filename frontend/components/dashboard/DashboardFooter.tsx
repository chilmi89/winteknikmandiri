import Link from "next/link";
import { site } from "@/lib/site";

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-[#0A2540]/10 bg-white/60 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 text-[11px] text-[#0A2540]/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {site.legal.year} {site.legalName}. Seluruh hak cipta dilindungi.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[#0F7B5F]"
            />
            Sistem operasional
          </span>
          <span aria-hidden="true" className="text-[#0A2540]/20">
            |
          </span>
          <span>v1.0.0</span>
          <span aria-hidden="true" className="text-[#0A2540]/20">
            |
          </span>
          <Link
            href="/"
            className="transition-colors hover:text-[#A82020]"
          >
            Lihat situs publik
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;
