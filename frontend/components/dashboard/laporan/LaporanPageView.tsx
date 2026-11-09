"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Percent,
  Printer,
  Download,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import { formatDateTime } from "@/lib/dashboard/format";
import {
  fetchLaporanKeuangan,
  exportLaporanToExcel,
  type LaporanResponse,
} from "@/lib/laporan";
import { listOrdersAdmin, type Order } from "@/lib/orders";
import { AnimatedBarChart } from "./AnimatedBarChart";
import { LaporanNavigation } from "./LaporanNavigation";
import { LaporanPdfModal } from "./LaporanPdfModal";

type LaporanPageViewProps = {
  periode: "harian" | "mingguan" | "bulanan" | "tahunan";
  pageTitle: string;
  pageSubtitle: string;
};

export function LaporanPageView({
  periode,
  pageTitle,
  pageSubtitle,
}: LaporanPageViewProps) {
  const [data, setData] = useState<LaporanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [tanggalHarian, setTanggalHarian] = useState("2026-11-09");
  const [startDateMingguan, setStartDateMingguan] = useState("2026-11-09");
  const [endDateMingguan, setEndDateMingguan] = useState("2026-11-15");
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);

  const [selectedOrderId, setSelectedOrderId] = useState("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // Inisialisasi tanggal client-side agar aman dari prerender SSR Next.js 16
  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setTanggalHarian(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);

    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    setStartDateMingguan(`${mon.getFullYear()}-${pad(mon.getMonth() + 1)}-${pad(mon.getDate())}`);

    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    setEndDateMingguan(`${sun.getFullYear()}-${pad(sun.getMonth() + 1)}-${pad(sun.getDate())}`);

    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }, []);

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Projects list for dropdown
  const [orders, setOrders] = useState<Order[]>([]);

  // Print PDF Modal
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Selection Checkbox State (Custom Export Single/Multi Data)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Load orders for filter (hanya proyek yang berstatus selesai/closing)
  useEffect(() => {
    listOrdersAdmin("", "", "").then((list) => {
      setOrders(list.filter((o) => o.status === "selesai"));
    });
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentItemIds = (data?.items || []).map((it) => it.id);
    if (currentItemIds.every((id) => selectedRowIds.includes(id))) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(Array.from(new Set([...selectedRowIds, ...currentItemIds])));
    }
  };

  // Fetch Report Data
  const loadReport = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetchLaporanKeuangan({
          periode,
          tanggal: periode === "harian" ? tanggalHarian : undefined,
          start_date: periode === "mingguan" ? startDateMingguan : undefined,
          end_date: periode === "mingguan" ? endDateMingguan : undefined,
          month: periode === "bulanan" ? selectedMonth : undefined,
          year: periode === "bulanan" || periode === "tahunan" ? selectedYear : undefined,
          order_id: selectedOrderId !== "all" ? selectedOrderId : undefined,
          sort_dir: sortDir,
          page,
          limit: pageSize,
        });
        setData(res);
      } catch (err) {
        toast.add({
          title: "Gagal memuat laporan",
          description: err instanceof Error ? err.message : "",
          type: "error",
        });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      periode,
      tanggalHarian,
      startDateMingguan,
      endDateMingguan,
      selectedMonth,
      selectedYear,
      selectedOrderId,
      sortDir,
      page,
      pageSize,
    ]
  );

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportExcel = () => {
    if (!data) return;
    const allItems = data.items;
    const targetItems = selectedRowIds.length > 0 ? allItems.filter((it) => selectedRowIds.includes(it.id)) : allItems;

    let targetSummary = data.summary;
    if (selectedRowIds.length > 0) {
      let inSum = 0;
      let outSum = 0;
      for (const it of targetItems) {
        if (it.tipe === "pemasukan") inSum += it.amount_numeric;
        else outSum += it.amount_numeric;
      }
      const sal = inSum - outSum;
      let margin = 0;
      if (inSum > 0) margin = Math.round((sal / inSum) * 1000) / 10;
      targetSummary = {
        total_pemasukan: `Rp ${inSum.toLocaleString("id-ID")}`,
        total_pengeluaran: `Rp ${outSum.toLocaleString("id-ID")}`,
        saldo_bersih: sal < 0 ? `-Rp ${Math.abs(sal).toLocaleString("id-ID")}` : `Rp ${sal.toLocaleString("id-ID")}`,
        numeric_pemasukan: inSum,
        numeric_pengeluaran: outSum,
        numeric_saldo: sal,
        profit_margin_pct: margin,
        total_transaksi: targetItems.length,
      };
    }

    const filename = `Laporan_${periode}_${new Date().toISOString().split("T")[0]}`;
    exportLaporanToExcel(filename, data.periode_label, targetSummary, targetItems);
    toast.add({
      title: "File Excel Berhasil Diunduh",
      description: `Format Excel telah disimpan ke folder download.`,
      type: "success",
    });
  };

  // Data yang akan dicetak di PDF Modal (mendukung seleksi data)
  const pdfReportData = useMemo(() => {
    if (!data) return null;
    if (selectedRowIds.length === 0) return data;
    const filtered = data.items.filter((it) => selectedRowIds.includes(it.id));
    let inSum = 0;
    let outSum = 0;
    for (const it of filtered) {
      if (it.tipe === "pemasukan") inSum += it.amount_numeric;
      else outSum += it.amount_numeric;
    }
    const sal = inSum - outSum;
    let margin = 0;
    if (inSum > 0) margin = Math.round((sal / inSum) * 1000) / 10;
    return {
      ...data,
      summary: {
        total_pemasukan: `Rp ${inSum.toLocaleString("id-ID")}`,
        total_pengeluaran: `Rp ${outSum.toLocaleString("id-ID")}`,
        saldo_bersih: sal < 0 ? `-Rp ${Math.abs(sal).toLocaleString("id-ID")}` : `Rp ${sal.toLocaleString("id-ID")}`,
        numeric_pemasukan: inSum,
        numeric_pengeluaran: outSum,
        numeric_saldo: sal,
        profit_margin_pct: margin,
        total_transaksi: filtered.length,
      },
      items: filtered,
    };
  }, [data, selectedRowIds]);

  const summary = data?.summary || {
    total_pemasukan: "Rp 0",
    total_pengeluaran: "Rp 0",
    saldo_bersih: "Rp 0",
    numeric_pemasukan: 0,
    numeric_pengeluaran: 0,
    numeric_saldo: 0,
    profit_margin_pct: 0,
    total_transaksi: 0,
  };

  const chartData = data?.chart || [];
  const items = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-5">
      <LaporanNavigation />

      {/* Header Halaman & Aksi Ekspor */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
          <p className="mt-0.5 text-xs text-slate-500">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={loading || items.length === 0}
            className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs px-3.5 py-1.5 h-8 rounded-lg shadow-2xs transition disabled:opacity-40"
          >
            <Download className="size-3.5 text-slate-600" />
            Excel {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ""}
          </Button>

          <Button
            type="button"
            onClick={() => setShowPdfModal(true)}
            disabled={loading || items.length === 0}
            className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 h-8 rounded-lg shadow-xs transition disabled:opacity-40"
          >
            <Printer className="size-3.5" />
            Cetak PDF {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ""}
          </Button>
        </div>
      </div>

      {/* Kartu Metrik Ringkasan */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowDownRight className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Total Pemasukan</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums truncate">
              {summary.total_pemasukan}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <ArrowUpRight className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Total Pengeluaran</p>
            <p className="text-lg font-bold text-rose-600 tabular-nums truncate">
              {summary.total_pengeluaran}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Wallet className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Saldo Kas Bersih</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums truncate">
              {summary.saldo_bersih}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Percent className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">Profit Margin</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums truncate">
              {summary.profit_margin_pct}%
              <span className="ml-1 text-xs font-normal text-slate-400">
                · {summary.total_transaksi} trx
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grafik Arus Kas */}
      <AnimatedBarChart
        data={chartData}
        title={`Arus Kas · ${data?.periode_label || pageTitle}`}
      />

      {/* Toolbar Filter & Tabel Rincian Data */}
      <DataTableShell>
        <div className="border-b border-slate-200/80 bg-white p-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {periode === "harian" && (
                <Input
                  type="date"
                  value={tanggalHarian}
                  onChange={(e) => {
                    setTanggalHarian(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 w-[150px] text-xs"
                />
              )}

              {periode === "mingguan" && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="date"
                    value={startDateMingguan}
                    onChange={(e) => {
                      setStartDateMingguan(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 w-[140px] text-xs"
                  />
                  <span className="text-xs text-slate-400">–</span>
                  <Input
                    type="date"
                    value={endDateMingguan}
                    onChange={(e) => {
                      setEndDateMingguan(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 w-[140px] text-xs"
                  />
                </div>
              )}

              {periode === "bulanan" && (
                <div className="flex items-center gap-2">
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={(val) => {
                      setSelectedMonth(parseInt(val || "1", 10));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                      <span>
                        {[
                          "",
                          "Januari",
                          "Februari",
                          "Maret",
                          "April",
                          "Mei",
                          "Juni",
                          "Juli",
                          "Agustus",
                          "September",
                          "Oktober",
                          "November",
                          "Desember",
                        ][selectedMonth]}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[
                          "Januari",
                          "Februari",
                          "Maret",
                          "April",
                          "Mei",
                          "Juni",
                          "Juli",
                          "Agustus",
                          "September",
                          "Oktober",
                          "November",
                          "Desember",
                        ].map((m, idx) => (
                          <SelectItem key={idx + 1} value={String(idx + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(selectedYear)}
                    onValueChange={(val) => {
                      setSelectedYear(parseInt(val || "2026", 10));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[90px] text-xs">
                      <span>{selectedYear}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[2024, 2025, 2026, 2027, 2028].map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {periode === "tahunan" && (
                <Select
                  value={String(selectedYear)}
                  onValueChange={(val) => {
                    setSelectedYear(parseInt(val || "2026", 10));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[110px] text-xs">
                    <span>{selectedYear}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[2024, 2025, 2026, 2027, 2028].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          Tahun {y}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              <Select
                value={selectedOrderId}
                onValueChange={(val) => {
                  setSelectedOrderId(val || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[170px] text-xs">
                  <span className="truncate">
                    {selectedOrderId === "all"
                      ? "Semua Proyek"
                      : orders.find((o) => o.id === selectedOrderId)?.invoice_no || "Proyek"}
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-56 min-w-[280px]">
                  <SelectGroup>
                    <SelectItem value="all">Semua Proyek</SelectItem>
                    {orders.map((ord) => (
                      <SelectItem key={ord.id} value={ord.id}>
                        {ord.invoice_no} · {ord.initial_service}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={sortDir}
                onValueChange={(val) => {
                  setSortDir((val as "desc" | "asc") || "desc");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <span>{sortDir === "desc" ? "Terbaru" : "Terlama"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="desc">Terbaru</SelectItem>
                    <SelectItem value="asc">Terlama</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadReport()}
              className="h-8 gap-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
          </div>
        </div>

        {/* Tabel Rincian Data Transaksi */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-10 px-2 text-center">
                  <Checkbox
                    checked={items.length > 0 && items.every((it) => selectedRowIds.includes(it.id))}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label="Pilih semua baris"
                  />
                </TableHead>
                <TableHead className="w-12 text-center text-xs font-semibold text-slate-600">No</TableHead>
                <TableHead className="min-w-[150px] text-xs font-semibold text-slate-600">Waktu</TableHead>
                <TableHead className="w-28 text-xs font-semibold text-slate-600">No. Nota</TableHead>
                <TableHead className="min-w-[260px] text-xs font-semibold text-slate-600">Uraian</TableHead>
                <TableHead className="min-w-[140px] text-xs font-semibold text-slate-600">Kategori</TableHead>
                <TableHead className="w-24 text-center text-xs font-semibold text-slate-600">Metode</TableHead>
                <TableHead className="min-w-[120px] text-right text-xs font-semibold text-slate-600">Pemasukan</TableHead>
                <TableHead className="min-w-[120px] text-right text-xs font-semibold text-slate-600">Pengeluaran</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      <span className="text-xs">Memuat rincian laporan...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center text-xs text-slate-400">
                    Tidak ada transaksi pada periode ini.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => {
                  const isIncome = row.tipe === "pemasukan";
                  const realIndex = (page - 1) * pageSize + idx + 1;
                  const isChecked = selectedRowIds.includes(row.id);

                  return (
                    <TableRow
                      key={row.id || idx}
                      className={`border-b border-slate-100 transition-colors ${
                        isChecked ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <TableCell className="px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleSelect(row.id)}
                          aria-label={"Pilih baris " + realIndex}
                        />
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-400">{realIndex}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-600">
                        {formatDateTime(row.waktu_transaksi)}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-slate-900">
                        {row.kode_jurnal}
                      </TableCell>
                      <TableCell className="text-xs text-slate-800">
                        <div className="flex flex-col gap-0.5">
                          <span>{row.deskripsi}</span>
                          {(row.invoice_no || row.kode_gaji) && (
                            <span className="text-[11px] text-slate-400">
                              {row.invoice_no && `INV ${row.invoice_no}`}
                              {row.invoice_no && row.kode_gaji && " · "}
                              {row.kode_gaji && `Gaji ${row.kode_gaji}`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{row.nama_kategori}</TableCell>
                      <TableCell className="text-center text-xs capitalize text-slate-500">
                        {row.metode_pembayaran}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs font-semibold text-emerald-600 tabular-nums">
                        {isIncome ? row.nominal : "–"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs font-semibold text-rose-600 tabular-nums">
                        {!isIncome ? row.nominal : "–"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <DataTablePagination
          page={page}
          pageCount={totalPages}
          pageStart={pageStart}
          pageEnd={pageEnd}
          total={totalCount}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </DataTableShell>

      {/* Modal Print PDF Ber-Kop Surat Resmi WTM */}
      <LaporanPdfModal
        open={showPdfModal}
        onOpenChange={setShowPdfModal}
        reportData={pdfReportData}
        periodLabel={data?.periode_label || pageTitle}
      />
    </div>
  );
}
