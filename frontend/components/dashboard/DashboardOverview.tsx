"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  Plus,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchInquiries } from "@/lib/dashboard/api";
import { formatDateTime, initials, waChatLink } from "@/lib/dashboard/format";
import type { Inquiry } from "@/lib/dashboard/types";
import { Badge, statusLabel, statusTone } from "./Badge";
import { buttonClass } from "./Button";
import EmptyState from "./EmptyState";
import Panel, { PanelHeader } from "./Panel";
import PageHeader from "./PageHeader";
import StatCard from "./StatCard";

const quickActions = [
  {
    label: "Lihat semua permohonan",
    description: "Tindak lanjuti permintaan konsultasi pelanggan.",
    href: "/dashboard/inquiries",
  },
  {
    label: "Kelola proyek",
    description: "Pantau progres pekerjaan yang sedang berjalan.",
    href: "/dashboard/proyek",
  },
  {
    label: "Perbarui galeri",
    description: "Tambah dokumentasi proyek terbaru.",
    href: "/dashboard/galeri",
  },
];

export function DashboardOverview() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  async function load() {
    setLoading(true);
    const result = await fetchInquiries();
    setRows(result.data);
    setOffline(result.offline);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    void fetchInquiries().then((result) => {
      if (!active) return;
      setRows(result.data);
      setOffline(result.offline);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter(
      (row) => row.status.toLowerCase() === "pending"
    ).length;
    const progress = rows.filter((row) =>
      ["diproses", "proses"].includes(row.status.toLowerCase())
    ).length;
    const done = rows.filter(
      (row) => row.status.toLowerCase() === "selesai"
    ).length;

    return { total, pending, progress, done };
  }, [rows]);

  const recent = useMemo(
    () =>
      [...rows]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [rows]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard Operasional"
        description="Pantau permohonan masuk, progres pekerjaan, dan aktivitas terbaru CV Win Teknik Mandiri."
        actions={
          <>
            <button
              type="button"
              onClick={() => void load()}
              className={buttonClass({ variant: "secondary", size: "md" })}
            >
              <RefreshCw
                className={cn("size-4", loading && "animate-spin")}
                aria-hidden="true"
              />
              Muat ulang
            </button>
            <Link
              href="/dashboard/inquiries"
              className={buttonClass({ variant: "primary", size: "md" })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Permohonan
            </Link>
          </>
        }
      />

      {offline ? (
        <div className="dash-fade flex items-start gap-2.5 border border-[#B7791F]/25 bg-[#B7791F]/8 px-4 py-3 text-xs text-[#8A5A12]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            API backend belum terhubung — menampilkan data contoh agar tampilan
            tetap bisa dievaluasi. Jalankan{" "}
            <code className="bg-white/60 px-1">docker compose up -d</code> untuk
            data asli.
          </p>
        </div>
      ) : null}

      {/* ================= Stat cards ================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Permohonan"
          value={loading ? "—" : stats.total}
          hint="sepanjang periode"
          icon={<Inbox className="size-4" aria-hidden="true" />}
          tone="navy"
          delay={1}
          progress={stats.total ? 1 : 0}
        />
        <StatCard
          label="Perlu Tindakan"
          value={loading ? "—" : stats.pending}
          hint="status pending"
          icon={<Clock3 className="size-4" aria-hidden="true" />}
          tone="red"
          delay={2}
          progress={stats.total ? stats.pending / stats.total : 0}
        />
        <StatCard
          label="Sedang Diproses"
          value={loading ? "—" : stats.progress}
          hint="dikerjakan teknisi"
          icon={<Loader2 className="size-4" aria-hidden="true" />}
          tone="ice"
          delay={3}
          progress={stats.total ? stats.progress / stats.total : 0}
        />
        <StatCard
          label="Selesai"
          value={loading ? "—" : stats.done}
          hint="pekerjaan tuntas"
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          tone="green"
          delay={4}
          progress={stats.total ? stats.done / stats.total : 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ================= Recent ================= */}
        <Panel flush className="dash-fade-up dash-d2 xl:col-span-2">
          <PanelHeader
            title="Permohonan Terbaru"
            description="5 permintaan konsultasi terakhir dari website."
            action={
              <Link
                href="/dashboard/inquiries"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#A82020] hover:underline"
              >
                Lihat semua
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />

          {loading ? (
            <div className="divide-y divide-[#0A2540]/6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="dash-skeleton size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="dash-skeleton h-3 w-1/3" />
                    <div className="dash-skeleton h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              title="Belum ada permohonan"
              description="Permohonan dari formulir website akan tampil di sini."
            />
          ) : (
            <ul className="divide-y divide-[#0A2540]/6">
              {recent.map((row) => (
                <li key={row.id}>
                  <Link
                    href="/dashboard/inquiries"
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F4FAFE]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center bg-[#0A2540]/6 text-[11px] font-bold text-[#0A2540]">
                      {initials(row.name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0A2540]">
                        {row.name}
                      </p>
                      <p className="truncate text-xs text-[#0A2540]/50">
                        {row.service} · {formatDateTime(row.created_at)}
                      </p>
                    </div>

                    <Badge tone={statusTone(row.status)} dot>
                      {statusLabel(row.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* ================= Quick actions ================= */}
        <Panel flush className="dash-fade-up dash-d3">
          <PanelHeader
            title="Aksi Cepat"
            description="Pintasan pekerjaan harian admin."
          />
          <ul className="divide-y divide-[#0A2540]/6">
            {quickActions.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[#F4FAFE]"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-[#0A2540]/10 bg-white text-[#A82020] transition-transform duration-300 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#0A2540] group-hover:text-[#A82020]">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[#0A2540]/50">
                      {action.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {!loading && recent[0] ? (
            <div className="border-t border-[#0A2540]/10 p-4">
              <a
                href={waChatLink(
                  recent[0].phone,
                  `Halo ${recent[0].name}, terima kasih telah menghubungi CV Win Teknik Mandiri.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass({
                  variant: "secondary",
                  size: "md",
                  className: "w-full",
                })}
              >
                Balas permohonan terbaru
              </a>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

export default DashboardOverview;
