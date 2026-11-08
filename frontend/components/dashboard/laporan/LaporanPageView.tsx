"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  Filter,
  Percent,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
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
import { toast } from "@/components/ui/toast";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTablePagination from "@/components/dashboard/data-table/DataTablePagination";
import { formatDateTime } from "@/lib/dashboard/format";
import {
  fetchLaporanKeuangan,
  exportLaporanToExcel,
  type LaporanResponse,
  type LaporanSummary,
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

  // Load orders for filter
  useEffect(() => {
    listOrdersAdmin("", "", "").then((list) => {
      setOrders(list);
    });
  }, []);

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
    const filename = `Laporan_${periode}_${new Date().toISOString().split("T")[0]}`;
    exportLaporanToExcel(filename, data.periode_label, data.summary, data.items);
    toast.add({
      title: "File Excel Berhasil Diunduh",
      description: `Format CSV/Excel telah disimpan ke folder download.`,
      type: "success",
    });
  };

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
    <div className="space-y-6">
      {/* 1. Navigasi 4 Halaman Laporan (Pill Bar) */}
      <LaporanNavigation />

      {/* 2. Header Halaman & 2 Tombol Ekspor (Excel & PDF Resmi) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{pageTitle}</h1>
          <p className="mt-1 text-xs text-slate-500">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tombol Ekspor Excel */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={loading || items.length === 0}
            className="gap-2 border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition"
          >
            <Download className="size-4 text-emerald-600" />
            Export Excel
          </Button>

          {/* Tombol Cetak PDF Ber-Kop Surat Resmi WTM */}
          <Button
            type="button"
            onClick={() => setShowPdfModal(true)}
            disabled={loading || items.length === 0}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Printer className="size-4 text-emerald-400" />
            Cetak PDF Resmi
          </Button>
        </div>
      </div>

      {/* 3. Empat Kartu Metrik Ringkasan Eksekutif */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Pemasukan */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownRight className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pemasukan
            </p>
            <p className="text-xl font-black text-emerald-600 truncate">{summary.total_pemasukan}</p>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ArrowUpRight className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pengeluaran
            </p>
            <p className="text-xl font-black text-rose-600 truncate">{summary.total_pengeluaran}</p>
          </div>
        </div>

        {/* Saldo Kas Bersih */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-900 bg-[#060b1c] p-5 shadow-md text-white">
          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-800 text-emerald-400">
            <Wallet className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Saldo Kas Bersih
            </p>
            <p className="text-xl font-black text-emerald-400 tracking-tight truncate">
              {summary.saldo_bersih}
            </p>
          </div>
        </div>

        {/* Profit Margin (%) */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#2279cf]">
            <Percent className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Profit Margin
            </p>
            <p className="text-xl font-black text-slate-900 truncate">
              {summary.profit_margin_pct}%{" "}
              <span className="text-xs font-normal text-slate-400">
                ({summary.total_transaksi} trx)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 4. Grafik Batang Beranimasi (Animated Bar Chart) */}
      <AnimatedBarChart
        data={chartData}
        title={`Grafik Arus Kas - ${data?.periode_label || pageTitle}`}
        subtitle="Batang hijau menunjukkan uang masuk, batang merah menunjukkan uang keluar. Arahkan kursor untuk melihat angka detail."
      />

      {/* 5. Toolbar Filter & Tabel Rincian Data */}
      <DataTableShell>
        <div className="border-b border-slate-200/80 bg-white p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Periode Harian: Date Picker */}
              {periode === "harian" && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Pilih Tanggal:
                  </label>
                  <Input
                    type="date"
                    value={tanggalHarian}
                    onChange={(e) => {
                      setTanggalHarian(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs w-[160px]"
                  />
                </div>
              )}

              {/* Filter Periode Mingguan: Rentang Tanggal */}
              {periode === "mingguan" && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Minggu:
                  </label>
                  <Input
                    type="date"
                    value={startDateMingguan}
                    onChange={(e) => {
                      setStartDateMingguan(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs w-[145px]"
                  />
                  <span className="text-xs text-slate-400">s/d</span>
                  <Input
                    type="date"
                    value={endDateMingguan}
                    onChange={(e) => {
                      setEndDateMingguan(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs w-[145px]"
                  />
                </div>
              )}

              {/* Filter Periode Bulanan: Month & Year */}
              {periode === "bulanan" && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Bulan & Tahun:
                  </label>
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={(val) => {
                      setSelectedMonth(parseInt(val || "1", 10));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px] text-xs">
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
                    <SelectTrigger className="w-[100px] text-xs">
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

              {/* Filter Periode Tahunan: Year */}
              {periode === "tahunan" && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Pilih Tahun:
                  </label>
                  <Select
                    value={String(selectedYear)}
                    onValueChange={(val) => {
                      setSelectedYear(parseInt(val || "2026", 10));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[120px] text-xs">
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
                </div>
              )}

              {/* Filter by Proyek */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Proyek:
                </label>
                <Select
                  value={selectedOrderId}
                  onValueChange={(val) => {
                    setSelectedOrderId(val || "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px] text-xs">
                    <span className="truncate">
                      {selectedOrderId === "all"
                        ? "Semua Proyek"
                        : orders.find((o) => o.id === selectedOrderId)?.invoice_no || "Proyek"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
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
              </div>

              {/* Urutan Sort */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Urutan:
                </label>
                <Select
                  value={sortDir}
                  onValueChange={(val) => {
                    setSortDir((val as "desc" | "asc") || "desc");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[130px] text-xs">
                    <span>{sortDir === "desc" ? "Terbaru (WIB)" : "Terlama"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="desc">Terbaru (WIB)</SelectItem>
                      <SelectItem value="asc">Terlama</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadReport()}
              className="gap-1.5 text-xs text-slate-600 hover:bg-slate-50"
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
                <TableHead className="w-12 text-center text-xs font-bold text-slate-700">No</TableHead>
                <TableHead className="min-w-[150px] text-xs font-bold text-slate-700">Waktu (WIB)</TableHead>
                <TableHead className="w-28 text-xs font-bold text-slate-700">No. Nota</TableHead>
                <TableHead className="min-w-[260px] text-xs font-bold text-slate-700">Uraian / Keterangan</TableHead>
                <TableHead className="min-w-[140px] text-xs font-bold text-slate-700">Kategori</TableHead>
                <TableHead className="w-24 text-center text-xs font-bold text-slate-700">Metode</TableHead>
                <TableHead className="min-w-[130px] text-right text-xs font-bold text-slate-700">Pemasukan</TableHead>
                <TableHead className="min-w-[130px] text-right text-xs font-bold text-slate-700">Pengeluaran</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      <span className="text-xs">Memuat rincian laporan keuangan...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-slate-400 text-xs">
                    Tidak ada transaksi pada periode ini.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => {
                  const isIncome = row.tipe === "pemasukan";
                  const realIndex = (page - 1) * pageSize + idx + 1;

                  return (
                    <TableRow key={row.id || idx} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <TableCell className="text-center text-xs text-slate-500 font-medium">{realIndex}</TableCell>
                      <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                        {formatDateTime(row.waktu_transaksi)}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{row.kode_jurnal}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-900">
                        <div>
                          <span>{row.deskripsi}</span>
                          {row.invoice_no && (
                            <span className="inline-block text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 mt-0.5 ml-1">
                              Proyek: {row.invoice_no}
                            </span>
                          )}
                          {row.kode_gaji && (
                            <span className="inline-block text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 mt-0.5 ml-1">
                              Gaji: {row.kode_gaji}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{row.nama_kategori}</TableCell>
                      <TableCell className="text-center text-xs text-slate-600 capitalize">
                        {row.metode_pembayaran}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-700 whitespace-nowrap">
                        {isIncome ? row.nominal : "-"}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-rose-700 whitespace-nowrap">
                        {!isIncome ? row.nominal : "-"}
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

      {/* 6. Modal Print PDF Ber-Kop Surat Resmi WTM */}
      <LaporanPdfModal
        open={showPdfModal}
        onOpenChange={setShowPdfModal}
        reportData={data}
        periodLabel={data?.periode_label || pageTitle}
      />
    </div>
  );
}
