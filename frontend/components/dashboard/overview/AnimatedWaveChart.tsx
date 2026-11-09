"use client";

import { useMemo, useRef, useState } from "react";
import { Activity } from "lucide-react";
import type { ChartBarPoint } from "@/lib/laporan";

type AnimatedWaveChartProps = {
  data: ChartBarPoint[];
  title?: string;
};

// Algoritma kurva spline kubik (Cubic Bezier) edge-to-edge
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;

    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function AnimatedWaveChart({
  data,
  title = "Arus Kas (Wave Tren)",
}: AnimatedWaveChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const waveAreaRef = useRef<HTMLDivElement>(null);

  // Nilai maksimum untuk skala tinggi grafik
  const maxVal = useMemo(() => {
    let max = 100000;
    for (const d of data) {
      if (d.pemasukan > max) max = d.pemasukan;
      if (d.pengeluaran > max) max = d.pengeluaran;
    }
    return Math.ceil(max * 1.15); // Ruang 15% di atas puncak kurva
  }, [data]);

  // Format label sumbu Y (Rupiah ringkas)
  const formatAxis = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `${Math.round(val / 1000000)} Jt`;
    if (val >= 1000) return `${Math.round(val / 1000)} Rb`;
    return String(Math.round(val));
  };

  const svgWidth = 1000;
  const svgHeight = 220;
  const paddingTop = 16;
  const paddingBottom = 16;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + chartHeight;

  // Koordinat Edge-to-Edge: Titik pertama di x = 0, titik terakhir di x = 1000
  const { pointsIncome, pointsExpense } = useMemo(() => {
    const n = data.length;
    if (n === 0) return { pointsIncome: [], pointsExpense: [] };

    const pIn = data.map((d, i) => {
      const x = n <= 1 ? svgWidth / 2 : (i / (n - 1)) * svgWidth;
      const pct = maxVal > 0 ? d.pemasukan / maxVal : 0;
      const y = baselineY - pct * chartHeight;
      return { x, y, data: d };
    });

    const pOut = data.map((d, i) => {
      const x = n <= 1 ? svgWidth / 2 : (i / (n - 1)) * svgWidth;
      const pct = maxVal > 0 ? d.pengeluaran / maxVal : 0;
      const y = baselineY - pct * chartHeight;
      return { x, y, data: d };
    });

    return { pointsIncome: pIn, pointsExpense: pOut };
  }, [data, svgWidth, chartHeight, baselineY, maxVal]);

  // Path Gelombang Pemasukan (Full edge-to-edge)
  const pathIncome = useMemo(() => generateSmoothPath(pointsIncome), [pointsIncome]);
  const areaIncome = useMemo(() => {
    if (pointsIncome.length === 0) return "";
    const first = pointsIncome[0];
    const last = pointsIncome[pointsIncome.length - 1];
    return `${pathIncome} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pathIncome, pointsIncome, baselineY]);

  // Path Gelombang Pengeluaran (Full edge-to-edge)
  const pathExpense = useMemo(() => generateSmoothPath(pointsExpense), [pointsExpense]);
  const areaExpense = useMemo(() => {
    if (pointsExpense.length === 0) return "";
    const first = pointsExpense[0];
    const last = pointsExpense[pointsExpense.length - 1];
    return `${pathExpense} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pathExpense, pointsExpense, baselineY]);

  const gridSteps = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  // Titik aktif terbaru (ujung gelombang paling kanan)
  const latestIncomePoint = pointsIncome[pointsIncome.length - 1];
  const latestExpensePoint = pointsExpense[pointsExpense.length - 1];

  const activeHoverItem = hoveredIdx !== null ? data[hoveredIdx] : null;
  const activeHoverPointIn = hoveredIdx !== null ? pointsIncome[hoveredIdx] : null;
  const activeHoverPointOut = hoveredIdx !== null ? pointsExpense[hoveredIdx] : null;

  // Deteksi apakah titik hover berada di puncak atas grafik (untuk auto-flip tooltip)
  const isNearTop = activeHoverPointIn ? activeHoverPointIn.y < svgHeight * 0.46 : false;

  // Interaksi mouse move untuk menghitung index terdekat secara presisi pada kanvas gelombang
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveAreaRef.current || data.length === 0) return;
    const rect = waveAreaRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = relX / rect.width;
    const idx = Math.round(pct * (data.length - 1));
    setHoveredIdx(idx);
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      {/* Header Grafik Wave */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <Activity className="size-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-400">
              Tren gelombang kas masuk & kas keluar
            </p>
          </div>
        </div>

        {/* Legend & Indikator Aktif */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>Live Wave</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
            <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
            <span>Pemasukan</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
            <span className="size-2 rounded-full bg-rose-500 shadow-xs" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Kontainer Utama Grafik: Sumbu Y di kolom terpisah, Gelombang di kanvas penuh */}
      <div className="relative pt-2">
        <div className="flex items-stretch gap-2.5 sm:gap-3.5">
          {/* Kolom Khusus Sumbu Y (Beri space lega, bebas tumpukan) */}
          <div className="w-14 sm:w-16 shrink-0 flex flex-col justify-between text-right font-mono text-[10.5px] text-slate-400 select-none pb-5 pt-3 pr-1">
            {gridSteps.map((step, idx) => (
              <span key={idx} className="tabular-nums leading-none">
                {formatAxis(step)}
              </span>
            ))}
          </div>

          {/* Kanvas Gelombang Full Width Edge-to-Edge */}
          <div
            ref={waveAreaRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIdx(null)}
            className="flex-1 relative cursor-crosshair pb-5 pt-3"
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="w-full h-56 overflow-visible"
            >
              <defs>
                {/* Gradien Area Pemasukan (Emerald ke Teal) */}
                <linearGradient id="waveIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradien Area Pengeluaran (Rose ke Pink) */}
                <linearGradient id="waveExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.32" />
                  <stop offset="50%" stopColor="#E11D48" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#BE123C" stopOpacity="0.0" />
                </linearGradient>

                {/* Glow Filter untuk Garis Gelombang */}
                <filter id="glowIncome" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.4" />
                </filter>
                <filter id="glowExpense" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#F43F5E" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Garis Grid Horisontal Merentang Penuh */}
              {gridSteps.map((_, idx) => {
                const y = paddingTop + (idx / (gridSteps.length - 1)) * chartHeight;
                return (
                  <line
                    key={idx}
                    x1={0}
                    y1={y}
                    x2={svgWidth}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Gelombang Pemasukan (Full Width Fill) */}
              {areaIncome && (
                <path
                  d={areaIncome}
                  fill="url(#waveIncomeGradient)"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Area Gelombang Pengeluaran (Full Width Fill) */}
              {areaExpense && (
                <path
                  d={areaExpense}
                  fill="url(#waveExpenseGradient)"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Garis Gelombang Pengeluaran (Stroke Kurva Halus) */}
              {pathExpense && (
                <path
                  d={pathExpense}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowExpense)"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Garis Gelombang Pemasukan (Stroke Kurva Halus Utama) */}
              {pathIncome && (
                <path
                  d={pathIncome}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowIncome)"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Sinyal Radar / Live Ping Dot pada Ujung Pemasukan */}
              {latestIncomePoint && (
                <g transform={`translate(${latestIncomePoint.x}, ${latestIncomePoint.y})`}>
                  <circle r="8" fill="#10B981" opacity="0.35" className="animate-ping" />
                  <circle r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                </g>
              )}

              {/* Sinyal Ujung Pengeluaran */}
              {latestExpensePoint && (
                <g transform={`translate(${latestExpensePoint.x}, ${latestExpensePoint.y})`}>
                  <circle r="4" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
                </g>
              )}

              {/* Garis Crosshair Interaktif Saat Hover */}
              {hoveredIdx !== null && activeHoverPointIn && (
                <g>
                  <line
                    x1={activeHoverPointIn.x}
                    y1={paddingTop}
                    x2={activeHoverPointIn.x}
                    y2={baselineY}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.45"
                  />

                  {/* Titik Sorot Pemasukan */}
                  <circle
                    cx={activeHoverPointIn.x}
                    cy={activeHoverPointIn.y}
                    r="6.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className="shadow-md"
                  />

                  {/* Titik Sorot Pengeluaran */}
                  {activeHoverPointOut && (
                    <circle
                      cx={activeHoverPointOut.x}
                      cy={activeHoverPointOut.y}
                      r="5.5"
                      fill="#F43F5E"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="shadow-md"
                    />
                  )}
                </g>
              )}
            </svg>

            {/* Smart Auto-Flip Tooltip (Anti-Tertutup/Terpotong) */}
            {hoveredIdx !== null && activeHoverItem && activeHoverPointIn && (
              <div
                className="pointer-events-none absolute z-40 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  left: `${Math.min(
                    Math.max((activeHoverPointIn.x / svgWidth) * 100, 14),
                    86
                  )}%`,
                  top: `${(activeHoverPointIn.y / svgHeight) * 100}%`,
                  transform: isNearTop
                    ? "translate(-50%, 18px)"
                    : "translate(-50%, -100%) translateY(-18px)",
                }}
              >
                {/* Panah Atas jika Tooltip Muncul di Bawah Titik Puncak */}
                {isNearTop && (
                  <div className="mx-auto -mb-1 h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900" />
                )}

                {/* Kotak Informasi Nominal */}
                <div className="min-w-[195px] space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/98 p-3 text-xs text-white shadow-2xl backdrop-blur-md">
                  <p className="border-b border-slate-700/80 pb-1 font-semibold text-slate-200">
                    {activeHoverItem.label}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Pemasukan
                    </span>
                    <span className="font-semibold tabular-nums text-white">
                      {activeHoverItem.pemasukan_str}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <span className="size-1.5 rounded-full bg-rose-400" />
                      Pengeluaran
                    </span>
                    <span className="font-semibold tabular-nums text-white">
                      {activeHoverItem.pengeluaran_str}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-700/80 pt-1.5">
                    <span className="text-slate-400">Saldo Periode</span>
                    <span
                      className={`font-bold tabular-nums ${
                        activeHoverItem.saldo >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {activeHoverItem.saldo_str}
                    </span>
                  </div>
                </div>

                {/* Panah Bawah jika Tooltip Muncul di Atas Titik Lembah */}
                {!isNearTop && (
                  <div className="mx-auto -mt-0.5 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Label Sumbu X (Sinkron Presisi 100% Tepat di Bawah Titik Gelombang) */}
        <div className="ml-14 sm:ml-16 relative h-6 border-t border-slate-100 pt-1.5 select-none">
          {data.map((d, idx) => {
            const n = data.length;
            const pct = n <= 1 ? 50 : (idx / (n - 1)) * 100;
            const isHovered = hoveredIdx === idx;

            // Penyesuaian anchor agar tidak keluar kanvas di ujung kiri dan kanan
            let translateClass = "-translate-x-1/2 text-center";
            if (idx === 0) translateClass = "translate-x-0 text-left";
            if (idx === n - 1) translateClass = "-translate-x-full text-right";

            return (
              <span
                key={idx}
                style={{ left: `${pct}%` }}
                className={`absolute top-1.5 whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer ${translateClass} ${
                  isHovered
                    ? "font-bold text-slate-950"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {d.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
