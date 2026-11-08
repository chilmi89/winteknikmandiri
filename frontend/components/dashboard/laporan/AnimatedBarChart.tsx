"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import type { ChartBarPoint } from "@/lib/laporan";

type AnimatedBarChartProps = {
  data: ChartBarPoint[];
  title?: string;
  subtitle?: string;
};

export function AnimatedBarChart({
  data,
  title = "Tren Arus Kas (Pemasukan vs Pengeluaran)",
  subtitle,
}: AnimatedBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Cari nilai maksimum untuk skala tinggi grafik
  const maxVal = useMemo(() => {
    let max = 100000;
    for (const d of data) {
      if (d.pemasukan > max) max = d.pemasukan;
      if (d.pengeluaran > max) max = d.pengeluaran;
    }
    return max;
  }, [data]);

  // Format label skala sumbu Y (Rupiah Ringkas)
  const formatAxis = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `${Math.round(val / 1000000)} Jt`;
    if (val >= 1000) return `${Math.round(val / 1000)} Rb`;
    return String(val);
  };

  const gridSteps = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      {/* Header Grafik */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wide uppercase text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="size-4 text-[#2279cf]" />
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-emerald-500 shadow-2xs" />
            <span className="text-slate-700">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-rose-500 shadow-2xs" />
            <span className="text-slate-700">Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2">
        {/* Garis Horizontal Grid */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none">
          {gridSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 border-b border-dashed border-slate-200/80 w-full">
              <span className="text-[10px] font-mono font-semibold text-slate-400 w-12 text-right shrink-0">
                {formatAxis(step)}
              </span>
              <div className="flex-1" />
            </div>
          ))}
        </div>

        {/* Bar Columns Container */}
        <div className="pl-14 pr-2 h-64 flex items-end justify-between gap-2 sm:gap-4 relative z-10">
          {data.map((item, idx) => {
            const inPct = maxVal > 0 ? (item.pemasukan / maxVal) * 100 : 0;
            const outPct = maxVal > 0 ? (item.pengeluaran / maxVal) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer transition-all rounded-xl p-1 ${
                  isHovered ? "bg-slate-100/70" : "hover:bg-slate-50/50"
                }`}
              >
                {/* Floating Tooltip Melayang saat Hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 z-30 pointer-events-none animate-in fade-in-0 zoom-in-95">
                    <div className="rounded-xl border border-slate-800 bg-[#060b1c] p-3 text-white shadow-xl min-w-[200px] text-xs space-y-1.5">
                      <p className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                        {item.label}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ArrowDownRight className="size-3" /> Pemasukan:
                        </span>
                        <span className="font-bold text-white">{item.pemasukan_str}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <ArrowUpRight className="size-3" /> Pengeluaran:
                        </span>
                        <span className="font-bold text-white">{item.pengeluaran_str}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-1 font-bold">
                        <span className="text-slate-400">Saldo:</span>
                        <span className={item.saldo >= 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                          {item.saldo_str}
                        </span>
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#060b1c] mx-auto" />
                  </div>
                )}

                {/* Dua Batang Berdampingan (Dual Bars) */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-1">
                  {/* Batang Pemasukan (Emerald Gradient) */}
                  <div className="w-1/2 max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: item.pemasukan > 0 ? `${Math.max(inPct, 6)}%` : "0%" }}
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-700 ease-out shadow-xs group-hover:brightness-110"
                    />
                  </div>

                  {/* Batang Pengeluaran (Rose Gradient) */}
                  <div className="w-1/2 max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: item.pengeluaran > 0 ? `${Math.max(outPct, 6)}%` : "0%" }}
                      className="w-full rounded-t-md bg-gradient-to-t from-rose-600 to-pink-500 transition-all duration-700 ease-out shadow-xs group-hover:brightness-110"
                    />
                  </div>
                </div>

                {/* Label Sumbu X */}
                <div className="mt-2 text-[10px] sm:text-xs font-bold text-slate-600 truncate max-w-full text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
