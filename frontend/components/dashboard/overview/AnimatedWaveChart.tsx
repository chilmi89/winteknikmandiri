"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import type { ChartBarPoint } from "@/lib/laporan";

type AnimatedWaveChartProps = {
  data: ChartBarPoint[];
  title?: string;
};

// Algoritma kurva spline kubik (Cubic Bezier) untuk menghasilkan gelombang halus
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

  // Nilai maksimum untuk skala tinggi grafik
  const maxVal = useMemo(() => {
    let max = 100000;
    for (const d of data) {
      if (d.pemasukan > max) max = d.pemasukan;
      if (d.pengeluaran > max) max = d.pengeluaran;
    }
    return Math.ceil(max * 1.15); // Beri ruang 15% di bagian atas kurva
  }, [data]);

  // Format label sumbu Y (Rupiah ringkas)
  const formatAxis = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `${Math.round(val / 1000000)} Jt`;
    if (val >= 1000) return `${Math.round(val / 1000)} Rb`;
    return String(Math.round(val));
  };

  const svgWidth = 800;
  const svgHeight = 240;
  const paddingLeft = 48;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 32;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + chartHeight;

  // Koordinat titik untuk setiap data point
  const { pointsIncome, pointsExpense, columnWidth } = useMemo(() => {
    const n = Math.max(1, data.length);
    const colWidth = chartWidth / Math.max(1, n - 1 || 1);

    const pIn = data.map((d, i) => {
      const x = n === 1 ? paddingLeft + chartWidth / 2 : paddingLeft + i * colWidth;
      const pct = maxVal > 0 ? d.pemasukan / maxVal : 0;
      const y = baselineY - pct * chartHeight;
      return { x, y, data: d };
    });

    const pOut = data.map((d, i) => {
      const x = n === 1 ? paddingLeft + chartWidth / 2 : paddingLeft + i * colWidth;
      const pct = maxVal > 0 ? d.pengeluaran / maxVal : 0;
      const y = baselineY - pct * chartHeight;
      return { x, y, data: d };
    });

    return { pointsIncome: pIn, pointsExpense: pOut, columnWidth: colWidth };
  }, [data, chartWidth, chartHeight, baselineY, maxVal]);

  // Path SVG Gelombang Pemasukan
  const pathIncome = useMemo(() => generateSmoothPath(pointsIncome), [pointsIncome]);
  const areaIncome = useMemo(() => {
    if (pointsIncome.length === 0) return "";
    const first = pointsIncome[0];
    const last = pointsIncome[pointsIncome.length - 1];
    return `${pathIncome} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pathIncome, pointsIncome, baselineY]);

  // Path SVG Gelombang Pengeluaran
  const pathExpense = useMemo(() => generateSmoothPath(pointsExpense), [pointsExpense]);
  const areaExpense = useMemo(() => {
    if (pointsExpense.length === 0) return "";
    const first = pointsExpense[0];
    const last = pointsExpense[pointsExpense.length - 1];
    return `${pathExpense} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pathExpense, pointsExpense, baselineY]);

  const gridSteps = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  // Titik aktif terbaru (ujung gelombang)
  const latestIncomePoint = pointsIncome[pointsIncome.length - 1];
  const latestExpensePoint = pointsExpense[pointsExpense.length - 1];

  const activeHoverItem = hoveredIdx !== null ? data[hoveredIdx] : null;
  const activeHoverPointIn = hoveredIdx !== null ? pointsIncome[hoveredIdx] : null;
  const activeHoverPointOut = hoveredIdx !== null ? pointsExpense[hoveredIdx] : null;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      {/* Header Grafik Wave */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
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
          {/* Indikator Live Pulse */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>Live Wave</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
            <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
            <span>Pemasukan</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
            <span className="size-2 rounded-full bg-rose-500 shadow-xs" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Area Kanvas Gelombang Interaktif */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Gradien Area Pemasukan (Emerald ke Teal) */}
            <linearGradient id="waveIncomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.01" />
            </linearGradient>

            {/* Gradien Area Pengeluaran (Rose ke Pink) */}
            <linearGradient id="waveExpenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#E11D48" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#BE123C" stopOpacity="0.0" />
            </linearGradient>

            {/* Glow Filter untuk Garis Gelombang */}
            <filter id="glowIncome" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.4" />
            </filter>
            <filter id="glowExpense" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#F43F5E" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Garis Grid Horisontal */}
          {gridSteps.map((step, idx) => {
            const y = paddingTop + (idx / (gridSteps.length - 1)) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {formatAxis(step)}
                </text>
              </g>
            );
          })}

          {/* Area Gelombang Pemasukan (Gradient Fill) */}
          {areaIncome && (
            <path
              d={areaIncome}
              fill="url(#waveIncomeGradient)"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Area Gelombang Pengeluaran (Gradient Fill) */}
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
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowIncome)"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Sinyal Radar / Live Ping Dot pada Titik Ujung Pemasukan */}
          {latestIncomePoint && (
            <g transform={`translate(${latestIncomePoint.x}, ${latestIncomePoint.y})`}>
              <circle r="7" fill="#10B981" opacity="0.3" className="animate-ping" />
              <circle r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          )}

          {/* Sinyal Radar pada Titik Ujung Pengeluaran */}
          {latestExpensePoint && (
            <g transform={`translate(${latestExpensePoint.x}, ${latestExpensePoint.y})`}>
              <circle r="3.5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          )}

          {/* Label Sumbu X (Waktu/Minggu) */}
          {pointsIncome.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={baselineY + 20}
              textAnchor="middle"
              fill={hoveredIdx === idx ? "#0F172A" : "#64748B"}
              fontWeight={hoveredIdx === idx ? "600" : "500"}
              fontSize="11"
            >
              {p.data.label}
            </text>
          ))}

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
                opacity="0.4"
              />

              {/* Titik Sorot Pemasukan */}
              <circle
                cx={activeHoverPointIn.x}
                cy={activeHoverPointIn.y}
                r="6"
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
                  r="5"
                  fill="#F43F5E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-md"
                />
              )}
            </g>
          )}

          {/* Zone Interaktif Hover per Kolom */}
          {pointsIncome.map((p, idx) => {
            const xStart = p.x - columnWidth / 2;
            const width = columnWidth;
            return (
              <rect
                key={idx}
                x={Math.max(paddingLeft, xStart)}
                y={paddingTop}
                width={width}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
              />
            );
          })}
        </svg>

        {/* Floating Executive Tooltip */}
        {hoveredIdx !== null && activeHoverItem && activeHoverPointIn && (
          <div
            className="pointer-events-none absolute z-30 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(
                Math.max(activeHoverPointIn.x * (100 / svgWidth), 18),
                82
              )}%`,
              top: `${Math.max(activeHoverPointIn.y * (100 / svgHeight) - 35, 10)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="min-w-[190px] space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
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
            <div className="mx-auto h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
          </div>
        )}
      </div>
    </div>
  );
}
