"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  listOrdersAdmin,
  getOrderDetail,
  updateOrderHeader,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
  deleteOrder,
  type Order,
  type SaveOrderItemPayload,
  type UpdateOrderHeaderPayload,
} from "@/lib/orders";
import { fetchServiceItems, type ServiceItem } from "@/lib/katalogLayanan";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import OrderTable from "./OrderTable";
import InvoiceEditor from "./InvoiceEditor";

type OpenTab = {
  orderId: string;
  invoiceNo: string;
};

export function OrderWorkspace() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter List Master
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Tab State: activeTab === 'list' atau orderId
  const [activeTab, setActiveTab] = useState<string>("list");
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);

  // Cache data order yang sedang dibuka di tab
  const [openedOrderData, setOpenedOrderData] = useState<Record<string, Order>>({});

  const loadMasterOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [orderList, catalog] = await Promise.all([
        listOrdersAdmin(statusFilter, search),
        fetchServiceItems(),
      ]);
      setOrders(orderList);
      setServiceCatalog(catalog);
    } catch {
      if (!silent) {
        toast.add({
          title: "Gagal memuat pesanan",
          description: "Periksa koneksi Anda.",
          type: "error",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    void loadMasterOrders(false);
  }, [loadMasterOrders]);

  // Realtime Polling / Auto-Hit: Memeriksa order baru setiap 4 detik secara hening
  // Begitu pelanggan klik tombol Pesan di web dan masuk ke WhatsApp,
  // data invoice baru langsung muncul seketika di dashboard admin tanpa reload browser!
  useEffect(() => {
    const timer = setInterval(() => {
      void loadMasterOrders(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [loadMasterOrders]);

  // Buka Invoice sebagai Tab Baru
  const handleOpenOrderTab = async (order: Order) => {
    // Cek apakah tab sudah ada
    const exists = openTabs.some((t) => t.orderId === order.id);
    if (!exists) {
      setOpenTabs((prev) => [...prev, { orderId: order.id, invoiceNo: order.invoice_no }]);
    }
    setActiveTab(order.id);

    // Fetch data order lengkap dengan items jika belum ada
    if (!openedOrderData[order.id]) {
      try {
        const full = await getOrderDetail(order.id);
        setOpenedOrderData((prev) => ({ ...prev, [order.id]: full }));
      } catch {
        setOpenedOrderData((prev) => ({ ...prev, [order.id]: order }));
      }
    }
  };

  // Tutup Tab
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    setOpenTabs((prev) => prev.filter((t) => t.orderId !== tabId));
    if (activeTab === tabId) {
      setActiveTab("list");
    }
  };

  // Handler Update Header dari InvoiceEditor
  const handleUpdateHeader = async (orderId: string, payload: UpdateOrderHeaderPayload) => {
    const updated = await updateOrderHeader(orderId, payload);
    setOpenedOrderData((prev) => ({ ...prev, [orderId]: updated }));
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
  };

  // Handler Tambah Item ke Invoice
  const handleAddItem = async (orderId: string, payload: SaveOrderItemPayload) => {
    await addOrderItem(orderId, payload);
    const refreshed = await getOrderDetail(orderId);
    setOpenedOrderData((prev) => ({ ...prev, [orderId]: refreshed }));
  };

  // Handler Update Item Nego
  const handleUpdateItem = async (orderId: string, itemId: string, payload: SaveOrderItemPayload) => {
    await updateOrderItem(itemId, payload);
    const refreshed = await getOrderDetail(orderId);
    setOpenedOrderData((prev) => ({ ...prev, [orderId]: refreshed }));
  };

  // Handler Hapus Item
  const handleDeleteItem = async (orderId: string, itemId: string) => {
    await deleteOrderItem(itemId);
    const refreshed = await getOrderDetail(orderId);
    setOpenedOrderData((prev) => ({ ...prev, [orderId]: refreshed }));
  };

  // Handler Hapus Order Master
  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`Hapus pesanan ${order.invoice_no}?`)) return;
    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      handleCloseTab({ stopPropagation: () => {} } as any, order.id);
      toast.add({ title: "Pesanan berhasil dihapus", type: "success" });
    } catch {
      toast.add({ title: "Gagal menghapus", type: "error" });
    }
  };

  const currentOpenedOrder = activeTab !== "list" ? openedOrderData[activeTab] : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header Utama */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Pesanan &amp; Invoice Nego
            </h1>
            <span className="text-xs text-slate-400">{orders.length} pesanan masuk</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Terhubung langsung dengan klik tombol Pesan di web. Atur nego harga, tambah layanan custom, dan kirim rincian via WA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadMasterOrders(false)}
            disabled={loading}
            className="h-9 gap-1.5 text-xs bg-white border-slate-200 text-slate-600"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ================= BARIS TAB MULTI-INVOICE ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-px no-scrollbar">
        {/* Tab Daftar Utama */}
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
            activeTab === "list"
              ? "border-slate-300 bg-white text-[#A82020] shadow-xs"
              : "border-transparent bg-slate-100/70 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="size-3.5" />
          <span>Daftar Pesanan ({orders.length})</span>
        </button>

        {/* Tab-Tab Invoice Terbuka */}
        {openTabs.map((tab) => {
          const isActive = activeTab === tab.orderId;

          return (
            <button
              key={tab.orderId}
              type="button"
              onClick={() => setActiveTab(tab.orderId)}
              className={`group flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono font-bold rounded-t-lg border-t border-x transition-colors ${
                isActive
                  ? "border-slate-300 bg-white text-[#A82020] shadow-xs"
                  : "border-transparent bg-slate-100/70 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.invoiceNo}</span>
              <span
                onClick={(e) => handleCloseTab(e, tab.orderId)}
                className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                title="Tutup Tab"
              >
                <X className="size-3" />
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= KONTEN TAB: DAFTAR MASTER ================= */}
      {activeTab === "list" && (
        <DataTableShell>
          <DataTableToolbar>
            <DataTableToolbarGroup className="flex-1 flex-wrap gap-2.5">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari No. Invoice / Klien / Layanan…"
                  className="h-9 rounded-md border-slate-200 bg-white pr-8 pl-9 text-xs text-slate-700"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Status */}
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                <SelectTrigger className="h-9 w-full sm:w-[180px] bg-white text-xs border-slate-200">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="belum_diproses">Belum Diproses</SelectItem>
                    <SelectItem value="negosiasi">Sedang Nego</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="dikerjakan">Dikerjakan</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="batal">Dibatalkan</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </DataTableToolbarGroup>
          </DataTableToolbar>

          <OrderTable
            items={orders}
            loading={loading}
            onOpenTab={handleOpenOrderTab}
            onDelete={handleDeleteOrder}
          />
        </DataTableShell>
      )}

      {/* ================= KONTEN TAB: EDITOR INVOICE NEGO ================= */}
      {activeTab !== "list" && currentOpenedOrder && (
        <InvoiceEditor
          key={currentOpenedOrder.id}
          order={currentOpenedOrder}
          serviceCatalog={serviceCatalog}
          onUpdateHeader={(payload) => handleUpdateHeader(currentOpenedOrder.id, payload)}
          onAddItem={(payload) => handleAddItem(currentOpenedOrder.id, payload)}
          onUpdateItem={(itemId, payload) => handleUpdateItem(currentOpenedOrder.id, itemId, payload)}
          onDeleteItem={(itemId) => handleDeleteItem(currentOpenedOrder.id, itemId)}
        />
      )}
    </div>
  );
}

export default OrderWorkspace;
