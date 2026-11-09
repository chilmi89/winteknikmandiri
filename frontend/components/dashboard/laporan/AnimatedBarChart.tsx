"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import type { ChartBarPoint } from "@/lib/laporan";

type AnimatedBarChartProps = {
  data: ChartBarPoint[];
  title?: string;
};

export function AnimatedBarChart({
  data,
  title = "Arus Kas",
}: AnimatedBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = useMemo(() => {
    let max = 100000;
    for (const d of data) {
      if (d.pemasukan > max) max = d.pemasukan;
      if (d.pengeluaran > max) max = d.pengeluaran;
    }
    return max;
  }, [data]);

  const formatAxis = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `${Math.round(val / 1000000)} Jt`;
    if (val >= 1000) return `${Math.round(val / 1000)} Rb`;
    return String(val);
  };

  const gridSteps = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      {/* Header Grafik */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <TrendingUp className="size-4 text-slate-500" />
          {title}
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-1">
        {/* Grid Lines */}
        <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
          {gridSteps.map((step, idx) => (
            <div key={idx} className="flex w-full items-center gap-2 border-b border-dashed border-slate-200/70">
              <span className="w-12 shrink-0 text-right font-mono text-[10px] text-slate-400">
                {formatAxis(step)}
              </span>
              <div className="flex-1" />
            </div>
          ))}
        </div>

        {/* Bar Columns */}
        <div className="relative z-10 flex h-60 items-end justify-between gap-2 pl-14 pr-2 sm:gap-4">
          {data.map((item, idx) => {
            const inPct = maxVal > 0 ? (item.pemasukan / maxVal) * 100 : 0;
            const outPct = maxVal > 0 ? (item.pengeluaran / maxVal) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end rounded-lg p-1 transition-colors ${
                  isHovered ? "bg-slate-100/70" : "hover:bg-slate-50"
                }`}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="pointer-events-none absolute bottom-full z-30 mb-3 animate-in fade-in-0 zoom-in-95">
                    <div className="min-w-[180px] space-y-1.5 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white shadow-xl">
                      <p className="border-b border-slate-700 pb-1 font-semibold text-slate-300">
                        {item.label}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-emerald-400">Pemasukan</span>
                        <span className="font-semibold tabular-nums text-white">{item.pemasukan_str}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-rose-400">Pengeluaran</span>
                        <span className="font-semibold tabular-nums text-white">{item.pengeluaran_str}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-700/80 pt-1">
                        <span className="text-slate-400">Saldo</span>
                        <span
                          className={`font-semibold tabular-nums ${
                            item.saldo >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {item.saldo_str}
                        </span>
                      </div>
                    </div>
                    <div className="mx-auto h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                  </div>
                )}

                {/* Dual Bars */}
                <div className="flex h-full w-full items-end justify-center gap-1 pb-1 sm:gap-2">
                  <div className="flex h-full w-1/2 max-w-[26px] items-end">
                    <div
                      style={{ height: item.pemasukan > 0 ? `${Math.max(inPct, 6)}%` : "0%" }}
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-700 ease-out group-hover:brightness-110"
                    />
                  </div>
                  <div className="flex h-full w-1/2 max-w-[26px] items-end">
                    <div
                      style={{ height: item.pengeluaran > 0 ? `${Math.max(outPct, 6)}%` : "0%" }}
                      className="w-full rounded-t-md bg-gradient-to-t from-rose-600 to-pink-500 transition-all duration-700 ease-out group-hover:brightness-110"
                    />
                  </div>
                </div>

                {/* X Axis Label */}
                <div className="mt-2 max-w-full truncate text-center text-[10px] font-medium text-slate-500 sm:text-xs">
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
