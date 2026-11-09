"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  fetchCompanyStats,
  defaultCompanyStats,
  type CompanyStatItem,
} from "@/lib/companyStats";

export default function CompanyStatsCards({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<CompanyStatItem[]>(defaultCompanyStats);

  useEffect(() => {
    fetchCompanyStats().then((data) => {
      if (data && data.length > 0) setStats(data);
    });
  }, []);

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {stats.map((stat, index) => (
        <ScrollReveal
          key={stat.id || stat.label}
          delay={index * 100}
          direction="up"
          className="h-full"
        >
          <div className="group relative flex h-full flex-col justify-between overflow-hidden border border-[#0A2540]/10 bg-white p-7 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.35),0_0_0_1px_rgba(168,32,32,0.25)]">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <span
              aria-hidden="true"
              className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#0A2540]/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/70 transition-colors group-hover:bg-[#A82020] group-hover:text-white">
                  Pencapaian
                </span>
              </div>

              <p className="mt-4 text-4xl font-bold tracking-tight text-[#0A2540] tabular-nums transition-colors duration-300 group-hover:text-[#A82020] sm:text-5xl">
                <span>{stat.value.replace("+", "")}</span>
                {stat.has_plus && <span className="text-[#A82020] ml-0.5">+</span>}
              </p>

              <h3 className="mt-2 text-base font-semibold text-[#0A2540]">
                {stat.label}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[#0A2540]/65">
                {stat.keterangan ||
                  "Dedikasi pengerjaan profesional CV Win Teknik Mandiri di lapangan."}
              </p>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
