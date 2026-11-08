"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Check,
  ChevronDown,
  Copy,
  Plus,
  Search,
  Trash2,
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
import {
  listAvailableOrdersForGaji,
  type Gaji,
  type CreateGajiPayload,
  type UpdateGajiPayload,
} from "@/lib/gaji";
import type { TeamMemberItem } from "@/lib/teamMembers";
import type { Order } from "@/lib/orders";
import { formatDate } from "@/lib/dashboard/format";

type ProjectRow = {
  id?: string; // id gaji_proyek jika sudah ada di DB
  order_id: string;
  nominal: string;
  keterangan: string;
};

type GajiDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gaji: Gaji | null; // null = buat baru
  teamList: TeamMemberItem[];
  orderList: Order[]; // hanya order yang statusnya selesai/closing
  onSubmitCreate: (payload: CreateGajiPayload) => Promise<void>;
  onSubmitUpdate: (
    id: string,
    payload: UpdateGajiPayload
  ) => Promise<void>;
};

function formatRupiahInput(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return `Rp ${num.toLocaleString("id-ID")}`;
}

/**
 * Dropdown pemilih proyek dengan fitur pencarian kode INV, nama proyek, atau nama klien.
 * Menampilkan label deskriptif yang rapi tanpa pernah menampilkan kode UUID.
 */
function SearchableProjectSelect({
  value,
  onChange,
  orders,
}: {
  value: string;
  onChange: (orderId: string) => void;
  orders: Order[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === value),
    [orders, value]
  );

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter order berdasarkan invoice_no, nama layanan, atau nama klien
  const filteredOrders = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.invoice_no?.toLowerCase().includes(q) ||
        o.initial_service?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q)
    );
  }, [orders, query]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Tombol Trigger Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-left shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <span className="truncate pr-2 font-medium">
          {selectedOrder ? (
            <span className="text-slate-900">
              <span className="font-bold text-slate-900">
                {selectedOrder.invoice_no}
              </span>
              {" · "}
              <span className="text-slate-700">
                {selectedOrder.initial_service || "Layanan Proyek"}
              </span>
              {selectedOrder.customer_name ? (
                <span className="text-slate-500">
                  {" "}
                  ({selectedOrder.customer_name})
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-slate-400">
              Pilih Invoice Proyek Selesai...
            </span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-slate-400" />
      </button>

      {/* Popover Pencarian & List Proyek */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[290px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Kolom Search by Kode INV */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Cari kode INV (mis: INV-2611) atau nama..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* List Proyek */}
          <div className="max-h-52 overflow-y-auto space-y-1">
            {filteredOrders.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                {orders.length === 0 ? (
                  <span>
                    Belum ada proyek dengan status <strong>Selesai</strong> (closing).
                  </span>
                ) : (
                  <span>Tidak ada proyek yang sesuai dengan kata kunci.</span>
                )}
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = ord.id === value;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      onChange(ord.id);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-start justify-between rounded-md p-2 text-left text-xs transition ${
                      isSelected
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {ord.invoice_no}
                        </span>
                        <span className="truncate text-slate-700">
                          · {ord.initial_service || "Layanan Proyek"}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        {ord.customer_name && (
                          <span className="truncate">
                            Klien: {ord.customer_name}
                          </span>
                        )}
                        <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          Selesai
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GajiDialog({
  open,
  onOpenChange,
  gaji,
  teamList,
  orderList,
  onSubmitCreate,
  onSubmitUpdate,
}: GajiDialogProps) {
  const isEdit = Boolean(gaji);

  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState<"draft" | "dibayar">("draft");
  const [catatan, setCatatan] = useState("");
  const [proyekRows, setProyekRows] = useState<ProjectRow[]>([]);
  const [deletedProyekIds, setDeletedProyekIds] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proyek yang siap digajikan (hanya yang belum digajikan di slip lain)
  const [availableOrdersFromBackend, setAvailableOrdersFromBackend] = useState<Order[]>([]);

  // Ambil daftar proyek yang belum pernah digajikan setiap kali modal dibuka
  useEffect(() => {
    if (open) {
      listAvailableOrdersForGaji(gaji ? gaji.id : undefined)
        .then((data) => {
          setAvailableOrdersFromBackend(data);
        })
        .catch((err) => {
          console.error("Gagal memuat proyek yang tersedia", err);
        });
    }
  }, [open, gaji]);

  // Gabungkan proyek un-gajied dengan proyek yang sudah terpasang di slip gaji ini (saat mode edit)
  const allAvailableOrders = useMemo(() => {
    const map = new Map<string, Order>();
    for (const ord of availableOrdersFromBackend) {
      map.set(ord.id, ord);
    }
    if (gaji && gaji.proyek) {
      for (const p of gaji.proyek) {
        if (!map.has(p.order_id)) {
          map.set(p.order_id, {
            id: p.order_id,
            invoice_no: p.invoice_no || "INV-PROYEK",
            initial_service: p.nama_layanan || "Layanan Proyek",
            customer_name: p.nama_customer || "",
            status: "selesai",
            initial_category: "",
            initial_price: "",
            total_amount: p.nominal,
            items: [],
            created_at: p.created_at || "",
            updated_at: p.updated_at || "",
          });
        }
      }
    }
    return Array.from(map.values());
  }, [availableOrdersFromBackend, gaji]);

  // Inisialisasi state saat dialog dibuka
  useEffect(() => {
    if (gaji) {
      setTeamId(gaji.team_id);
      setStatus(gaji.status);
      setCatatan(gaji.catatan || "");
      if (gaji.proyek && gaji.proyek.length > 0) {
        setProyekRows(
          gaji.proyek.map((p) => ({
            id: p.id,
            order_id: p.order_id,
            nominal: p.nominal,
            keterangan: p.keterangan || "",
          }))
        );
      } else {
        setProyekRows([
          {
            order_id: "",
            nominal: "",
            keterangan: "",
          },
        ]);
      }
    } else {
      setTeamId(teamList.length > 0 ? teamList[0].id : "");
      setStatus("draft");
      setCatatan("");
      // Mulai dengan 1 baris kosong (pengguna memilih sendiri invoice yang tersedia)
      setProyekRows([
        {
          order_id: "",
          nominal: "",
          keterangan: "",
        },
      ]);
    }
    setError(null);
  }, [gaji, open, teamList]);

  // Tambah baris proyek baru: pilih otomatis proyek berikutnya yang belum diambil
  const handleAddRow = () => {
    const selectedOrderIds = proyekRows.map((r) => r.order_id).filter(Boolean);
    const nextAvailable = allAvailableOrders.find(
      (o) => !selectedOrderIds.includes(o.id)
    );

    setProyekRows((prev) => [
      ...prev,
      {
        order_id: nextAvailable ? nextAvailable.id : "",
        nominal: "",
        keterangan: "",
      },
    ]);
  };

  // Hapus baris proyek
  const handleRemoveRow = (index: number) => {
    const row = proyekRows[index];
    if (row.id) {
      setDeletedProyekIds((prev) => [...prev, row.id!]);
    }
    setProyekRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Update nilai baris proyek
  const handleRowChange = (
    index: number,
    field: keyof ProjectRow,
    value: string
  ) => {
    setProyekRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "nominal") {
          return { ...row, nominal: formatRupiahInput(value) };
        }
        return { ...row, [field]: value };
      })
    );
  };

  // Hitung total akumulasi langsung di client
  const calculateTotal = (): string => {
    let sum = 0;
    for (const r of proyekRows) {
      const num = parseInt(r.nominal.replace(/\D/g, ""), 10) || 0;
      sum += num;
    }
    return sum > 0 ? `Rp ${sum.toLocaleString("id-ID")}` : "Rp 0";
  };

  const calculatedTotal = calculateTotal();

  // Selected team object untuk label trigger yang bersih
  const selectedTeam = useMemo(
    () => teamList.find((t) => t.id === teamId),
    [teamList, teamId]
  );

  // Salin ringkasan ke WhatsApp
  const handleCopyWhatsApp = () => {
    let text = `*SLIP GAJI TIM TEKNISI - CV WIN TEKNIK MANDIRI*\n`;
    if (gaji?.kode_gaji) {
      text += `No. Slip: *${gaji.kode_gaji}*\n`;
    }
    text += `Tim: *${selectedTeam?.name || gaji?.team_name || "Tim Teknisi"}* (${
      selectedTeam?.skill || gaji?.team_skill || "Teknisi AC"
    })\n`;
    text += `Status: *${status === "dibayar" ? "LUNAS / DIBAYAR" : "DRAFT (PROSES)"}*\n`;
    text += `Tanggal: ${formatDate(new Date().toISOString())}\n\n`;

    text += `*Rincian Proyek Dikerjakan:*\n`;
    if (proyekRows.length === 0) {
      text += `(Belum ada rincian proyek)\n`;
    } else {
      proyekRows.forEach((row, idx) => {
        const order = orderList.find((o) => o.id === row.order_id);
        const invNo = order?.invoice_no || "INV-PROYEK";
        const svc = order?.initial_service || "Layanan Proyek";
        text += `${idx + 1}. ${invNo} · ${svc}\n`;
        if (order?.customer_name) {
          text += `   Klien: ${order.customer_name}\n`;
        }
        text += `   Upah Borongan: *${row.nominal || "Rp 0"}*\n`;
        if (row.keterangan) {
          text += `   Ket: ${row.keterangan}\n`;
        }
      });
    }

    text += `------------------------------------\n`;
    text += `*TOTAL GAJI: ${calculatedTotal}*\n\n`;
    if (catatan) {
      text += `Catatan: ${catatan}\n\n`;
    }
    text += `Terima kasih atas kerja keras dan profesionalitas tim!`;

    navigator.clipboard.writeText(text);
    toast.add({
      title: "Rincian Slip Gaji Tersalin!",
      description: "Format rapi sudah disalin ke clipboard untuk dikirim ke chat WhatsApp.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      setError("Silakan pilih Tim Teknisi terlebih dahulu.");
      return;
    }

    if (proyekRows.length === 0) {
      setError("Silakan tempelkan minimal satu proyek ke slip gaji.");
      return;
    }

    // Validasi setiap baris proyek
    for (let i = 0; i < proyekRows.length; i++) {
      const r = proyekRows[i];
      if (!r.order_id) {
        setError(`Harap pilih invoice untuk Proyek #${i + 1}.`);
        return;
      }
      const rawNominal = parseInt(r.nominal.replace(/\D/g, ""), 10) || 0;
      if (rawNominal <= 0) {
        setError(`Harap isi nominal upah tim untuk Proyek #${i + 1}.`);
        return;
      }
    }

    // Validasi anti-duplikasi: tidak boleh ada proyek yang sama
    const seenOrders = new Set<string>();
    for (const r of proyekRows) {
      if (seenOrders.has(r.order_id)) {
        const dupOrder = orderList.find((o) => o.id === r.order_id);
        const inv = dupOrder?.invoice_no || "tersebut";
        setError(`Proyek ${inv} dipilih lebih dari satu kali. Setiap proyek dalam satu slip gaji harus berbeda.`);
        return;
      }
      seenOrders.add(r.order_id);
    }

    setBusy(true);
    setError(null);

    try {
      if (isEdit && gaji) {
        await onSubmitUpdate(gaji.id, {
          team_id: teamId,
          status,
          catatan,
          proyek: proyekRows
            .filter((r) => r.order_id)
            .map((r) => ({
              order_id: r.order_id,
              nominal: r.nominal || "Rp 0",
              keterangan: r.keterangan || "",
            })),
        });
      } else {
        const payload: CreateGajiPayload = {
          team_id: teamId,
          status,
          catatan,
          proyek: proyekRows
            .filter((r) => r.order_id)
            .map((r) => ({
              order_id: r.order_id,
              nominal: r.nominal || "Rp 0",
              keterangan: r.keterangan || "",
            })),
        };
        await onSubmitCreate(payload);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Kelola Slip Gaji ${gaji?.kode_gaji}` : "Buat Slip Gaji Tim Baru"}
      description="Hubungkan tim teknisi dengan proyek-proyek yang telah closing / selesai dikerjakan beserta upah nominal borongannya."
      icon={<Banknote className="size-4" />}
      busy={busy}
      error={error}
      className="sm:max-w-2xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyWhatsApp}
            disabled={busy || proyekRows.length === 0}
            className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Copy className="size-4" />
            Salin Rincian untuk WA
          </Button>
          <div className="flex items-center gap-2 self-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Batal
            </Button>
            {/* Tombol Tambah Data / Submit: Berwarna Hitam */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition"
            >
              {busy ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Slip Gaji"}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {/* Baris 1: Tim Teknisi & Status Pembayaran */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Tim Teknisi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tim Teknisi <span className="text-rose-500">*</span>
            </label>
            <Select value={teamId} onValueChange={(val) => setTeamId(val || "")}>
              <SelectTrigger className="w-full text-xs">
                <span className="truncate">
                  {selectedTeam
                    ? `${selectedTeam.name} (${selectedTeam.skill})`
                    : "Pilih Tim Teknisi"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {teamList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.skill})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Status Pembayaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Status Pembayaran
            </label>
            <Select
              value={status}
              onValueChange={(val) => setStatus((val as "draft" | "dibayar") || "draft")}
            >
              <SelectTrigger className="w-full text-xs">
                <span className="truncate">
                  {status === "dibayar"
                    ? "🟢 Dibayar (Lunas)"
                    : "🟡 Draft (Belum Dibayar)"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="draft">🟡 Draft (Belum Dibayar)</SelectItem>
                  <SelectItem value="dibayar">🟢 Dibayar (Lunas)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section: Tempelkan Proyek Layanan */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Proyek Selesai & Pekerjaan Layanan
              </h4>
              <p className="text-xs text-slate-500">
                Hanya menampilkan proyek berstatus <strong>Selesai</strong> (closing). Bebas duplikasi antar baris.
              </p>
            </div>
            {/* Tombol Tambah Proyek: Berwarna Hitam, disable jika semua proyek selesai sudah terpasang */}
            <Button
              type="button"
              size="sm"
              onClick={handleAddRow}
              disabled={proyekRows.length >= allAvailableOrders.length}
              title={
                proyekRows.length >= allAvailableOrders.length
                  ? "Semua proyek selesai sudah terpasang di slip ini"
                  : "Tambah proyek lain"
              }
              className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="size-3.5" />
              Tambah Proyek
            </Button>
          </div>

          {proyekRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              Belum ada proyek yang ditempelkan ke slip gaji ini.
              <br />
              Klik tombol <strong>+ Tambah Proyek</strong> di atas.
            </div>
          ) : (
            <div className="space-y-3">
              {proyekRows.map((row, index) => {
                // Filter opsi: kecualikan order yang sudah dipilih oleh baris lainnya
                const otherSelectedOrderIds = proyekRows
                  .filter((_, i) => i !== index)
                  .map((r) => r.order_id)
                  .filter(Boolean);

                const availableOrdersForRow = allAvailableOrders.filter(
                  (o) => !otherSelectedOrderIds.includes(o.id)
                );

                return (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500">
                        Proyek #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(index)}
                        className="size-7 p-0 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-12">
                      {/* Pilih Order Proyek: Searchable Dropdown dengan filter anti-duplikasi */}
                      <div className="sm:col-span-7">
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Pilih Invoice Proyek (Selesai)
                        </label>
                        <SearchableProjectSelect
                          value={row.order_id}
                          onChange={(val) =>
                            handleRowChange(index, "order_id", val)
                          }
                          orders={availableOrdersForRow}
                        />
                      </div>

                      {/* Nominal Upah Borongan */}
                      <div className="sm:col-span-5">
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Nominal Upah Tim
                        </label>
                        <Input
                          type="text"
                          placeholder="Contoh: 1.500.000"
                          value={row.nominal}
                          onChange={(e) =>
                            handleRowChange(index, "nominal", e.target.value)
                          }
                          className="text-xs font-semibold text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Keterangan Proyek */}
                    <div>
                      <Input
                        type="text"
                        placeholder="Catatan / keterangan (mis: Upah pasang ducting lantai 2)"
                        value={row.keterangan}
                        onChange={(e) =>
                          handleRowChange(index, "keterangan", e.target.value)
                        }
                        className="text-xs text-slate-600 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Kotak Ringkasan Total */}
          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-white px-4 py-3">
            <div>
              <span className="text-xs font-medium text-slate-500">
                Total Akumulasi Gaji:
              </span>
              <p className="text-lg font-bold text-emerald-600">
                {calculatedTotal}
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {proyekRows.length} pekerjaan proyek terlampir
            </span>
          </div>
        </div>

        {/* Catatan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Catatan Tambahan (Opsional)
          </label>
          <Textarea
            rows={2}
            placeholder="Misal: Ditransfer via Rekening BCA Team Wahyu, bonus lembur + Rp 200rb"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="text-xs"
          />
        </div>
      </form>
    </FormDialog>
  );
}
