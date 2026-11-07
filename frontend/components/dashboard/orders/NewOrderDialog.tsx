"use client";

import { useRef, useState } from "react";
import { Plus, X, FileText } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import type { CreateManualOrderPayload } from "@/lib/orders";
import type { ServiceItem } from "@/lib/katalogLayanan";
import FormDialog from "@/components/dashboard/dialogs/FormDialog";

type NewOrderDialogProps = {
  open: boolean;
  serviceCatalog: ServiceItem[];
  onClose: () => void;
  onSubmit: (payload: CreateManualOrderPayload) => Promise<void>;
};

export function NewOrderDialog({
  open,
  serviceCatalog,
  onClose,
  onSubmit,
}: NewOrderDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState(
    serviceCatalog[0]?.id || ""
  );
  const [customServiceName, setCustomServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [isCustom, setIsCustom] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Jika pilih dari katalog, isi otomatis harga & nama
  const handleSelectCatalog = (id: string) => {
    setSelectedServiceId(id);
    const found = serviceCatalog.find((c) => c.id === id);
    if (found) {
      setPrice(found.price || "");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    let chosenName = customServiceName.trim();
    let chosenCat = "Layanan Custom";
    let chosenPrice = price.trim() || "Penawaran";
    let chosenServiceId: string | undefined = undefined;

    if (!isCustom) {
      const found = serviceCatalog.find((c) => c.id === selectedServiceId);
      if (found) {
        chosenName = found.title;
        chosenCat = found.category_name || "Layanan";
        chosenPrice = found.price || chosenPrice;
        chosenServiceId = found.id;
      }
    }

    if (!chosenName) {
      setServerError("Nama layanan wajib ditentukan.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        initial_category: chosenCat,
        initial_service: chosenName,
        initial_price: chosenPrice,
        status: "negosiasi",
        items: [
          {
            service_id: chosenServiceId,
            item_name: chosenName,
            price: chosenPrice,
            qty: qty || 1,
            unit: "/ unit",
            subtotal: chosenPrice,
          },
        ],
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat invoice.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(op) => {
        if (!op && !submitting) onClose();
      }}
      icon={<FileText className="size-5 text-[#A82020]" />}
      title="Buat Invoice Baru (Dari Chat WhatsApp)"
      description="Catat pesanan nyata setelah pelanggan mengirim pesan atau nego di WhatsApp."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="new-order-form"
            size="sm"
            disabled={submitting}
            className="bg-[#A82020] text-white hover:bg-[#8e1919]"
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 size-3.5" />
                Membuat Invoice...
              </>
            ) : (
              "Buat & Buka Invoice"
            )}
          </Button>
        </>
      }
    >
      <form id="new-order-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {serverError}
          </div>
        )}

        {/* Pilihan Layanan Pertama */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              Layanan yang Dipesan Pelanggan:
            </span>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs text-[#A82020] font-medium hover:underline"
            >
              {isCustom ? "← Pilih dari Katalog" : "+ Ketik Layanan Custom"}
            </button>
          </div>

          {!isCustom ? (
            <Select
              value={selectedServiceId}
              onValueChange={(val) => handleSelectCatalog(val || "")}
            >
              <SelectTrigger className="h-9 w-full bg-white text-xs">
                <SelectValue placeholder="Pilih layanan dari katalog..." />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  {serviceCatalog.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title} ({c.price || "Penawaran"})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={customServiceName}
              onChange={(e) => setCustomServiceName(e.target.value)}
              placeholder="Ketik nama layanan custom (mis. Ganti kapasitor outdoor)"
              className="h-9 text-xs bg-white"
              required={isCustom}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Harga / Tarif Awal
              </label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Rp 65.000 / Penawaran"
                className="h-8 text-xs bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Jumlah (Qty)
              </label>
              <Input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 1)}
                min={1}
                className="h-8 text-xs bg-white text-center font-mono"
              />
            </div>
          </div>
        </div>

        {/* Data Pelanggan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Nama Pelanggan (Dari Profil WA)
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Pak Budi"
              className="h-8 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              No. WhatsApp Pelanggan
            </label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 0812-xxxx"
              className="h-8 text-xs bg-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">
            Alamat Lokasi / Pengerjaan
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contoh: Jl. Dhoho No. 12, Kediri"
            className="h-8 text-xs bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">
            Catatan Nego / Kendala AC
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Catatan hasil obrolan chat WhatsApp..."
            className="text-xs bg-white"
          />
        </div>
      </form>
    </FormDialog>
  );
}

export default NewOrderDialog;
