"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, X, FileText, Calendar, Hash } from "lucide-react";
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
  createManualOrder,
  updateOrderHeader,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
  deleteOrder,
  type Order,
  type SaveOrderItemPayload,
  type UpdateOrderHeaderPayload,
  type CreateManualOrderPayload,
} from "@/lib/orders";
import { fetchServiceItems, type ServiceItem } from "@/lib/katalogLayanan";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import DataTableToolbar, {
  DataTableToolbarGroup,
} from "@/components/dashboard/data-table/DataTableToolbar";
import OrderTable from "./OrderTable";
import InvoiceEditor from "./InvoiceEditor";
import NewOrderDialog from "./NewOrderDialog";

type OpenTab = {
  orderId: string;
  invoiceNo: string;
};

export function OrderWorkspace() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog Buat Order Baru Manual
  const [showNewDialog, setShowNewDialog] = useState(false);

  // Filter List Master: Pencarian Digit Belakang & Tanggal
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
  const [statusFilter, setStatusFilter] = useState("all");

  // Tab View Mode: 'active' (Pesanan Aktif) vs 'pending' (Menunggu Chat WA)
  const [masterListMode, setMasterListMode] = useState<"active" | "pending">("active");

  // Tab State: activeTab === 'list' atau orderId
  const [activeTab, setActiveTab] = useState<string>("list");
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);

  // Cache data order yang sedang dibuka di tab
  const [openedOrderData, setOpenedOrderData] = useState<Record<string, Order>>({});

  const loadMasterOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [orderList, catalog] = await Promise.all([
        listOrdersAdmin(statusFilter, search, dateFilter),
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
  }, [statusFilter, search, dateFilter]);

  useEffect(() => {
    void loadMasterOrders(false);
  }, [loadMasterOrders]);

  // Polling hening setiap 4 detik agar order otomatis masuk
  useEffect(() => {
    const timer = setInterval(() => {
      void loadMasterOrders(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [loadMasterOrders]);

  // Buka Invoice sebagai Tab Baru
  const handleOpenOrderTab = async (order: Order) => {
    const exists = openTabs.some((t) => t.orderId === order.id);
    if (!exists) {
      setOpenTabs((prev) => [...prev, { orderId: order.id, invoiceNo: order.invoice_no }]);
    }
    setActiveTab(order.id);

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

  // Buat Order Baru dari Dialog -> Langsung Buka Tab Barunya
  const handleCreateNewOrder = async (payload: CreateManualOrderPayload) => {
    const newOrd = await createManualOrder(payload);
    setOrders((prev) => [newOrd, ...prev]);
    toast.add({
      title: "Invoice Dibuat!",
      description: `Nomor Invoice ${newOrd.invoice_no} siap dikelola.`,
      type: "success",
    });
    handleOpenOrderTab(newOrd);
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

  // Pisahkan Pesanan Aktif vs Menunggu Chat WA
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === "menunggu_chat" || o.status === "belum_diproses"
    );
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status !== "menunggu_chat" && o.status !== "belum_diproses"
    );
  }, [orders]);

  const displayedOrders = masterListMode === "active" ? activeOrders : pendingOrders;
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
            <span className="text-xs text-slate-400">{orders.length} total</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Terhubung otomatis dengan tombol Pesan di web. Filter per tanggal &amp; digit nomor invoice untuk pencarian kilat.
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

          <Button
            type="button"
            onClick={() => setShowNewDialog(true)}
            className="h-9 gap-1.5 bg-[#A82020] hover:bg-[#8e1919] text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="size-4" />
            + Buat Invoice Baru
          </Button>
        </div>
      </div>

      {/* ================= BARIS TAB MULTI-INVOICE ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-px no-scrollbar">
        {/* Tab Pesanan Aktif */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("list");
            setMasterListMode("active");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
            activeTab === "list" && masterListMode === "active"
              ? "border-slate-300 bg-white text-[#A82020] shadow-xs"
              : "border-transparent bg-slate-100/70 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="size-3.5" />
          <span>Pesanan Aktif ({activeOrders.length})</span>
        </button>

        {/* Tab Menunggu Chat WA (Hasil Baru Klik Web) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("list");
            setMasterListMode("pending");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${
            activeTab === "list" && masterListMode === "pending"
              ? "border-slate-300 bg-white text-[#A82020] shadow-xs"
              : "border-transparent bg-slate-100/70 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>⏳ Menunggu Chat WA ({pendingOrders.length})</span>
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
              {/* Input Cepat Cari Digit Nomor Belakang (Mis. 0001, 1, 2) */}
              <div className="relative flex-1 sm:max-w-xs">
                <Hash className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik no. invoice (mis. 0001, 1, atau nama)…"
                  className="h-9 rounded-md border-slate-200 bg-white pr-8 pl-9 text-xs text-slate-700 font-mono"
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

              {/* Filter Tanggal Spesifik (YYYY-MM-DD) */}
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700"
                  title="Filter per tanggal invoice"
                />
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter("")}
                    className="text-xs text-slate-400 hover:text-rose-600 p-1"
                    title="Hapus filter tanggal"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Filter Status (khusus tab aktif) */}
              {masterListMode === "active" && (
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                  <SelectTrigger className="h-9 w-full sm:w-[160px] bg-white text-xs border-slate-200">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectGroup>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="negosiasi">Sedang Negosiasi</SelectItem>
                      <SelectItem value="deal">Deal / Sepakat</SelectItem>
                      <SelectItem value="dikerjakan">Sedang Dikerjakan</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="batal">Dibatalkan</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </DataTableToolbarGroup>
          </DataTableToolbar>

          <OrderTable
            items={displayedOrders}
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

      {/* Dialog Buat Invoice Baru Manual */}
      {showNewDialog && (
        <NewOrderDialog
          open={showNewDialog}
          serviceCatalog={serviceCatalog}
          onClose={() => setShowNewDialog(false)}
          onSubmit={handleCreateNewOrder}
        />
      )}
    </div>
  );
}

export default OrderWorkspace;
