"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderKanban,
  Inbox,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchInquiries } from "@/lib/dashboard/api";
import type { Inquiry } from "@/lib/dashboard/types";
import { listOrdersAdmin, type Order } from "@/lib/orders";
import { fetchServiceItems, type ServiceItem } from "@/lib/katalogLayanan";
import {
  fetchLaporanKeuangan,
  type LaporanResponse,
} from "@/lib/laporan";
import { AnimatedBarChart } from "@/components/dashboard/laporan/AnimatedBarChart";
import { StatCard } from "./StatCard";
import { FinanceStrip } from "./FinanceStrip";
import { RecentOrders } from "./RecentOrders";
import { RecentInquiries } from "./RecentInquiries";

export function DashboardOverview() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [report, setReport] = useState<LaporanResponse | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);

    const now = new Date();
    const results = await Promise.allSettled([
      fetchInquiries(100),
      listOrdersAdmin(),
      fetchServiceItems(),
      fetchLaporanKeuangan({
        periode: "bulanan",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        limit: 5,
      }),
    ]);

    const [inquiryResult, orderResult, serviceResult, reportResult] = results;

    if (inquiryResult.status === "fulfilled") {
      setInquiries(inquiryResult.value.data);
      setInquiryTotal(inquiryResult.value.total);
      setOffline(inquiryResult.value.offline);
    }
    if (orderResult.status === "fulfilled") {
      setOrders(orderResult.value);
    }
    if (serviceResult.status === "fulfilled") {
      setServices(serviceResult.value);
    }
    if (reportResult.status === "fulfilled") {
      setReport(reportResult.value);
    }

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAll]);

  const pendingInquiries = useMemo(
    () => inquiries.filter((item) => item.status === "pending").length,
    [inquiries]
  );

  const activeProjects = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "deal" || order.status === "dikerjakan"
      ).length,
    [orders]
  );

  const finishedProjects = useMemo(
    () => orders.filter((order) => order.status === "selesai").length,
    [orders]
  );

  const customerCount = useMemo(() => {
    const unique = new Set<string>();
    for (const order of orders) {
      const key =
        order.customer_phone?.replace(/\D/g, "") ||
        order.customer_name?.trim().toLowerCase();
      if (key) unique.add(key);
    }
    return unique.size;
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const recentInquiries = useMemo(
    () =>
      [...inquiries]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [inquiries]
  );

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dashboard Ringkasan
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Ringkasan operasional dan keuangan CV Win Teknik Mandiri
            {updatedLabel && (
              <span className="text-slate-400"> · Diperbarui {updatedLabel}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {offline && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Mode demo
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadAll()}
            disabled={loading}
            className="h-8 gap-1.5 rounded-lg border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Segarkan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Permohonan Masuk"
          value={pendingInquiries}
          sublabel={`${inquiryTotal} permohonan terdata`}
          href="/dashboard/inquiries"
          icon={Inbox}
          loading={loading}
        />
        <StatCard
          label="Proyek Aktif"
          value={activeProjects}
          sublabel={`${finishedProjects} proyek selesai`}
          href="/dashboard/orders"
          icon={FolderKanban}
          loading={loading}
        />
        <StatCard
          label="Pelanggan"
          value={customerCount}
          sublabel="Dari data pesanan"
          href="/dashboard/orders"
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Layanan Tersedia"
          value={services.length}
          sublabel="Katalog publik"
          href="/dashboard/publik/layanan"
          icon={Wrench}
          loading={loading}
        />
      </div>

      {/* Keuangan Bulan Ini */}
      <FinanceStrip summary={report?.summary} loading={loading} />

      {/* Grafik Arus Kas */}
      {loading && !report ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-60 animate-pulse rounded-lg bg-slate-50" />
        </div>
      ) : report ? (
        <AnimatedBarChart
          data={report.chart}
          title={`Arus Kas · ${report.periode_label}`}
        />
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-10 text-center text-xs text-slate-400 shadow-xs">
          Data keuangan belum tersedia.
        </div>
      )}

      {/* Aktivitas Terbaru */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <RecentOrders items={recentOrders} loading={loading} />
        <RecentInquiries items={recentInquiries} loading={loading} />
      </div>
    </div>
  );
}
