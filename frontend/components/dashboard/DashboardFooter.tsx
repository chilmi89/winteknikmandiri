import Link from "next/link";
import { site } from "@/lib/site";

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/70 bg-white/50 px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {site.legal.year} {site.legalName}. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Sistem Aktif
          </span>
          <Link
            href="/"
            className="text-slate-500 transition hover:text-[#8A1515]"
          >
            Lihat Website
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;
