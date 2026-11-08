"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Briefcase,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Plus,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FormDialog } from "@/components/dashboard/dialogs/FormDialog";
import { toast } from "@/components/ui/toast";
import type {
  JurnalKeuangan,
  KategoriKeuangan,
  CreateJurnalPayload,
  UpdateJurnalPayload,
} from "@/lib/keuangan";
import type { Order } from "@/lib/orders";
import type { Gaji } from "@/lib/gaji";

type JurnalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jurnal: JurnalKeuangan | null; // null = buat baru
  categories: KategoriKeuangan[];
  orders: Order[];
  gajiList: Gaji[];
  onSubmitCreate: (payload: CreateJurnalPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateJurnalPayload) => Promise<void>;
};

function formatRupiahInput(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export function JurnalDialog({
  open,
  onOpenChange,
  jurnal,
  categories,
  orders,
  gajiList,
  onSubmitCreate,
  onSubmitUpdate,
}: JurnalDialogProps) {
  const isEdit = Boolean(jurnal);

  // Sumber mode: 'manual', 'proyek', 'gaji'
  const [sumberMode, setSumberMode] = useState<"manual" | "proyek" | "gaji">("manual");

  // State Form
  const [tipe, setTipe] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [judul, setJudul] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [pembayaran, setPembayaran] = useState<"transfer" | "cash" | "kasbon">("transfer");
  const [nominal, setNominal] = useState("");
  const [status, setStatus] = useState<"lunas" | "pending">("lunas");
  const [tanggal, setTanggal] = useState("");
  const [catatan, setCatatan] = useState("");

  // Relasi ID
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedGajiId, setSelectedGajiId] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filter di popover proyek & gaji
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const orderDropdownRef = useRef<HTMLDivElement>(null);

  const [gajiSearchQuery, setGajiSearchQuery] = useState("");
  const [showGajiDropdown, setShowGajiDropdown] = useState(false);
  const gajiDropdownRef = useRef<HTMLDivElement>(null);

  // Filter Kategori sesuai Tipe
  const availableCategories = useMemo(() => {
    return categories.filter((c) => c.tipe === tipe);
  }, [categories, tipe]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target as Node)) {
        setShowOrderDropdown(false);
      }
      if (gajiDropdownRef.current && !gajiDropdownRef.current.contains(event.target as Node)) {
        setShowGajiDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inisialisasi data
  useEffect(() => {
    if (jurnal) {
      setSumberMode(jurnal.sumber || "manual");
      setTipe(jurnal.tipe);
      setJudul(jurnal.judul);
      setKategoriId(jurnal.kategori_id || "");
      setPembayaran(jurnal.metode_pembayaran || "transfer");
      setNominal(jurnal.nominal);
      setStatus((jurnal.status as "lunas" | "pending") || "lunas");
      setTanggal(jurnal.tanggal);
      setCatatan(jurnal.catatan || "");
      setSelectedOrderId(jurnal.order_id || "");
      setSelectedGajiId(jurnal.gaji_id || "");
    } else {
      setSumberMode("manual");
      setTipe("pemasukan");
      setJudul("");
      const firstKat = categories.find((c) => c.tipe === "pemasukan");
      setKategoriId(firstKat ? firstKat.id : "");
      setPembayaran("transfer");
      setNominal("");
      setStatus("lunas");
      setTanggal(new Date().toISOString().split("T")[0]);
      setCatatan("");
      setSelectedOrderId("");
      setSelectedGajiId("");
    }
    setError(null);
  }, [jurnal, open, categories]);

  // Alur 1: Saat Memilih Proyek / Invoice (Otomatisasi Pemasukan)
  const handleSelectOrder = (ord: Order) => {
    setSelectedOrderId(ord.id);
    setSelectedGajiId("");
    setTipe("pemasukan");
    const cust = ord.customer_name ? ` (${ord.customer_name})` : "";
    setJudul(`Pelunasan Invoice ${ord.invoice_no} - ${ord.initial_service || "Layanan AC"}${cust}`);

    // Auto set nominal dari invoice deal
    if (ord.total_amount) {
      setNominal(formatRupiahInput(ord.total_amount));
    }

    // Auto set kategori pendapatan proyek
    const proyekKat = categories.find(
      (c) => c.tipe === "pemasukan" && (c.nama_kategori.toLowerCase().includes("proyek") || c.nama_kategori.toLowerCase().includes("instalasi"))
    ) || categories.find((c) => c.tipe === "pemasukan");
    if (proyekKat) setKategoriId(proyekKat.id);

    setShowOrderDropdown(false);
  };

  // Alur 2: Saat Memilih Slip Gaji (Otomatisasi Pengeluaran)
  const handleSelectGaji = (g: Gaji) => {
    setSelectedGajiId(g.id);
    setSelectedOrderId("");
    setTipe("pengeluaran");
    setJudul(`Pencairan Gaji ${g.kode_gaji} - ${g.team_name}`);

    // Auto set nominal dari total gaji
    if (g.total_gaji) {
      setNominal(formatRupiahInput(g.total_gaji));
    }

    // Auto set kategori gaji & upah
    const gajiKat = categories.find(
      (c) => c.tipe === "pengeluaran" && c.nama_kategori.toLowerCase().includes("gaji")
    ) || categories.find((c) => c.tipe === "pengeluaran");
    if (gajiKat) setKategoriId(gajiKat.id);

    setShowGajiDropdown(false);
  };

  // Switcher Mode Cepat
  const handleSwitchMode = (mode: "manual" | "proyek" | "gaji") => {
    setSumberMode(mode);
    if (mode === "proyek") {
      setTipe("pemasukan");
      setSelectedGajiId("");
    } else if (mode === "gaji") {
      setTipe("pengeluaran");
      setSelectedOrderId("");
    } else {
      setSelectedOrderId("");
      setSelectedGajiId("");
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      setError("Judul transaksi wajib diisi.");
      return;
    }
    const cleanNominal = nominal.replace(/\D/g, "");
    if (!cleanNominal || parseInt(cleanNominal, 10) <= 0) {
      setError("Nominal transaksi harus lebih dari 0.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const payload: CreateJurnalPayload = {
        tipe,
        judul: judul.trim(),
        kategori_id: kategoriId || undefined,
        metode_pembayaran: pembayaran,
        nominal: formatRupiahInput(cleanNominal),
        status,
        tanggal: tanggal || new Date().toISOString().split("T")[0],
        sumber: sumberMode,
        order_id: selectedOrderId || undefined,
        gaji_id: selectedGajiId || undefined,
        catatan: catatan.trim(),
      };

      if (isEdit && jurnal) {
        await onSubmitUpdate(jurnal.id, payload);
        toast.add({ title: "Jurnal Diperbarui", description: `Transaksi ${jurnal.kode_jurnal} berhasil disimpan.`, type: "success" });
      } else {
        await onSubmitCreate(payload);
        toast.add({ title: "Jurnal Dicatat", description: "Transaksi kas baru berhasil dibukukan.", type: "success" });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  };

  // Selected Order Object
  const currentSelectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  // Selected Gaji Object
  const currentSelectedGaji = useMemo(
    () => gajiList.find((g) => g.id === selectedGajiId),
    [gajiList, selectedGajiId]
  );

  // Filtered orders in popover
  const filteredOrders = useMemo(() => {
    if (!orderSearchQuery.trim()) return orders;
    const q = orderSearchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.invoice_no?.toLowerCase().includes(q) ||
        o.initial_service?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q)
    );
  }, [orders, orderSearchQuery]);

  // Filtered gaji in popover
  const filteredGaji = useMemo(() => {
    if (!gajiSearchQuery.trim()) return gajiList;
    const q = gajiSearchQuery.toLowerCase();
    return gajiList.filter(
      (g) =>
        g.kode_gaji?.toLowerCase().includes(q) ||
        g.team_name?.toLowerCase().includes(q) ||
        g.team_skill?.toLowerCase().includes(q)
    );
  }, [gajiList, gajiSearchQuery]);

  const selectedCategoryObj = categories.find((c) => c.id === kategoriId);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit Jurnal ${jurnal?.kode_jurnal}` : "Catat Transaksi Kas Baru"}
      description="Pilih sumber transaksi (proyek, slip gaji, atau manual) agar data terisi secara otomatis."
      icon={<Receipt className="size-4" />}
      busy={busy}
      error={error}
      className="sm:max-w-2xl"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
          >
            {busy ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Bukukan Transaksi"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {/* Switcher 3 Opsi Cepat */}
        {!isEdit && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <label className="text-[11px] font-bold text-slate-600 block mb-2">
              PILIH METODE INPUT CEPAT:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchMode("manual")}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-semibold transition ${
                  sumberMode === "manual"
                    ? "border-slate-900 bg-white text-slate-900 shadow-2xs"
                    : "border-slate-200/80 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-900"
                }`}
              >
                <Wallet className="size-4 text-slate-600" />
                Input Manual
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("proyek")}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-semibold transition ${
                  sumberMode === "proyek"
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-800 shadow-2xs"
                    : "border-slate-200/80 bg-white/60 text-slate-500 hover:bg-white hover:text-emerald-700"
                }`}
              >
                <ArrowDownRight className="size-4 text-emerald-600" />
                Tarik Proyek (Masuk)
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode("gaji")}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-semibold transition ${
                  sumberMode === "gaji"
                    ? "border-rose-600 bg-rose-50/80 text-rose-800 shadow-2xs"
                    : "border-slate-200/80 bg-white/60 text-slate-500 hover:bg-white hover:text-rose-700"
                }`}
              >
                <ArrowUpRight className="size-4 text-rose-600" />
                Tarik Gaji (Keluar)
              </button>
            </div>
          </div>
        )}

        {/* Dropdown Tarik Proyek (Jika Mode Proyek) */}
        {sumberMode === "proyek" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 relative" ref={orderDropdownRef}>
            <label className="text-[11px] font-semibold text-emerald-900 block mb-1">
              Pilih Invoice Proyek Deal / Selesai:
            </label>
            <button
              type="button"
              onClick={() => setShowOrderDropdown((prev) => !prev)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs text-left shadow-2xs hover:border-emerald-400"
            >
              <span className="truncate pr-2 font-medium">
                {currentSelectedOrder ? (
                  <span className="text-slate-900">
                    <span className="font-bold text-emerald-800">{currentSelectedOrder.invoice_no}</span>
                    {" · "}
                    {currentSelectedOrder.initial_service}
                    {currentSelectedOrder.customer_name ? ` (${currentSelectedOrder.customer_name})` : ""}
                    {" — "}
                    <span className="font-bold text-emerald-700">{currentSelectedOrder.total_amount}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Pilih Invoice Proyek...</span>
                )}
              </span>
              <ChevronDown className="size-4 shrink-0 text-emerald-600" />
            </button>

            {showOrderDropdown && (
              <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-0">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari nomor INV atau nama klien..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredOrders.length === 0 ? (
                    <div className="py-3 text-center text-xs text-slate-400">
                      Tidak ada proyek yang cocok.
                    </div>
                  ) : (
                    filteredOrders.map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => handleSelectOrder(ord)}
                        className="flex w-full items-start justify-between rounded-md p-2 text-left text-xs hover:bg-emerald-50 transition"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-bold text-slate-900">{ord.invoice_no}</span>
                          <span className="text-slate-600 ml-1">· {ord.initial_service}</span>
                          {ord.customer_name && (
                            <p className="text-[11px] text-slate-400">Klien: {ord.customer_name}</p>
                          )}
                        </div>
                        <span className="font-bold text-emerald-700 shrink-0">{ord.total_amount}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dropdown Tarik Slip Gaji (Jika Mode Gaji) */}
        {sumberMode === "gaji" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 relative" ref={gajiDropdownRef}>
            <label className="text-[11px] font-semibold text-rose-900 block mb-1">
              Pilih Slip Gaji Tim:
            </label>
            <button
              type="button"
              onClick={() => setShowGajiDropdown((prev) => !prev)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-left shadow-2xs hover:border-rose-400"
            >
              <span className="truncate pr-2 font-medium">
                {currentSelectedGaji ? (
                  <span className="text-slate-900">
                    <span className="font-bold text-rose-800">{currentSelectedGaji.kode_gaji}</span>
                    {" · "}
                    {currentSelectedGaji.team_name} ({currentSelectedGaji.team_skill})
                    {" — "}
                    <span className="font-bold text-rose-700">{currentSelectedGaji.total_gaji}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Pilih Slip Gaji...</span>
                )}
              </span>
              <ChevronDown className="size-4 shrink-0 text-rose-600" />
            </button>

            {showGajiDropdown && (
              <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-0">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari kode slip gaji atau nama tim..."
                    value={gajiSearchQuery}
                    onChange={(e) => setGajiSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredGaji.length === 0 ? (
                    <div className="py-3 text-center text-xs text-slate-400">
                      Tidak ada slip gaji yang cocok.
                    </div>
                  ) : (
                    filteredGaji.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGaji(g)}
                        className="flex w-full items-start justify-between rounded-md p-2 text-left text-xs hover:bg-rose-50 transition"
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
            )}
          </div>
        )}

        {/* Tipe & Judul Transaksi */}
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Arus Kas <span className="text-rose-500">*</span>
            </label>
            <Select
              value={tipe}
              onValueChange={(val) => setTipe((val as "pemasukan" | "pengeluaran") || "pemasukan")}
            >
              <SelectTrigger className="w-full text-xs">
                <span>
                  {tipe === "pemasukan" ? "🟢 Pemasukan (+)" : "🔴 Pengeluaran (-)"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="pemasukan">🟢 Pemasukan (+)</SelectItem>
                  <SelectItem value="pengeluaran">🔴 Pengeluaran (-)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-8 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Judul / Deskripsi Transaksi <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Pelunasan Invoice INV-2611-0006"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="text-xs font-medium"
            />
          </div>
        </div>

        {/* Kategori & Metode Pembayaran */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Kategori Akun
            </label>
            <Select
              value={kategoriId}
              onValueChange={(val) => setKategoriId(val || "")}
            >
              <SelectTrigger className="w-full text-xs">
                <span className="truncate">
                  {selectedCategoryObj ? selectedCategoryObj.nama_kategori : "Pilih Kategori"}
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-56">
                <SelectGroup>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nama_kategori}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Metode Pembayaran
            </label>
            <Select
              value={pembayaran}
              onValueChange={(val) => setPembayaran((val as "transfer" | "cash" | "kasbon") || "transfer")}
            >
              <SelectTrigger className="w-full text-xs">
                <span>
                  {pembayaran === "transfer"
                    ? "🏦 Transfer Bank"
                    : pembayaran === "cash"
                    ? "💵 Cash / Tunai"
                    : "📋 Kasbon"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="transfer">🏦 Transfer Bank</SelectItem>
                  <SelectItem value="cash">💵 Cash / Tunai</SelectItem>
                  <SelectItem value="kasbon">📋 Kasbon</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nominal, Tanggal & Status */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Nominal Uang (Rp) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: 1.500.000"
              value={nominal}
              onChange={(e) => setNominal(formatRupiahInput(e.target.value))}
              className={`text-xs font-bold ${
                tipe === "pemasukan" ? "text-emerald-700" : "text-rose-700"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tanggal Transaksi
            </label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Status Transaksi
            </label>
            <Select
              value={status}
              onValueChange={(val) => setStatus((val as "lunas" | "pending") || "lunas")}
            >
              <SelectTrigger className="w-full text-xs">
                <span>
                  {status === "lunas" ? "🟢 Lunas (Selesai)" : "🟡 Pending (Tertunda)"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="lunas">🟢 Lunas (Selesai)</SelectItem>
                  <SelectItem value="pending">🟡 Pending (Tertunda)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Catatan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Catatan Tambahan (Opsional)
          </label>
          <Textarea
            rows={2}
            placeholder="Keterangan transfer, nomor rekening, atau bukti pembayaran..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="text-xs"
          />
        </div>
      </form>
    </FormDialog>
  );
}
