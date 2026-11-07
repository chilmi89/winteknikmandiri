"use client";

import { useState } from "react";
import { Copy, Plus, Trash2, Check, RefreshCw, Send, DollarSign, User, Phone, MapPin, FileText } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import type { Order, OrderItem, SaveOrderItemPayload, UpdateOrderHeaderPayload } from "@/lib/orders";
import type { ServiceItem } from "@/lib/katalogLayanan";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";

type InvoiceEditorProps = {
  order: Order;
  serviceCatalog: ServiceItem[];
  onUpdateHeader: (payload: UpdateOrderHeaderPayload) => Promise<void>;
  onAddItem: (payload: SaveOrderItemPayload) => Promise<void>;
  onUpdateItem: (itemId: string, payload: SaveOrderItemPayload) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
};

export function InvoiceEditor({
  order,
  serviceCatalog,
  onUpdateHeader,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: InvoiceEditorProps) {
  // Local state header order
  const [customerName, setCustomerName] = useState(order.customer_name || "");
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone || "");
  const [address, setAddress] = useState(order.address || "");
  const [notes, setNotes] = useState(order.notes || "");
  const [status, setStatus] = useState(order.status || "belum_diproses");
  const [savingHeader, setSavingHeader] = useState(false);

  // State tambah item
  const [addingFromCatalog, setAddingFromCatalog] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [customItemName, setCustomItemName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [customUnit, setCustomUnit] = useState("/ unit");
  const [addingBusy, setAddingBusy] = useState(false);

  // State edit baris item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState(1);

  // Hitung total kalkulasi fiks
  const calculateTotal = () => {
    let sum = 0;
    for (const it of order.items) {
      // Ambil angka dari price (misal: "Rp 65.000" -> 65000)
      const num = parseInt(it.price.replace(/[^0-9]/g, ""), 10) || 0;
      sum += num * it.qty;
    }
    return sum > 0 ? `Rp ${sum.toLocaleString("id-ID")}` : order.total_amount || "Rp 0";
  };

  const calculatedTotal = calculateTotal();

  // Simpan Sementara / Draft Header
  const handleSaveHeader = async () => {
    setSavingHeader(true);
    try {
      await onUpdateHeader({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        status,
        total_amount: calculatedTotal,
      });
      toast.add({
        title: "Tersimpan Sementara",
        description: `Draft invoice ${order.invoice_no} berhasil diperbarui.`,
        type: "success",
      });
    } catch {
      toast.add({
        title: "Gagal menyimpan",
        description: "Periksa koneksi Anda.",
        type: "error",
      });
    } finally {
      setSavingHeader(false);
    }
  };

  // Tambah Layanan dari Katalog
  const handleAddFromCatalog = async () => {
    const found = serviceCatalog.find((c) => c.id === selectedCatalogId);
    if (!found) return;

    setAddingBusy(true);
    try {
      await onAddItem({
        service_id: found.id,
        item_name: found.title,
        price: found.price || "Penawaran",
        qty: 1,
        unit: found.unit || "/ unit",
        subtotal: found.price || "",
      });
      setSelectedCatalogId("");
      setAddingFromCatalog(false);
      toast.add({ title: "Layanan ditambahkan ke invoice", type: "success" });
    } finally {
      setAddingBusy(false);
    }
  };

  // Tambah Layanan Custom Manual
  const handleAddCustom = async () => {
    if (!customItemName.trim()) return;

    setAddingBusy(true);
    try {
      await onAddItem({
        item_name: customItemName.trim(),
        price: customPrice.trim() || "Penawaran",
        qty: customQty || 1,
        unit: customUnit.trim() || "/ unit",
        subtotal: customPrice.trim(),
      });
      setCustomItemName("");
      setCustomPrice("");
      setCustomQty(1);
      toast.add({ title: "Item custom ditambahkan ke invoice", type: "success" });
    } finally {
      setAddingBusy(false);
    }
  };

  // Simpan Edit Harga Nego per Baris
  const handleSaveEditItem = async (it: OrderItem) => {
    try {
      await onUpdateItem(it.id, {
        service_id: it.service_id,
        item_name: it.item_name,
        price: editPrice.trim() || it.price,
        qty: editQty || 1,
        unit: it.unit,
        subtotal: editPrice.trim(),
      });
      setEditingItemId(null);
      toast.add({ title: "Harga nego berhasil diperbarui", type: "success" });
    } catch {
      toast.add({ title: "Gagal mengubah item", type: "error" });
    }
  };

  // Salin Rincian Invoice untuk Dikirim ke WhatsApp Klien
  const handleCopyForWhatsApp = () => {
    let text = `*INVOICE KESEPAKATAN - CV WIN TEKNIK MANDIRI*\n`;
    text += `No. Invoice: *${order.invoice_no}*\n`;
    if (customerName) text += `Klien: ${customerName}\n`;
    text += `Status: ${status.toUpperCase()}\n\n`;
    text += `*Rincian Layanan:*\n`;

    order.items.forEach((it, idx) => {
      text += `${idx + 1}. ${it.item_name} (${it.qty} ${it.unit}) : ${it.price}\n`;
    });

    text += `------------------------------------\n`;
    text += `*TOTAL KESEPAKATAN: ${calculatedTotal}*\n\n`;
    if (notes) text += `Catatan: ${notes}\n\n`;
    text += `Terima kasih atas kepercayaannya. Teknisi kami akan datang sesuai jadwal yang disepakati.`;

    navigator.clipboard.writeText(text);
    toast.add({
      title: "Rincian Invoice Tersalin!",
      description: "Teks sudah disalin, silakan paste langsung ke chat WhatsApp klien.",
      type: "success",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* ================= KOLOM KIRI: RINCIAN ITEM LAYANAN NEGO ================= */}
      <div className="lg:col-span-7 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#A82020]">
                {order.invoice_no}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-700">
                Layanan Awal: {order.initial_service}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Kategori: {order.initial_category || "Umum"} · Estimasi Web: {order.initial_price}
            </p>
          </div>

          <span className="font-mono text-sm font-bold text-[#A82020] bg-rose-50 px-3 py-1 rounded-md border border-rose-200/80">
            Total: {calculatedTotal}
          </span>
        </div>

        {/* Tabel Baris Layanan Invoice */}
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          <Table className="w-full table-fixed text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                <TableHead className="w-[45%] px-3 py-2 font-medium text-slate-600">
                  Layanan / Pekerjaan
                </TableHead>
                <TableHead className="w-[15%] px-2 py-2 text-center font-medium text-slate-600">
                  Qty
                </TableHead>
                <TableHead className="w-[25%] px-3 py-2 text-right font-medium text-slate-600">
                  Harga Nego
                </TableHead>
                <TableHead className="w-[15%] px-2 py-2 text-center font-medium text-slate-600">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {order.items.map((it) => {
                const isEditing = editingItemId === it.id;

                return (
                  <TableRow key={it.id} className="border-slate-100 hover:bg-slate-50/60">
                    <TableCell className="px-3 py-2.5 align-middle">
                      <p className="font-semibold text-slate-800 line-clamp-1">{it.item_name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {it.service_id ? "Dari Katalog" : "Custom Nego"}
                      </span>
                    </TableCell>

                    <TableCell className="px-2 py-2.5 text-center align-middle font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(Number(e.target.value) || 1)}
                          className="h-7 w-14 text-center mx-auto text-xs"
                          min={1}
                        />
                      ) : (
                        <span>{it.qty} {it.unit}</span>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2.5 text-right align-middle font-mono font-bold text-[#A82020]">
                      {isEditing ? (
                        <Input
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="h-7 w-28 text-right ml-auto text-xs"
                          placeholder="Rp 60.000"
                        />
                      ) : (
                        it.price
                      )}
                    </TableCell>

                    <TableCell className="px-2 py-2.5 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleSaveEditItem(it)}
                            className="h-6 px-1.5 text-[10px] text-emerald-700 border-emerald-300"
                          >
                            Simpan
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(it.id);
                              setEditPrice(it.price);
                              setEditQty(it.qty);
                            }}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="Edit Harga Nego"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteItem(it.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Hapus Baris"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Section Tambah Layanan (Katalog & Custom) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setAddingFromCatalog(!addingFromCatalog)}
              className="text-xs gap-1 border-slate-300 text-slate-700"
            >
              <Plus className="size-3" />
              Tambah dari Katalog
            </Button>
          </div>

          {/* Form Dropdown dari Katalog */}
          {addingFromCatalog && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <Select value={selectedCatalogId} onValueChange={(val) => setSelectedCatalogId(val || "")}>
                <SelectTrigger className="h-8 flex-1 bg-white text-xs">
                  <SelectValue placeholder="Pilih layanan dari master katalog..." />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    {serviceCatalog.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title} — {c.price || "Penawaran"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="xs"
                onClick={handleAddFromCatalog}
                disabled={!selectedCatalogId || addingBusy}
                className="bg-[#0A2540] text-white h-8 text-xs"
              >
                + Masukkan
              </Button>
            </div>
          )}

          {/* Form Item Custom Nego */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2">
            <p className="text-[11px] font-semibold text-slate-700">
              + Tambah Layanan Custom (Ketik Bebas &amp; Tentukan Harga Nego Sendiri)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <Input
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="Nama pekerjaan custom (mis. Ganti stop kontak pipa)"
                className="sm:col-span-6 h-8 text-xs bg-white"
              />
              <Input
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Harga (mis. Rp 150.000)"
                className="sm:col-span-3 h-8 text-xs bg-white font-mono"
              />
              <Input
                type="number"
                value={customQty}
                onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                placeholder="Qty"
                className="sm:col-span-1 h-8 text-xs bg-white text-center font-mono"
                min={1}
              />
              <Button
                type="button"
                size="xs"
                onClick={handleAddCustom}
                disabled={!customItemName.trim() || addingBusy}
                className="sm:col-span-2 bg-[#A82020] text-white h-8 text-xs hover:bg-[#8e1919]"
              >
                + Tambah
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= KOLOM KANAN: DATA KLIEN & KESEPAKATAN ================= */}
      <div className="lg:col-span-5 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="size-4 text-[#A82020]" />
          Data Klien &amp; Status Negosiasi
        </h3>

        <div className="space-y-3">
          {/* Tombol Cepat: Terima Chat & Mulai Nego jika masih status Menunggu Chat */}
          {(status === "menunggu_chat" || status === "belum_diproses") && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-amber-900">
                ⏳ Status: Pelanggan Baru Klik di Web
              </p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Jika pelanggan sudah mengirim chat WA dengan No. Invoice ini, klik tombol di bawah untuk langsung memproses negosiasi.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  setStatus("negosiasi");
                  setSavingHeader(true);
                  try {
                    await onUpdateHeader({
                      customer_name: customerName.trim(),
                      customer_phone: customerPhone.trim(),
                      address: address.trim(),
                      notes: notes.trim(),
                      status: "negosiasi",
                      total_amount: calculatedTotal,
                    });
                    toast.add({
                      title: "Chat Diterima!",
                      description: `Pesanan ${order.invoice_no} masuk ke proses Negosiasi aktif.`,
                      type: "success",
                    });
                  } finally {
                    setSavingHeader(false);
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold gap-1.5"
              >
                <Check className="size-3.5" />
                Terima Chat &amp; Mulai Negosiasi
              </Button>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Status Pesanan
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val || "menunggu_chat")}>
              <SelectTrigger className="h-8 w-full bg-white text-xs font-semibold">
                <SelectValue placeholder="Pilih status..." />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="menunggu_chat">⏳ Menunggu Chat WA (Baru Klik Web)</SelectItem>
                  <SelectItem value="negosiasi">🟡 Sedang Negosiasi / Konsultasi WA</SelectItem>
                  <SelectItem value="deal">🟢 Deal / Sepakat</SelectItem>
                  <SelectItem value="dikerjakan">🔵 Sedang Dikerjakan</SelectItem>
                  <SelectItem value="selesai">✅ Selesai</SelectItem>
                  <SelectItem value="batal">❌ Dibatalkan</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Nama Klien (Opsional - dari chat WA)
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
              No. WhatsApp Klien (Opsional)
            </label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 0812-1662-xxxx"
              className="h-8 text-xs bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Alamat Survei / Lokasi (Opsional)
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
              Catatan Negosiasi / Keluhan AC
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan hasil diskusi via chat WhatsApp..."
              className="text-xs bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          {/* Tombol Simpan Sementara */}
          <Button
            type="button"
            onClick={handleSaveHeader}
            disabled={savingHeader}
            className="w-full bg-[#0A2540] text-white hover:bg-[#071a2e] text-xs h-9 gap-2"
          >
            {savingHeader ? "Menyimpan..." : "💾 Simpan Sementara (Draft)"}
          </Button>

          {/* Tombol Salin Rincian untuk WA */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyForWhatsApp}
            className="w-full border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs h-9 gap-2"
          >
            <Copy className="size-3.5" />
            Salin Rincian Invoice untuk WA
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceEditor;
