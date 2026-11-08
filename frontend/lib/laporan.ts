import { resolveApiBase } from "@/lib/dashboard/api";
import { formatDateTime } from "@/lib/dashboard/format";

export type LaporanSummary = {
  total_pemasukan: string;
  total_pengeluaran: string;
  saldo_bersih: string;
  numeric_pemasukan: number;
  numeric_pengeluaran: number;
  numeric_saldo: number;
  profit_margin_pct: number;
  total_transaksi: number;
};

export type ChartBarPoint = {
  label: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  pemasukan_str: string;
  pengeluaran_str: string;
  saldo_str: string;
};

export type KategoriBreakdown = {
  kategori: string;
  tipe: string;
  total: string;
  amount_numeric: number;
  percentage: number;
};

export type LaporanItemRow = {
  id: string;
  jurnal_id: string;
  kode_jurnal: string;
  waktu_transaksi: string;
  tipe: "pemasukan" | "pengeluaran";
  deskripsi: string;
  nama_kategori: string;
  metode_pembayaran: string;
  nominal: string;
  amount_numeric: number;
  sumber: string;
  invoice_no?: string;
  kode_gaji?: string;
};

export type LaporanResponse = {
  periode: string;
  periode_label: string;
  summary: LaporanSummary;
  chart: ChartBarPoint[];
  kategori_breakdown: KategoriBreakdown[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: LaporanItemRow[];
};

export async function fetchLaporanKeuangan(params: {
  periode?: "harian" | "mingguan" | "bulanan" | "tahunan";
  tanggal?: string;
  start_date?: string;
  end_date?: string;
  month?: number;
  year?: number;
  order_id?: string;
  kategori_id?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<LaporanResponse> {
  const q = new URLSearchParams();
  if (params.periode) q.set("periode", params.periode);
  if (params.tanggal) q.set("tanggal", params.tanggal);
  if (params.start_date) q.set("start_date", params.start_date);
  if (params.end_date) q.set("end_date", params.end_date);
  if (params.month) q.set("month", String(params.month));
  if (params.year) q.set("year", String(params.year));
  if (params.order_id && params.order_id !== "all") q.set("order_id", params.order_id);
  if (params.kategori_id && params.kategori_id !== "all") q.set("kategori_id", params.kategori_id);
  if (params.sort_dir) q.set("sort_dir", params.sort_dir);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));

  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/laporan?${q.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat data laporan keuangan");
  const json = await res.json();
  return json.data;
}

/**
 * Ekspor data laporan keuangan ke file CSV/Excel dengan format rapi dan UTF-8 BOM.
 */
export function exportLaporanToExcel(
  filename: string,
  periodeLabel: string,
  summary: LaporanSummary,
  items: LaporanItemRow[]
) {
  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[][] = [
    ["CV. WIN TEKNIK MANDIRI - LAPORAN KEUANGAN & MUTASI KAS"],
    [`Periode: ${periodeLabel}`],
    [`Dicetak pada: ${formatDateTime(new Date().toISOString())} WIB`],
    [],
    ["RINGKASAN ARUS KAS:"],
    ["Total Pemasukan", summary.total_pemasukan],
    ["Total Pengeluaran", summary.total_pengeluaran],
    ["Saldo Bersih Kas", summary.saldo_bersih],
    ["Profit Margin", `${summary.profit_margin_pct}%`],
    ["Total Transaksi", String(summary.total_transaksi)],
    [],
    [
      "No",
      "Tanggal & Waktu (WIB)",
      "No. Nota",
      "Tipe",
      "Uraian / Keterangan",
      "Kategori Akun",
      "Metode Pembayaran",
      "Pemasukan (Rp)",
      "Pengeluaran (Rp)",
      "Referensi Proyek / Gaji",
    ],
  ];

  items.forEach((it, idx) => {
    const isIncome = it.tipe === "pemasukan";
    let ref = it.sumber;
    if (it.invoice_no) ref = `Proyek: ${it.invoice_no}`;
    else if (it.kode_gaji) ref = `Gaji: ${it.kode_gaji}`;

    rows.push([
      String(idx + 1),
      formatDateTime(it.waktu_transaksi) + " WIB",
      it.kode_jurnal,
      isIncome ? "Pemasukan" : "Pengeluaran",
      it.deskripsi,
      it.nama_kategori || "Umum",
      it.metode_pembayaran.toUpperCase(),
      isIncome ? String(it.amount_numeric) : "0",
      !isIncome ? String(it.amount_numeric) : "0",
      ref,
    ]);
  });

  // Tambahkan baris Total di akhir
  rows.push([]);
  rows.push([
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    String(summary.numeric_pemasukan),
    String(summary.numeric_pengeluaran),
    `SALDO: ${summary.saldo_bersih}`,
  ]);

  const csvContent = "\uFEFF" + rows.map((r) => r.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
