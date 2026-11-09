"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
  Plus,
  Receipt,
  Save,
  Search,
  Trash2,
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
  listAvailableOrdersForKeuangan,
  listAvailableGajiForKeuangan,
  type JurnalKeuangan,
  type KategoriKeuangan,
  type CreateJurnalPayload,
  type UpdateJurnalPayload,
  type KeuanganAvailableOrder,
  type KeuanganAvailableGaji,
} from "@/lib/keuangan";
import type { Order } from "@/lib/orders";
import type { Gaji } from "@/lib/gaji";

type CatatFinansialEditorProps = {
  jurnal: JurnalKeuangan | null; // null = catat baru
  categories: KategoriKeuangan[];
  orders?: (Order | KeuanganAvailableOrder)[];
  gajiList?: (Gaji | KeuanganAvailableGaji)[];
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
  orders = [],
  gajiList = [],
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

  // Referensi Tersedia (Anti-Duplikasi dengan Database)
  const [availableOrders, setAvailableOrders] = useState<(Order | KeuanganAvailableOrder)[]>(orders);
  const [availableGaji, setAvailableGaji] = useState<(Gaji | KeuanganAvailableGaji)[]>(gajiList);

  // Popover Picker Proyek / Gaji
  const [activePickerRowIndex, setActivePickerRowIndex] = useState<number | null>(null);
  const [pickerType, setPickerType] = useState<"proyek" | "gaji" | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

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

  // Muat opsi proyek & gaji yang tersedia (mengecualikan yang sudah pernah dibukukan di kas lain)
  useEffect(() => {
    let active = true;
    const fetchAvailableData = async () => {
      try {
        const [ords, gjs] = await Promise.all([
          listAvailableOrdersForKeuangan(jurnal?.id),
          listAvailableGajiForKeuangan(jurnal?.id),
        ]);
        if (active) {
          setAvailableOrders(ords);
          setAvailableGaji(gjs);
        }
      } catch (err) {
        console.error("Gagal sinkron data referensi kas", err);
      }
    };
    fetchAvailableData();
    return () => {
      active = false;
    };
  }, [jurnal?.id]);

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

  // Inisialisasi data form
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

  // Tarik dari Proyek (format minimalis tanpa nama klien)
  const handlePickOrder = (index: number, ord: Order | KeuanganAvailableOrder) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const desc = `Pelunasan ${ord.invoice_no} - ${ord.initial_service}`;
        const autoKat = categories.find(
          (c) =>
            c.tipe === "pemasukan" &&
            (c.nama_kategori.toLowerCase().includes("proyek") ||
              c.nama_kategori.toLowerCase().includes("instalasi"))
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

  // Tarik dari Slip Gaji (format minimalis tanpa skill)
  const handlePickGaji = (index: number, g: Gaji | KeuanganAvailableGaji) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const desc = `Pencairan Gaji ${g.kode_gaji} - ${g.team_name}`;
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

  // Filter Orders in Picker (Anti-Duplikasi Antar-Baris)
  const filteredOrders = useMemo(() => {
    const otherSelectedOrderIds = rows
      .filter((_, i) => i !== activePickerRowIndex)
      .map((r) => r.order_id)
      .filter(Boolean);

    const available = availableOrders.filter((o) => !otherSelectedOrderIds.includes(o.id));

    if (!pickerQuery.trim()) return available;
    const q = pickerQuery.toLowerCase();
    return available.filter(
      (o) =>
        o.invoice_no?.toLowerCase().includes(q) ||
        o.initial_service?.toLowerCase().includes(q)
    );
  }, [availableOrders, rows, activePickerRowIndex, pickerQuery]);

  // Filter Gaji in Picker (Anti-Duplikasi Antar-Baris)
  const filteredGaji = useMemo(() => {
    const otherSelectedGajiIds = rows
      .filter((_, i) => i !== activePickerRowIndex)
      .map((r) => r.gaji_id)
      .filter(Boolean);

    const available = availableGaji.filter((g) => !otherSelectedGajiIds.includes(g.id));

    if (!pickerQuery.trim()) return available;
    const q = pickerQuery.toLowerCase();
    return available.filter(
      (g) =>
        g.kode_gaji?.toLowerCase().includes(q) ||
        g.team_name?.toLowerCase().includes(q)
    );
  }, [availableGaji, rows, activePickerRowIndex, pickerQuery]);

  // Submit Handler
  const handleSaveReport = async () => {
    if (rows.length === 0) {
      toast.add({ title: "Gagal menyimpan", description: "Minimal masukkan 1 baris transaksi.", type: "error" });
      return;
    }

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

    // Validasi anti-duplikasi proyek dan gaji dalam form
    const seenOrders = new Set<string>();
    const seenGaji = new Set<string>();
    for (const r of rows) {
      if (r.order_id) {
        if (seenOrders.has(r.order_id)) {
          toast.add({
            title: "Proyek Duplikat",
            description: `Invoice ${r.invoice_no || "proyek"} dipilih lebih dari satu kali.`,
            type: "error",
          });
          return;
        }
        seenOrders.add(r.order_id);
      }
      if (r.gaji_id) {
        if (seenGaji.has(r.gaji_id)) {
          toast.add({
            title: "Slip Gaji Duplikat",
            description: `Slip gaji ${r.kode_gaji || "tim"} dipilih lebih dari satu kali.`,
            type: "error",
          });
          return;
        }
        seenGaji.add(r.gaji_id);
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
        toast.add({ title: "Laporan Dibukukan", description: "Laporan kas baru berhasil dicatat.", type: "success" });
      }
      onBackToHistory();
    } catch (err: unknown) {
      toast.add({ title: "Gagal menyimpan", description: err instanceof Error ? err.message : "", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Bersih & Minimalis */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToHistory}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Kembali ke Jurnal Transaksi"
          >
            ‹
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isEdit ? `Edit Nota ${kodeJurnal}` : "Catat Transaksi Kas"}
            </h1>
            <p className="text-xs text-slate-500">
              Kelola rincian kas masuk dan kas keluar operasional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToHistory}
            className="gap-1.5 text-xs font-medium text-slate-700"
          >
            <Clock className="size-3.5 text-slate-400" />
            Riwayat Jurnal
          </Button>
        </div>
      </div>

      {/* 2. Top Card Metadata Nota (3 Kolom Bersih & Ringkas) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Tanggal & Waktu */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-slate-400" />
              Tanggal & Waktu
            </label>
            <Input
              type="datetime-local"
              value={waktuTransaksi}
              onChange={(e) => setWaktuTransaksi(e.target.value)}
              className="text-xs text-slate-800"
            />
          </div>

          {/* No. Nota */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Receipt className="size-3.5 text-slate-400" />
              No. Nota
            </label>
            <Input
              type="text"
              readOnly
              value={kodeJurnal || "Memuat..."}
              className="text-xs font-mono font-semibold text-slate-900 bg-slate-50/80 cursor-default"
            />
          </div>

          {/* Judul Lembar Kas */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <FileText className="size-3.5 text-slate-400" />
              Judul Kas
            </label>
            <Input
              type="text"
              placeholder="Contoh: Rekap Kas Harian Operasional"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 3. Card Utama: Rincian Transaksi */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3.5">
        {/* Sub-Header Baris & Tombol Tambah */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Rincian Transaksi ({rows.length})
          </h3>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddPemasukan}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 h-8 rounded-lg shadow-xs transition"
            >
              <Plus className="size-3.5" />
              Pemasukan
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddPengeluaran}
              className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 h-8 rounded-lg shadow-xs transition"
            >
              <Plus className="size-3.5" />
              Pengeluaran
            </Button>
          </div>
        </div>

        {/* Tabel Baris Transaksi */}
        <div className="space-y-2">
          {/* Header Kolom Mini */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2.5 px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">Tipe</div>
            <div className="col-span-5">Keterangan / Sumber</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2">Metode</div>
            <div className="col-span-2 text-right pr-8">Nominal</div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
              Belum ada baris transaksi. Klik tombol <strong>+ Pemasukan</strong> atau <strong>+ Pengeluaran</strong>.
            </div>
          ) : (
            rows.map((row, index) => {
              const isIncome = row.tipe === "pemasukan";

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
                  className="rounded-lg border border-slate-200/80 bg-white p-2 hover:border-slate-300 transition"
                >
                  <div className="grid gap-2 sm:grid-cols-12 items-center">
                    {/* 1. Tipe Icon */}
                    <div className="sm:col-span-1 flex justify-center">
                      <div
                        className={`flex size-7 items-center justify-center rounded-md border font-bold ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                        title={isIncome ? "Pemasukan" : "Pengeluaran"}
                      >
                        {isIncome ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                      </div>
                    </div>

                    {/* 2. Keterangan + Tombol Tarik Ringkas */}
                    <div className="sm:col-span-5 relative flex items-center">
                      <Input
                        type="text"
                        placeholder={isIncome ? "Keterangan pemasukan..." : "Keterangan pengeluaran..."}
                        value={row.deskripsi}
                        onChange={(e) => handleRowChange(index, "deskripsi", e.target.value)}
                        className="text-xs font-medium text-slate-800 pr-24 h-8"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActivePickerRowIndex(index);
                          setPickerType(isIncome ? "proyek" : "gaji");
                          setPickerQuery("");
                        }}
                        className={`absolute right-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        }`}
                      >
                        {isIncome ? "Tarik Proyek" : "Tarik Gaji"}
                      </button>
                    </div>

                    {/* 3. Kategori Akun */}
                    <div className="sm:col-span-2">
                      <Select
                        value={row.kategori_id || ""}
                        onValueChange={(val) => handleRowChange(index, "kategori_id", val || "")}
                      >
                        <SelectTrigger className="w-full text-xs font-medium text-slate-800 h-8">
                          <span className="truncate">
                            {selectedKat ? selectedKat.nama_kategori : "Pilih Kategori"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="max-h-56 min-w-[220px] z-50">
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

                    {/* 4. Metode Pembayaran (Teks Bersih) */}
                    <div className="sm:col-span-2">
                      <Select
                        value={row.metode_pembayaran}
                        onValueChange={(val) =>
                          handleRowChange(index, "metode_pembayaran", (val as RowItem["metode_pembayaran"]) || "transfer")
                        }
                      >
                        <SelectTrigger className="w-full text-xs font-medium text-slate-800 h-8">
                          <span className="truncate">
                            {row.metode_pembayaran === "transfer"
                              ? "Transfer Bank"
                              : row.metode_pembayaran === "cash"
                              ? "Tunai / Cash"
                              : row.metode_pembayaran === "qris"
                              ? "QRIS"
                              : "Kasbon"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="min-w-[140px] z-50">
                          <SelectGroup>
                            <SelectItem value="transfer">Transfer Bank</SelectItem>
                            <SelectItem value="cash">Tunai / Cash</SelectItem>
                            <SelectItem value="qris">QRIS</SelectItem>
                            <SelectItem value="kasbon">Kasbon</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 5. Nominal (Rp) & Hapus */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-1">
                      <Input
                        type="text"
                        placeholder="Rp 0"
                        value={row.nominal}
                        onChange={(e) => handleRowChange(index, "nominal", e.target.value)}
                        className={`text-xs font-semibold text-right tabular-nums h-8 ${
                          isIncome ? "text-emerald-700" : "text-rose-700"
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(index)}
                        className="size-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Popover Minimalis: Pilih Proyek / Slip Gaji */}
        {activePickerRowIndex !== null && pickerType && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs"
            ref={pickerRef}
          >
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {pickerType === "proyek" ? "Pilih Invoice Proyek Selesai" : "Pilih Slip Gaji Tim"}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setActivePickerRowIndex(null);
                    setPickerType(null);
                  }}
                  className="size-6 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="relative my-2.5">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={pickerType === "proyek" ? "Cari nomor invoice..." : "Cari kode slip gaji atau nama tim..."}
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-slate-800 focus:bg-white"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {pickerType === "proyek" ? (
                  filteredOrders.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">
                      Tidak ada invoice proyek selesai yang tersedia.
                    </p>
                  ) : (
                    filteredOrders.map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => handlePickOrder(activePickerRowIndex, ord)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-xs hover:border-emerald-300 hover:bg-emerald-50/50 transition"
                      >
                        <div className="min-w-0 flex items-center gap-1.5 truncate pr-2">
                          <span className="font-semibold text-slate-900">{ord.invoice_no}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 truncate">{ord.initial_service}</span>
                        </div>
                        <span className="font-bold text-emerald-600 tabular-nums shrink-0">
                          {ord.total_amount}
                        </span>
                      </button>
                    ))
                  )
                ) : filteredGaji.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Tidak ada slip gaji yang tersedia.
                  </p>
                ) : (
                  filteredGaji.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handlePickGaji(activePickerRowIndex, g)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-xs hover:border-rose-300 hover:bg-rose-50/50 transition"
                    >
                      <div className="min-w-0 flex items-center gap-1.5 truncate pr-2">
                        <span className="font-semibold text-slate-900">{g.kode_gaji}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 truncate">{g.team_name}</span>
                      </div>
                      <span className="font-bold text-rose-600 tabular-nums shrink-0">
                        {g.total_gaji}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Strip Ringkasan Akun Kas Ringkas & Elegan (Menggantikan 3 Card Raksasa) */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-5 rounded-lg border border-slate-200/80 bg-slate-50/70 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Pemasukan:</span>
            <span className="font-bold text-emerald-600 tabular-nums">{totalPemasukanStr}</span>
          </div>
          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Pengeluaran:</span>
            <span className="font-bold text-rose-600 tabular-nums">{totalPengeluaranStr}</span>
          </div>
          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-700 font-semibold">Saldo Bersih:</span>
            <span className={`font-bold tabular-nums ${saldoBersihNum >= 0 ? "text-slate-900" : "text-rose-600"}`}>
              {saldoBersihStr}
            </span>
          </div>
        </div>

        {/* 5. Footer Bawah */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Catatan tambahan nota kas..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="text-xs text-slate-700 h-8"
            />
          </div>

          <div className="flex items-center gap-2 self-end">
            <Select value={status} onValueChange={(val) => setStatus((val as "draft" | "lunas") || "draft")}>
              <SelectTrigger className="w-[120px] text-xs font-semibold text-slate-800 h-8">
                <span>{status === "lunas" ? "Lunas" : "Draft"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={handleSaveReport}
              disabled={saving}
              className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 h-8 rounded-lg shadow-sm transition"
            >
              <Save className="size-3.5" />
              {saving ? "Menyimpan..." : "Simpan Nota"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
