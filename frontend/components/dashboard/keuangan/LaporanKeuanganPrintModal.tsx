"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/dashboard/format";
import type { JurnalKeuangan } from "@/lib/keuangan";

type LaporanKeuanganPrintModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNotes: JurnalKeuangan[];
};

export function LaporanKeuanganPrintModal({
  open,
  onOpenChange,
  selectedNotes,
}: LaporanKeuanganPrintModalProps) {
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      {/* Header Modal Bar (Hidden on Print) */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-3.5 text-white shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="size-5 text-emerald-400" />
          <span className="text-sm font-bold">
            Pratinjau Cetak Laporan Finansial ({selectedNotes.length} Dokumen Dipilih)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handlePrint}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm"
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
        <div className="w-full max-w-4xl space-y-8 print:w-full print:max-w-none print:space-y-0">
          {selectedNotes.map((note, noteIdx) => {
            return (
              <div
                key={note.id}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:rounded-none print:p-6 print:m-0 print:break-after-page text-slate-900"
              >
                {/* 1. KOP SURAT RESMI (Sesuai KOP SURAT READY.docx) */}
                <div className="pb-3 border-b-4 border-double border-slate-950">
                  <div className="flex items-center gap-4">
                    {/* Logo Perusahaan */}
                    <div className="w-24 shrink-0 flex items-center justify-center">
                      <img
                        src="/logo/logo_kop.png"
                        alt="Logo CV Win Teknik Mandiri"
                        className="w-20 h-auto object-contain"
                        onError={(e) => {
                          // Fallback to standard logo if needed
                          (e.currentTarget as HTMLImageElement).src = "/logo/logo_wtm.png";
                        }}
                      />
                    </div>

                    {/* Informasi Kop Surat */}
                    <div className="flex-1 text-center font-sans">
                      <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-950 uppercase leading-none font-arial">
                        CV. WIN TEKNIK MANDIRI
                      </h1>
                      <h2 className="text-sm sm:text-base font-bold tracking-widest text-[#EE0000] uppercase mt-0.5">
                        CONTRACTOR &amp; SUPPLIER
                      </h2>
                      <p className="text-[11px] text-slate-700 mt-1 leading-tight">
                        Jalan Diponegoro - Purwokerto – Ngadiluwih - Kediri – Jawa Timur 64171
                      </p>
                      <p className="text-[10.5px] italic text-slate-600 mt-0.5">
                        Telepon: (+62) 812-1662-2840, E-mail: win.teknikmandiri@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Judul Dokumen & Metadata Nota */}
                <div className="mt-5 text-center">
                  <h3 className="text-base sm:text-lg font-black tracking-wider uppercase underline underline-offset-4 text-slate-950">
                    LAPORAN KAS &amp; MUTASI TRANSAKSI
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    No. Referensi: <span className="font-mono font-bold text-slate-900">{note.kode_jurnal}</span>
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Uraian Dokumen:</span>
                    <span className="font-bold text-slate-900">{note.judul || "Rekap Kas Finansial"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Waktu Entry Transaksi:</span>
                    <span className="font-bold text-slate-900">
                      {formatDateTime(note.waktu_transaksi)} WIB
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Pembukuan:</span>
                    <span className="font-bold uppercase text-slate-900">
                      {note.status === "lunas" ? "LUNAS (SELESAI)" : "DRAFT (SEMENTARA)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cabang Operasional:</span>
                    <span className="font-bold text-slate-900">{note.cabang || "Workshop Pusat Kediri"}</span>
                  </div>
                </div>

                {/* 3. Tabel Rincian Transaksi */}
                <div className="mt-5">
                  <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2.5 py-2 text-center w-10">No</th>
                        <th className="border border-slate-300 px-3 py-2 text-left">Uraian / Keterangan</th>
                        <th className="border border-slate-300 px-2.5 py-2 text-left w-32">Kategori</th>
                        <th className="border border-slate-300 px-2 py-2 text-center w-20">Metode</th>
                        <th className="border border-slate-300 px-3 py-2 text-right w-28">Pemasukan</th>
                        <th className="border border-slate-300 px-3 py-2 text-right w-28">Pengeluaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {note.items && note.items.length > 0 ? (
                        note.items.map((itm, idx) => {
                          const isIncome = itm.tipe === "pemasukan";
                          return (
                            <tr key={itm.id || idx} className="hover:bg-slate-50/50">
                              <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-900">
                                <div>
                                  <span>{itm.deskripsi}</span>
                                  {itm.sumber === "proyek" && itm.invoice_no && (
                                    <span className="block text-[10px] text-blue-700 font-semibold mt-0.5">
                                      Terhubung Proyek: {itm.invoice_no}
                                    </span>
                                  )}
                                  {itm.sumber === "gaji" && itm.kode_gaji && (
                                    <span className="block text-[10px] text-purple-700 font-semibold mt-0.5">
                                      Terhubung Gaji: {itm.kode_gaji}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="border border-slate-300 px-2.5 py-1.5 text-slate-600">
                                {itm.nama_kategori || "Umum"}
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-600 capitalize">
                                {itm.metode_pembayaran}
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5 text-right font-bold text-emerald-700">
                                {isIncome ? itm.nominal : "-"}
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5 text-right font-bold text-rose-700">
                                {!isIncome ? itm.nominal : "-"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="border border-slate-300 py-4 text-center text-slate-400">
                            Tidak ada rincian item transaksi.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Footer Akumulasi */}
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right uppercase">
                          Total Per Nota:
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-right text-emerald-700">
                          {note.total_pemasukan || "Rp 0"}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-right text-rose-700">
                          {note.total_pengeluaran || "Rp 0"}
                        </td>
                      </tr>
                      <tr className="bg-slate-200 font-black text-slate-950">
                        <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right uppercase">
                          Saldo Bersih Kas:
                        </td>
                        <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right text-sm">
                          {note.saldo_bersih || "Rp 0"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 4. Catatan Tambahan */}
                {note.catatan && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Catatan Laporan:</span>
                    <p className="text-slate-600 whitespace-pre-line">{note.catatan}</p>
                  </div>
                )}

                {/* 5. Kolom Tanda Tangan Resmi Pengesahan */}
                <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-xs text-center print:break-inside-avoid">
                  <div>
                    <p className="text-slate-500">Dibuat Oleh,</p>
                    <p className="font-bold text-slate-800 mt-0.5">Administrasi Keuangan</p>
                    <div className="h-16" />
                    <p className="font-bold text-slate-900 border-t border-slate-300 inline-block px-8 pt-1">
                      ( .................................................. )
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Kediri, {currentDateStr}
                    </p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      Pimpinan CV. Win Teknik Mandiri
                    </p>
                    <div className="h-16" />
                    <p className="font-bold text-slate-900 border-t border-slate-300 inline-block px-8 pt-1">
                      ( .................................................. )
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
