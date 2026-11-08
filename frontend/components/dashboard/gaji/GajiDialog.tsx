"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Copy,
  Plus,
  Trash2,
  Check,
  Briefcase,
  AlertCircle,
  Building2,
  FileText,
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
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/dashboard/dialogs/FormDialog";
import { toast } from "@/components/ui/toast";
import type {
  Gaji,
  CreateGajiPayload,
  AttachProyekPayload,
  UpdateGajiPayload,
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
  orderList: Order[];
  onSubmitCreate: (payload: CreateGajiPayload) => Promise<void>;
  onSubmitUpdate: (
    id: string,
    header: UpdateGajiPayload,
    proyekList: ProjectRow[],
    deletedProyekIds: string[]
  ) => Promise<void>;
};

function formatRupiahInput(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return `Rp ${num.toLocaleString("id-ID")}`;
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

  // Inisialisasi state saat dialog dibuka
  useEffect(() => {
    if (gaji) {
      setTeamId(gaji.team_id);
      setStatus(gaji.status);
      setCatatan(gaji.catatan || "");
      setProyekRows(
        (gaji.proyek || []).map((p) => ({
          id: p.id,
          order_id: p.order_id,
          nominal: p.nominal,
          keterangan: p.keterangan || "",
        }))
      );
      setDeletedProyekIds([]);
    } else {
      setTeamId(teamList.length > 0 ? teamList[0].id : "");
      setStatus("draft");
      setCatatan("");
      setProyekRows([
        {
          order_id: orderList.length > 0 ? orderList[0].id : "",
          nominal: "",
          keterangan: "",
        },
      ]);
      setDeletedProyekIds([]);
    }
    setError(null);
  }, [gaji, open, teamList, orderList]);

  // Tambah baris proyek baru
  const handleAddRow = () => {
    const defaultOrderId = orderList.length > 0 ? orderList[0].id : "";
    setProyekRows((prev) => [
      ...prev,
      { order_id: defaultOrderId, nominal: "", keterangan: "" },
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

  // Salin ringkasan ke WhatsApp
  const handleCopyWhatsApp = () => {
    const selectedTeam = teamList.find((t) => t.id === teamId);
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

    setBusy(true);
    setError(null);

    try {
      if (isEdit && gaji) {
        await onSubmitUpdate(
          gaji.id,
          {
            team_id: teamId,
            status,
            catatan,
          },
          proyekRows,
          deletedProyekIds
        );
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
      description="Hubungkan tim teknisi dengan proyek-proyek yang telah dikerjakan beserta upah nominal borongannya."
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
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="bg-[#2279cf] text-white hover:bg-[#1a61a6]"
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tim Teknisi <span className="text-rose-500">*</span>
            </label>
            <Select value={teamId} onValueChange={(val) => setTeamId(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Tim Teknisi" />
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Status Pembayaran
            </label>
            <Select
              value={status}
              onValueChange={(val) => setStatus((val as "draft" | "dibayar") || "draft")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
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
                Proyek & Pekerjaan Layanan
              </h4>
              <p className="text-xs text-slate-500">
                Pilih proyek dari daftar invoice, nama proyek otomatis terhubung.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="gap-1.5 text-xs text-[#2279cf] border-[#2279cf]/30 hover:bg-[#2279cf]/10"
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
              {proyekRows.map((row, index) => (
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
                    {/* Pilih Order Proyek */}
                    <div className="sm:col-span-7">
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Pilih Invoice Proyek
                      </label>
                      <Select
                        value={row.order_id}
                        onValueChange={(val) =>
                          handleRowChange(index, "order_id", val || "")
                        }
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Pilih Order / Proyek" />
                        </SelectTrigger>
                        <SelectContent className="max-h-56">
                          <SelectGroup>
                            {orderList.map((ord) => (
                              <SelectItem key={ord.id} value={ord.id}>
                                <div className="flex flex-col text-left">
                                  <span className="font-semibold text-slate-800">
                                    {ord.invoice_no} · {ord.initial_service || "Layanan Proyek"}
                                  </span>
                                  {ord.customer_name && (
                                    <span className="text-[10px] text-slate-400">
                                      Klien: {ord.customer_name}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nominal Upah Borongan */}
                    <div className="sm:col-span-5">
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Nominal Upah Tim
                      </label>
                      <Input
                        type="text"
                        placeholder="Rp 1.500.000"
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
              ))}
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
