"use client";

import { useEffect, useRef, useState } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/dashboard/format";
import type { LaporanResponse } from "@/lib/laporan";

type LaporanPdfModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: LaporanResponse | null;
  periodLabel: string;
};

export function LaporanPdfModal({
  open,
  onOpenChange,
  reportData,
  periodLabel,
}: LaporanPdfModalProps) {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    setCurrentDateStr(
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date())
    );
  }, []);

  if (!open || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData.summary;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      {/* Header Bar Modal (Hidden on Print) */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-3.5 text-white shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="size-5 text-emerald-400" />
          <span className="text-sm font-bold">
            Pratinjau Cetak PDF Dokumen Resmi: {periodLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handlePrint}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
          >
            <Printer className="size-4" />
            Cetak / Simpan PDF
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="flex-1 py-8 px-4 flex justify-center print:p-0 print:m-0" ref={printContainerRef}>
        <div className="w-full max-w-4xl bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:rounded-none print:p-6 print:m-0 text-slate-900">
          {/* 1. KOP SURAT RESMI WTM (Sesuai KOP SURAT READY.docx) */}
          <div className="pb-3 border-b-4 border-double border-slate-950">
            <div className="flex items-center">
              {/* Logo Perusahaan */}
              <div className="w-[105px] shrink-0 flex items-center justify-start">
                <img
                  src="/logo/logo_kop.png"
                  alt="Logo CV Win Teknik Mandiri"
                  className="w-[88px] h-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/logo/logo_wtm.png";
                  }}
                />
              </div>

              {/* Teks Kop Surat Rata Tengah Simetris */}
              <div className="flex-1 text-center font-sans pr-[105px]">
                <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-950 uppercase leading-none">
                  CV. WIN TEKNIK MANDIRI
                </h1>
                <h2 className="text-sm sm:text-base font-bold tracking-widest text-[#EE0000] uppercase mt-1">
                  CONTRACTOR &amp; SUPPLIER
                </h2>
                <p className="text-[11px] text-slate-800 mt-1.5 leading-snug font-medium">
                  Jalan Diponegoro - Purwokerto – Ngadiluwih - Kediri – Jawa Timur 64171
                </p>
                <p className="text-[10px] italic text-slate-700 mt-0.5">
                  Telepon: (+62) 812-1662-2840, E-mail: win.teknikmandiri@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* 2. Judul Dokumen Laporan */}
          <div className="mt-5 text-center">
            <h3 className="text-base sm:text-lg font-black tracking-wider uppercase underline underline-offset-4 text-slate-950">
              LAPORAN KEUANGAN &amp; ARUS KAS PERUSAHAAN
            </h3>
            <p className="text-xs font-bold text-slate-600 mt-1">{reportData.periode_label}</p>
          </div>

          {/* 3. Kotak Ringkasan Finansial Eksekutif */}
          <div className="mt-5 grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-center">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pemasukan</span>
              <span className="text-sm font-black text-emerald-700">{summary.total_pemasukan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pengeluaran</span>
              <span className="text-sm font-black text-rose-700">{summary.total_pengeluaran}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Saldo Bersih</span>
              <span className="text-sm font-black text-slate-900">{summary.saldo_bersih}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Profit Margin</span>
              <span className="text-sm font-black text-blue-700">{summary.profit_margin_pct}%</span>
            </div>
          </div>

          {/* 4. Tabel Rincian Transaksi */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rincian Transaksi ({reportData.items.length} Data)
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 px-2 py-2 text-center w-8">No</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-left w-28">Waktu (WIB)</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-left w-24">No. Nota</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Uraian / Keterangan</th>
                  <th className="border border-slate-300 px-2.5 py-2 text-left w-28">Kategori</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-24">Pemasukan</th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-24">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.length > 0 ? (
                  reportData.items.map((it, idx) => {
                    const isIncome = it.tipe === "pemasukan";
                    return (
                      <tr key={it.id || idx} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-300 px-2.5 py-1.5 whitespace-nowrap text-slate-700">
                          {formatDateTime(it.waktu_transaksi)}
                        </td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono font-bold text-slate-800">
                          {it.kode_jurnal}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-900">
                          <div>
                            <span>{it.deskripsi}</span>
                            {it.invoice_no && (
                              <span className="block text-[10px] text-blue-700 font-semibold mt-0.5">
                                Proyek: {it.invoice_no}
                              </span>
                            )}
                            {it.kode_gaji && (
                              <span className="block text-[10px] text-purple-700 font-semibold mt-0.5">
                                Gaji: {it.kode_gaji}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="border border-slate-300 px-2.5 py-1.5 text-slate-600">
                          {it.nama_kategori}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 text-right font-bold tabular-nums text-emerald-700">
                          {isIncome ? it.nominal : "–"}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 text-right font-bold tabular-nums text-rose-700">
                          {!isIncome ? it.nominal : "–"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="border border-slate-300 py-6 text-center text-slate-400">
                      Tidak ada transaksi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td colSpan={5} className="border border-slate-300 px-3 py-2 text-right uppercase">
                    TOTAL KESELURUHAN:
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right text-emerald-700 font-black">
                    {summary.total_pemasukan}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right text-rose-700 font-black">
                    {summary.total_pengeluaran}
                  </td>
                </tr>
                <tr className="bg-slate-200 font-black text-slate-950">
                  <td colSpan={5} className="border border-slate-300 px-3 py-2 text-right uppercase">
                    SALDO BERSIH KAS:
                  </td>
                  <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right text-sm">
                    {summary.saldo_bersih}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 5. Kolom Tanda Tangan Resmi Pengesahan: Pimpinan di Kiri, Admin di Kanan */}
          <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-xs text-center print:break-inside-avoid">
            <div>
              <p className="text-slate-500">Menyetujui,</p>
              <p className="font-bold text-slate-800 mt-0.5">Pimpinan CV. Win Teknik Mandiri</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 border-t border-slate-300 inline-block px-8 pt-1">
                ( .................................................. )
              </p>
            </div>

            <div>
              <p className="text-slate-500">Kediri, {currentDateStr}</p>
              <p className="font-bold text-slate-800 mt-0.5">Dibuat Oleh,</p>
              <p className="font-bold text-slate-800">Administrasi Keuangan</p>
              <div className="h-12" />
              <p className="font-bold text-slate-900 border-t border-slate-300 inline-block px-8 pt-1">
                ( .................................................. )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
