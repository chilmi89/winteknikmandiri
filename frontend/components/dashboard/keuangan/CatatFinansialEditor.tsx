"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Info,
  Plus,
  Receipt,
  Save,
  Search,
  Trash2,
  Users,
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
import { toast } from "@/components/ui/toast";
import {
  getNextKodeJurnal,
  type JurnalKeuangan,
  type KategoriKeuangan,
  type CreateJurnalPayload,
  type UpdateJurnalPayload,
} from "@/lib/keuangan";
import type { Order } from "@/lib/orders";
import type { Gaji } from "@/lib/gaji";

type CatatFinansialEditorProps = {
  jurnal: JurnalKeuangan | null; // null = catat baru
  categories: KategoriKeuangan[];
  orders: Order[];
  gajiList: Gaji[];
  onBackToHistory: () => void;
  onSave: (payload: CreateJurnalPayload) => Promise<void>;
  onUpdate?: (id: string, payload: UpdateJurnalPayload) => Promise<void>;
};

type RowItem = {
  id?: string;
  tipe: "pemasukan" | "pengeluaran";
  deskripsi: string;
  kategori_id?: string;
  metode_pembayaran: "transfer" | "cash" | "kasbon" | "qris";
  nominal: string;
  sumber: "manual" | "proyek" | "gaji";
  order_id?: string;
  invoice_no?: string;
  gaji_id?: string;
  kode_gaji?: string;
  catatan?: string;
};

function formatRupiahInput(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function parseNumeric(val: string): number {
  const digits = val.replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
}

export function CatatFinansialEditor({
  jurnal,
  categories,
  orders,
  gajiList,
  onBackToHistory,
  onSave,
  onUpdate,
}: CatatFinansialEditorProps) {
  const isEdit = Boolean(jurnal);

  // Metadata Header Nota
  const [kodeJurnal, setKodeJurnal] = useState(jurnal ? jurnal.kode_jurnal : "");
  const [judul, setJudul] = useState("");
  const [waktuTransaksi, setWaktuTransaksi] = useState("");
  const [status, setStatus] = useState<"draft" | "lunas">("draft");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  // Baris-baris Rincian Transaksi
  const [rows, setRows] = useState<RowItem[]>([]);

  // Popover Picker Proyek / Gaji
  const [activePickerRowIndex, setActivePickerRowIndex] = useState<number | null>(null);
  const [pickerType, setPickerType] = useState<"proyek" | "gaji" | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Live WIB Clock
  const [liveTimeStr, setLiveTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }) + " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real next code on create mode
  useEffect(() => {
    if (!jurnal) {
      getNextKodeJurnal().then((code) => {
        setKodeJurnal(code);
      });
    } else {
      setKodeJurnal(jurnal.kode_jurnal);
    }
  }, [jurnal]);

  // Close picker on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setActivePickerRowIndex(null);
        setPickerType(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inisialisasi data
  useEffect(() => {
    if (jurnal) {
      setJudul(jurnal.judul);
      try {
        const d = new Date(jurnal.waktu_transaksi);
        const pad = (n: number) => String(n).padStart(2, "0");
        const dtLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setWaktuTransaksi(dtLocal);
      } catch {
        setWaktuTransaksi("");
      }
      setStatus((jurnal.status as "draft" | "lunas") || "draft");
      setCatatan(jurnal.catatan || "");
      setRows(
        (jurnal.items || []).map((itm) => ({
          id: itm.id,
          tipe: itm.tipe,
          deskripsi: itm.deskripsi,
          kategori_id: itm.kategori_id,
          metode_pembayaran: itm.metode_pembayaran || "transfer",
          nominal: itm.nominal,
          sumber: itm.sumber,
          order_id: itm.order_id,
          invoice_no: itm.invoice_no,
          gaji_id: itm.gaji_id,
          kode_gaji: itm.kode_gaji,
          catatan: itm.catatan,
        }))
      );
    } else {
      setJudul("");
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const dtLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setWaktuTransaksi(dtLocal);
      setStatus("draft");
      setCatatan("");
      // Mulai dengan 1 baris pemasukan kosong
      const firstIncome = categories.find((c) => c.tipe === "pemasukan");
      setRows([
        {
          tipe: "pemasukan",
          deskripsi: "",
          kategori_id: firstIncome?.id,
          metode_pembayaran: "transfer",
          nominal: "",
          sumber: "manual",
        },
      ]);
    }
  }, [jurnal, categories]);

  // Tambah baris Pemasukan
  const handleAddPemasukan = () => {
    const firstIncomeKat = categories.find((c) => c.tipe === "pemasukan");
    setRows((prev) => [
      ...prev,
      {
        tipe: "pemasukan",
        deskripsi: "",
        kategori_id: firstIncomeKat?.id,
        metode_pembayaran: "transfer",
        nominal: "",
        sumber: "manual",
      },
    ]);
  };

  // Tambah baris Pengeluaran
  const handleAddPengeluaran = () => {
    const firstExpenseKat = categories.find((c) => c.tipe === "pengeluaran");
    setRows((prev) => [
      ...prev,
      {
        tipe: "pengeluaran",
        deskripsi: "",
        kategori_id: firstExpenseKat?.id,
        metode_pembayaran: "transfer",
        nominal: "",
        sumber: "manual",
      },
    ]);
  };

  // Hapus baris
  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Ubah field baris
  const handleRowChange = (index: number, field: keyof RowItem, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (field === "nominal") {
          return { ...r, nominal: formatRupiahInput(value) };
        }
        return { ...r, [field]: value };
      })
    );
  };

  // Tarik dari Proyek
  const handlePickOrder = (index: number, ord: Order) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const cust = ord.customer_name ? ` (${ord.customer_name})` : "";
        const desc = `Pelunasan ${ord.invoice_no} - ${ord.initial_service}${cust}`;
        const autoKat = categories.find(
          (c) => c.tipe === "pemasukan" && (c.nama_kategori.toLowerCase().includes("proyek") || c.nama_kategori.toLowerCase().includes("instalasi"))
        ) || categories.find((c) => c.tipe === "pemasukan");

        return {
          ...r,
          tipe: "pemasukan",
          deskripsi: desc,
          nominal: ord.total_amount ? formatRupiahInput(ord.total_amount) : r.nominal,
          kategori_id: autoKat ? autoKat.id : r.kategori_id,
          sumber: "proyek",
          order_id: ord.id,
          invoice_no: ord.invoice_no,
        };
      })
    );
    setActivePickerRowIndex(null);
    setPickerType(null);
  };

  // Tarik dari Slip Gaji
  const handlePickGaji = (index: number, g: Gaji) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const desc = `Pencairan Gaji ${g.kode_gaji} - ${g.team_name} (${g.team_skill})`;
        const autoKat = categories.find(
          (c) => c.tipe === "pengeluaran" && c.nama_kategori.toLowerCase().includes("gaji")
        ) || categories.find((c) => c.tipe === "pengeluaran");

        return {
          ...r,
          tipe: "pengeluaran",
          deskripsi: desc,
          nominal: g.total_gaji ? formatRupiahInput(g.total_gaji) : r.nominal,
          kategori_id: autoKat ? autoKat.id : r.kategori_id,
          sumber: "gaji",
          gaji_id: g.id,
          kode_gaji: g.kode_gaji,
        };
      })
    );
    setActivePickerRowIndex(null);
    setPickerType(null);
  };

  // Kalkulasi Real-Time
  const { totalPemasukanNum, totalPengeluaranNum, saldoBersihNum } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    for (const r of rows) {
      const n = parseNumeric(r.nominal);
      if (r.tipe === "pemasukan") inSum += n;
      else outSum += n;
    }
    return {
      totalPemasukanNum: inSum,
      totalPengeluaranNum: outSum,
      saldoBersihNum: inSum - outSum,
    };
  }, [rows]);

  const totalPemasukanStr = `Rp ${totalPemasukanNum.toLocaleString("id-ID")}`;
  const totalPengeluaranStr = `Rp ${totalPengeluaranNum.toLocaleString("id-ID")}`;
  const saldoBersihStr =
    saldoBersihNum < 0
      ? `-Rp ${Math.abs(saldoBersihNum).toLocaleString("id-ID")}`
      : `Rp ${saldoBersihNum.toLocaleString("id-ID")}`;

  // Filter Orders in Picker
  const filteredOrders = useMemo(() => {
    if (!pickerQuery.trim()) return orders;
    const q = pickerQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.invoice_no?.toLowerCase().includes(q) ||
        o.initial_service?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q)
    );
  }, [orders, pickerQuery]);

  // Filter Gaji in Picker
  const filteredGaji = useMemo(() => {
    if (!pickerQuery.trim()) return gajiList;
    const q = pickerQuery.toLowerCase();
    return gajiList.filter(
      (g) =>
        g.kode_gaji?.toLowerCase().includes(q) ||
        g.team_name?.toLowerCase().includes(q) ||
        g.team_skill?.toLowerCase().includes(q)
    );
  }, [gajiList, pickerQuery]);

  // Submit Handler
  const handleSaveReport = async () => {
    if (rows.length === 0) {
      toast.add({ title: "Gagal menyimpan", description: "Minimal masukkan 1 baris transaksi.", type: "error" });
      return;
    }

    // Validasi baris
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.deskripsi.trim()) {
        toast.add({ title: "Validasi gagal", description: `Isi keterangan pada baris #${i + 1}.`, type: "error" });
        return;
      }
      if (parseNumeric(r.nominal) <= 0) {
        toast.add({ title: "Validasi gagal", description: `Nominal pada baris #${i + 1} harus lebih dari 0.`, type: "error" });
        return;
      }
    }

    setSaving(true);
    try {
      const payload: CreateJurnalPayload = {
        judul: judul.trim() || undefined,
        waktu_transaksi: waktuTransaksi || undefined,
        status,
        catatan: catatan.trim(),
        items: rows.map((r) => ({
          tipe: r.tipe,
          deskripsi: r.deskripsi.trim(),
          kategori_id: r.kategori_id || undefined,
          metode_pembayaran: r.metode_pembayaran,
          nominal: r.nominal,
          sumber: r.sumber,
          order_id: r.order_id || undefined,
          gaji_id: r.gaji_id || undefined,
          catatan: r.catatan || "",
        })),
      };

      if (isEdit && jurnal && onUpdate) {
        await onUpdate(jurnal.id, payload);
        toast.add({ title: "Laporan Diperbarui", description: `Nota ${jurnal.kode_jurnal} berhasil disimpan.`, type: "success" });
      } else {
        await onSave(payload);
        toast.add({ title: "Laporan Dibukukan", description: "Laporan finansial baru berhasil dicatat.", type: "success" });
      }
      onBackToHistory();
    } catch (err: unknown) {
      toast.add({ title: "Gagal menyimpan", description: err instanceof Error ? err.message : "", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Atas Sesuai Gambar Referensi */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2279cf]">
            — {isEdit ? "EDIT TRANSAKSI" : "CATAT BARU"}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={onBackToHistory}
              className="text-slate-400 hover:text-slate-800 transition text-lg font-bold"
              title="Kembali ke Jurnal Transaksi"
            >
              ‹
            </button>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Catat Transaksi <span className="text-[#2279cf]">Finansial</span>
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Kelola rincian kas masuk dan keluar secara akurat dan tersinkronisasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Badge Database Sync Online */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs">
            <span className="text-[10px] text-slate-400">DATABASE SYNC</span>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700">ONLINE</span>
            {liveTimeStr && (
              <span className="text-slate-400 font-mono pl-1 border-l border-slate-200">
                {liveTimeStr}
              </span>
            )}
          </div>

          {/* Tombol Kembali ke Jurnal Transaksi */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToHistory}
            className="gap-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Clock className="size-3.5 text-slate-400" />
            Jurnal Transaksi
          </Button>
        </div>
      </div>

      {/* 2. Top Card Metadata (2/3 Kolom Bersih, Workshop Dihapus Total, Kode Riil Tanpa Kata Otomatis) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Tanggal & Waktu Entry */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="size-3.5 text-slate-400" />
              Tanggal & Waktu Entry (WIB)
            </label>
            <Input
              type="datetime-local"
              value={waktuTransaksi}
              onChange={(e) => setWaktuTransaksi(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* No. Referensi / Nota (Kode Riil e.g. JRN-2611-0005) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Receipt className="size-3.5 text-slate-400" />
              No. Referensi / Nota
            </label>
            <Input
              type="text"
              readOnly
              value={kodeJurnal || "Memuat kode..."}
              className="text-xs font-mono font-bold text-slate-900 bg-slate-50/80 cursor-default"
            />
          </div>

          {/* Judul Lembar Kas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <FileText className="size-3.5 text-slate-400" />
              Judul Lembar Kas
            </label>
            <Input
              type="text"
              placeholder="Contoh: Rekap Kas Harian Operasional"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="text-xs font-medium text-slate-800 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* 3. Card Utama: Rincian Transaksi */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        {/* Header Bagian Rincian & 2 Tombol Aksi (Tanpa Icon Ganda) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-[#2279cf]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Rincian Transaksi
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Hijau: + PEMASUKAN (Tanpa Double Plus) */}
            <Button
              type="button"
              size="sm"
              onClick={handleAddPemasukan}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
            >
              <Plus className="size-3.5" />
              PEMASUKAN
            </Button>

            {/* Tombol Merah: + PENGELUARAN (Tanpa Double Plus) */}
            <Button
              type="button"
              size="sm"
              onClick={handleAddPengeluaran}
              className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
            >
              <Plus className="size-3.5" />
              PENGELUARAN
            </Button>
          </div>
        </div>

        {/* Tabel Rincian: Format Single-Line Rapi & Sejajar */}
        <div className="space-y-2.5">
          {/* Header Kolom Mini */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <div className="col-span-1 text-center">Tipe</div>
            <div className="col-span-5">Item / Keterangan</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2">Metode</div>
            <div className="col-span-2 text-right pr-8">Nominal (Rp)</div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-400">
              Belum ada baris transaksi. Klik <strong>+ PEMASUKAN</strong> atau <strong>+ PENGELUARAN</strong> di atas.
            </div>
          ) : (
            rows.map((row, index) => {
              const isIncome = row.tipe === "pemasukan";

              // Deduplikasi Kategori agar tidak muncul ganda di dropdown
              const rowCategories = (() => {
                const filtered = categories.filter((c) => c.tipe === row.tipe);
                const seen = new Set<string>();
                return filtered.filter((c) => {
                  if (seen.has(c.nama_kategori)) return false;
                  seen.add(c.nama_kategori);
                  return true;
                });
              })();

              const selectedKat = categories.find((c) => c.id === row.kategori_id);

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="grid gap-2.5 sm:grid-cols-12 items-center">
                    {/* 1. Tipe Icon: ↗ Panah Hijau (Pemasukan) atau ↘ Panah Merah (Pengeluaran) */}
                    <div className="sm:col-span-1 flex justify-center">
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg border font-bold ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                        title={isIncome ? "Pemasukan (Uang Masuk)" : "Pengeluaran (Uang Keluar)"}
                      >
                        {isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                      </div>
                    </div>

                    {/* 2. Item / Keterangan dengan Tombol Tarik Rapi Terintegrasi di Dalam Input */}
                    <div className="sm:col-span-5 relative flex items-center">
                      <Input
                        type="text"
                        placeholder={isIncome ? "Uraian transaksi pemasukan..." : "Uraian transaksi pengeluaran..."}
                        value={row.deskripsi}
                        onChange={(e) => handleRowChange(index, "deskripsi", e.target.value)}
                        className="text-xs font-medium text-slate-800 pr-24"
                      />
                      {/* Tombol Tarik Proyek / Gaji yang Rapi & Sejajar (Tidak Membesarkan Baris) */}
                      <button
                        type="button"
                        onClick={() => {
                          setActivePickerRowIndex(index);
                          setPickerType(isIncome ? "proyek" : "gaji");
                          setPickerQuery("");
                        }}
                        className={`absolute right-1.5 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        }`}
                        title={isIncome ? "Tarik dari invoice proyek closing" : "Tarik dari slip gaji teknisi"}
                      >
                        {isIncome ? "🏢 Proyek" : "👷 Gaji"}
                      </button>
                    </div>

                    {/* 3. Kategori Akun (Dropdown Lebar Bersih, Tanpa Potongan Teks) */}
                    <div className="sm:col-span-2">
                      <Select
                        value={row.kategori_id || ""}
                        onValueChange={(val) => handleRowChange(index, "kategori_id", val || "")}
                      >
                        <SelectTrigger className="w-full text-xs font-medium text-slate-800">
                          <span className="truncate">
                            {selectedKat ? selectedKat.nama_kategori : "Pilih Kategori"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="max-h-56 min-w-[240px] z-50">
                          <SelectGroup>
                            {rowCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nama_kategori}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 4. Metode Pembayaran */}
                    <div className="sm:col-span-2">
                      <Select
                        value={row.metode_pembayaran}
                        onValueChange={(val) =>
                          handleRowChange(index, "metode_pembayaran", (val as any) || "transfer")
                        }
                      >
                        <SelectTrigger className="w-full text-xs font-medium text-slate-800">
                          <span className="truncate">
                            {row.metode_pembayaran === "transfer"
                              ? "🏦 Transfer"
                              : row.metode_pembayaran === "cash"
                              ? "💵 Cash"
                              : row.metode_pembayaran === "qris"
                              ? "📱 QRIS"
                              : "📋 Kasbon"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="min-w-[150px] z-50">
                          <SelectGroup>
                            <SelectItem value="transfer">🏦 Transfer Bank</SelectItem>
                            <SelectItem value="cash">💵 Cash / Tunai</SelectItem>
                            <SelectItem value="qris">📱 QRIS</SelectItem>
                            <SelectItem value="kasbon">📋 Kasbon</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 5. Nominal (Rp) & Tombol Hapus */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                      <Input
                        type="text"
                        placeholder="Rp 0"
                        value={row.nominal}
                        onChange={(e) => handleRowChange(index, "nominal", e.target.value)}
                        className={`text-xs font-bold text-right ${
                          isIncome ? "text-emerald-700" : "text-rose-700"
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(index)}
                        className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Popover Pencarian Proyek / Gaji */}
        {activePickerRowIndex !== null && pickerType && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs"
            ref={pickerRef}
          >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  {pickerType === "proyek" ? "Pilih Invoice Proyek Selesai" : "Pilih Slip Gaji Tim"}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setActivePickerRowIndex(null);
                    setPickerType(null);
                  }}
                  className="size-6 text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="relative my-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={pickerType === "proyek" ? "Cari nomor INV atau nama klien..." : "Cari kode slip gaji atau tim..."}
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {pickerType === "proyek" ? (
                  filteredOrders.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">Tidak ada invoice proyek yang cocok.</p>
                  ) : (
                    filteredOrders.map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => handlePickOrder(activePickerRowIndex, ord)}
                        className="flex w-full items-start justify-between rounded-xl border border-slate-100 p-2.5 text-left text-xs hover:border-emerald-300 hover:bg-emerald-50/60 transition"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-bold text-slate-900">{ord.invoice_no}</span>
                          <span className="text-slate-600 ml-1">· {ord.initial_service}</span>
                          {ord.customer_name && <p className="text-[11px] text-slate-400">Klien: {ord.customer_name}</p>}
                        </div>
                        <span className="font-bold text-emerald-700 shrink-0">{ord.total_amount}</span>
                      </button>
                    ))
                  )
                ) : filteredGaji.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Tidak ada slip gaji yang cocok.</p>
                ) : (
                  filteredGaji.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handlePickGaji(activePickerRowIndex, g)}
                      className="flex w-full items-start justify-between rounded-xl border border-slate-100 p-2.5 text-left text-xs hover:border-rose-300 hover:bg-rose-50/60 transition"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-slate-900">{g.kode_gaji}</span>
                        <span className="text-slate-600 ml-1">· {g.team_name}</span>
                        <p className="text-[11px] text-slate-400">{g.team_skill}</p>
                      </div>
                      <span className="font-bold text-rose-700 shrink-0">{g.total_gaji}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Tiga Kotak Ringkasan Saldo di Bawah Sesuai Gambar Referensi */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          {/* Card 1: TOTAL PEMASUKAN */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              TOTAL PEMASUKAN
            </span>
            <span className="mt-1 text-2xl font-black text-emerald-600">
              {totalPemasukanStr}
            </span>
          </div>

          {/* Card 2: TOTAL PENGELUARAN */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              TOTAL PENGELUARAN
            </span>
            <span className="mt-1 text-2xl font-black text-rose-600">
              {totalPengeluaranStr}
            </span>
          </div>

          {/* Card 3: SALDO BERSIH (SOLID DARK CARD SESUAI REFERENSI) */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-900 bg-[#060b1c] p-5 shadow-md text-center text-white">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              SALDO BERSIH
            </span>
            <span className="mt-1 text-2xl font-black text-emerald-400 tracking-tight">
              {saldoBersihStr}
            </span>
          </div>
        </div>

        {/* 5. Footer Bawah */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
          <div className="flex-1 max-w-lg space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
              <Info className="size-3.5 shrink-0" />
              <span>Semua data terenkripsi dan disimpan otomatis. Tambahkan catatan laporan...</span>
            </div>
            <Input
              type="text"
              placeholder="Catatan tambahan laporan transaksi / rekening transfer..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="text-xs text-slate-600 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end">
            <Select value={status} onValueChange={(val) => setStatus((val as any) || "draft")}>
              <SelectTrigger className="w-[170px] text-xs font-semibold text-slate-800">
                <span>{status === "lunas" ? "🟢 Lunas (Selesai)" : "🟡 Draft (Sementara)"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="draft">🟡 Draft (Sementara)</SelectItem>
                  <SelectItem value="lunas">🟢 Lunas (Selesai)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={handleSaveReport}
              disabled={saving}
              className="gap-2 bg-[#060b1c] hover:bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              <Save className="size-4" />
              {saving ? "Menyimpan..." : "SIMPAN LAPORAN"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
