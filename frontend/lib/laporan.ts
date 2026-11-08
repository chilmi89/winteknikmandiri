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
 * Ekspor data laporan keuangan ke file Excel (.xls) berstandar akuntansi dengan header tabel berwarna dan gridlines rapi.
 */
export function exportLaporanToExcel(
  filename: string,
  periodeLabel: string,
  summary: LaporanSummary,
  items: LaporanItemRow[]
) {
  const currentDate = formatDateTime(new Date().toISOString()) + " WIB";

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Finansial</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .company-header { font-size: 16pt; font-weight: bold; color: #0F172A; text-align: center; }
        .company-sub { font-size: 12pt; font-weight: bold; color: #EE0000; text-align: center; }
        .company-contact { font-size: 9pt; color: #475569; text-align: center; }
        .doc-title { font-size: 14pt; font-weight: bold; color: #0F172A; text-align: center; text-decoration: underline; }
        .meta-text { font-size: 10pt; color: #334155; }
        
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th { background-color: #0F172A; color: #FFFFFF; font-weight: bold; font-size: 10pt; padding: 10px 8px; border: 1px solid #334155; text-align: center; }
        td { border: 1px solid #CBD5E1; padding: 7px 8px; font-size: 9.5pt; color: #1E293B; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .income-val { color: #059669; font-weight: bold; text-align: right; }
        .expense-val { color: #DC2626; font-weight: bold; text-align: right; }
        .summary-box { background-color: #F8FAFC; border: 1px solid #CBD5E1; }
        .total-row { background-color: #E2E8F0; font-weight: bold; font-size: 10pt; }
        .saldo-row { background-color: #0F172A; color: #10B981; font-weight: bold; font-size: 11pt; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="8" class="company-header">CV. WIN TEKNIK MANDIRI</td></tr>
        <tr><td colspan="8" class="company-sub">CONTRACTOR &amp; SUPPLIER</td></tr>
        <tr><td colspan="8" class="company-contact">Jalan Diponegoro - Purwokerto – Ngadiluwih - Kediri – Jawa Timur 64171 | Telp: (+62) 812-1662-2840</td></tr>
        <tr><td colspan="8"></td></tr>
        <tr><td colspan="8" class="doc-title">LAPORAN KAS &amp; TRANSAKSI FINANSIAL</td></tr>
        <tr><td colspan="8" class="meta-text text-center"><strong>Periode:</strong> ${periodeLabel} | <strong>Dicetak:</strong> ${currentDate}</td></tr>
        <tr><td colspan="8"></td></tr>
      </table>

      <!-- Kotak Ringkasan Arus Kas -->
      <table style="width: 70%; margin-bottom: 15px;">
        <tr class="summary-box">
          <td style="font-weight:bold; background-color: #F1F5F9;">Total Pemasukan:</td>
          <td class="income-val">${summary.total_pemasukan}</td>
          <td style="font-weight:bold; background-color: #F1F5F9;">Saldo Bersih Kas:</td>
          <td style="font-weight:bold; text-align: right;">${summary.saldo_bersih}</td>
        </tr>
        <tr class="summary-box">
          <td style="font-weight:bold; background-color: #F1F5F9;">Total Pengeluaran:</td>
          <td class="expense-val">${summary.total_pengeluaran}</td>
          <td style="font-weight:bold; background-color: #F1F5F9;">Profit Margin:</td>
          <td style="font-weight:bold; text-align: right;">${summary.profit_margin_pct}% (${summary.total_transaksi} Transaksi)</td>
        </tr>
      </table>

      <!-- Tabel Rincian Data Transaksi -->
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 140px;">Waktu (WIB)</th>
            <th style="width: 120px;">No. Nota</th>
            <th style="width: 280px;">Uraian / Keterangan</th>
            <th style="width: 150px;">Kategori Akun</th>
            <th style="width: 90px;">Metode</th>
            <th style="width: 130px;">Pemasukan (Rp)</th>
            <th style="width: 130px;">Pengeluaran (Rp)</th>
          </tr>
        </thead>
        <tbody>
  `;

  items.forEach((it, idx) => {
    const isIncome = it.tipe === "pemasukan";
    let desc = it.deskripsi;
    if (it.invoice_no) desc += ` [Proyek: ${it.invoice_no}]`;
    if (it.kode_gaji) desc += ` [Gaji: ${it.kode_gaji}]`;

    html += `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-center">${formatDateTime(it.waktu_transaksi)}</td>
        <td class="text-center" style="font-family: monospace; font-weight: bold;">${it.kode_jurnal}</td>
        <td class="text-left">${desc}</td>
        <td class="text-left">${it.nama_kategori || "Umum"}</td>
        <td class="text-center" style="text-transform: capitalize;">${it.metode_pembayaran}</td>
        <td class="income-val">${isIncome ? it.nominal : "-"}</td>
        <td class="expense-val">${!isIncome ? it.nominal : "-"}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="6" class="text-right" style="font-weight: bold;">TOTAL PERIODE:</td>
            <td class="income-val">${summary.total_pemasukan}</td>
            <td class="expense-val">${summary.total_pengeluaran}</td>
          </tr>
          <tr class="saldo-row">
            <td colspan="6" class="text-right" style="font-weight: bold; color: #FFFFFF;">SALDO KAS BERSIH:</td>
            <td colspan="2" class="text-right" style="font-size: 11pt; color: #10B981; font-weight: bold;">${summary.saldo_bersih}</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
