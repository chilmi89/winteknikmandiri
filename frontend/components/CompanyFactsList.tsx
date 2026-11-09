"use client";

import { useEffect, useState } from "react";
import {
  fetchCompanyStats,
  defaultCompanyStats,
  type CompanyStatItem,
} from "@/lib/companyStats";

export default function CompanyFactsList({
  extraFactLabel = "Pengesahan",
  extraFactValue = "Kemenkumham RI 2026",
}: {
  extraFactLabel?: string;
  extraFactValue?: string;
}) {
  const [stats, setStats] = useState<CompanyStatItem[]>(defaultCompanyStats);

  useEffect(() => {
    fetchCompanyStats().then((data) => {
      if (data && data.length > 0) setStats(data);
    });
  }, []);

  return (
    <dl className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#0A2540]/10 pt-5">
      {stats.map((fact) => (
        <div key={fact.id || fact.label} className="flex items-baseline gap-2">
          <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/40 sm:text-[10px]">
            {fact.label}
          </dt>
          <dd className="text-[12px] font-medium text-[#0A2540] sm:text-[13px]">
            {fact.value}
          </dd>
        </div>
      ))}
      {extraFactLabel && extraFactValue && (
        <div className="flex items-baseline gap-2">
          <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#0A2540]/40 sm:text-[10px]">
            {extraFactLabel}
          </dt>
          <dd className="text-[12px] font-medium text-[#0A2540] sm:text-[13px]">
            {extraFactValue}
          </dd>
        </div>
      )}
    </dl>
  );
}
