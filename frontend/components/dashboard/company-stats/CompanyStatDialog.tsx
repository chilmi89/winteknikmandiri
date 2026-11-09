"use client";

import { useEffect, useState } from "react";
import { Award, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDialog } from "@/components/dashboard/dialogs/FormDialog";
import type {
  CompanyStatItem,
  CreateCompanyStatPayload,
  UpdateCompanyStatPayload,
} from "@/lib/companyStats";

type CompanyStatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stat: CompanyStatItem | null; // null = tambah baru
  onSubmitCreate: (payload: CreateCompanyStatPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateCompanyStatPayload) => Promise<void>;
};

export function CompanyStatDialog({
  open,
  onOpenChange,
  stat,
  onSubmitCreate,
  onSubmitUpdate,
}: CompanyStatDialogProps) {
  const isEdit = Boolean(stat);

  const [label, setLabel] = useState("");
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [hasPlus, setHasPlus] = useState(false);
  const [value, setValue] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stat) {
      setLabel(stat.label);
      setTargetNumber(stat.target_number);
      setHasPlus(stat.has_plus);
      setValue(stat.value);
      setKeterangan(stat.keterangan || "");
      setSortOrder(stat.sort_order || 1);
      setIsActive(stat.is_active);
    } else {
      setLabel("");
      setTargetNumber(100);
      setHasPlus(true);
      setValue("100+");
      setKeterangan("");
      setSortOrder(5);
      setIsActive(true);
    }
    setError(null);
  }, [stat, open]);

  // Auto-generate value when targetNumber or hasPlus changes, unless customized
  const handleTargetChange = (num: number) => {
    setTargetNumber(num);
    setValue(`${num.toLocaleString("id-ID")}${hasPlus ? "+" : ""}`);
  };

  const handlePlusToggle = (checked: boolean) => {
    setHasPlus(checked);
    setValue(`${targetNumber.toLocaleString("id-ID")}${checked ? "+" : ""}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError("Label statistik wajib diisi.");
      return;
    }
    if (!value.trim()) {
      setError("Nilai tampilan statistik wajib diisi.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (isEdit && stat) {
        await onSubmitUpdate(stat.id, {
          label: label.trim(),
          value: value.trim(),
          target_number: targetNumber,
          has_plus: hasPlus,
          keterangan: keterangan.trim(),
          sort_order: sortOrder,
          is_active: isActive,
        });
      } else {
        await onSubmitCreate({
          label: label.trim(),
          value: value.trim(),
          target_number: targetNumber,
          has_plus: hasPlus,
          keterangan: keterangan.trim(),
          sort_order: sortOrder,
          is_active: isActive,
        });
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
      title={isEdit ? `Edit Statistik: ${stat?.label}` : "Tambah Statistik Pencapaian"}
      description="Kelola angka pencapaian perusahaan yang tampil di Beranda, Tentang Kami, dan Galeri."
      icon={<Award className="size-4 text-[#2279cf]" />}
      busy={busy}
      error={error}
      className="sm:max-w-md"
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
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
          >
            {busy ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Statistik"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {/* Live Preview Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pratinjau Tampilan Web
          </span>
          <div className="flex items-center justify-center font-black tracking-tight text-3xl text-slate-950 font-sans">
            <span>{value || "0"}</span>
            {hasPlus && !value.includes("+") && (
              <span className="text-[#A82020] ml-0.5">+</span>
            )}
          </div>
          <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-slate-600">
            {label || "NAMA STATISTIK"}
          </span>
          {keterangan && (
            <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 max-w-xs mx-auto">
              {keterangan}
            </p>
          )}
        </div>

        {/* Input Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Label / Judul Statistik <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Contoh: Proyek Selesai, Mitra Korporasi"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="text-xs font-medium"
          />
        </div>

        {/* Input Target Number & Checkbox Plus */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Angka Target (Hitung) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="364"
              value={targetNumber || ""}
              onChange={(e) => handleTargetChange(parseInt(e.target.value || "0", 10))}
              className="text-xs font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Teks Display
            </label>
            <Input
              type="text"
              placeholder="364+"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Checkbox Tanda Plus */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
          <Checkbox
            id="has-plus"
            checked={hasPlus}
            onCheckedChange={(checked) => handlePlusToggle(Boolean(checked))}
          />
          <label
            htmlFor="has-plus"
            className="text-xs font-medium text-slate-700 cursor-pointer select-none"
          >
            Tampilkan tanda plus merah (<strong className="text-[#A82020]">+</strong>) di belakang angka
          </label>
        </div>

        {/* Deskripsi / Keterangan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Deskripsi Singkat (Opsional)
          </label>
          <Textarea
            rows={2}
            placeholder="Keterangan singkat rekam jejak untuk halaman Tentang Kami & Galeri..."
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Urutan & Status */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Urutan Kartu (Sort Order)
            </label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value || "1", 10))}
              className="text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id="is-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
            <label
              htmlFor="is-active"
              className="text-xs font-semibold text-slate-800 cursor-pointer select-none"
            >
              Aktifkan di Web Publik
            </label>
          </div>
        </div>
      </form>
    </FormDialog>
  );
}
