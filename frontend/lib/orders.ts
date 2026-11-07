import { resolveApiBase } from "@/lib/dashboard/api";

export type OrderItem = {
  id: string;
  order_id: string;
  service_id?: string;
  item_name: string;
  price: string;
  qty: number;
  unit: string;
  subtotal: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type OrderStatus =
  | "menunggu_chat"
  | "belum_diproses"
  | "negosiasi"
  | "deal"
  | "dikerjakan"
  | "selesai"
  | "batal";

export type Order = {
  id: string;
  invoice_no: string;
  initial_category: string;
  initial_service: string;
  initial_price: string;
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  notes?: string;
  total_amount: string;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type SaveOrderItemPayload = {
  service_id?: string;
  item_name: string;
  price: string;
  qty: number;
  unit?: string;
  subtotal: string;
  notes?: string;
};

export type CreateManualOrderPayload = {
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  notes?: string;
  initial_category?: string;
  initial_service?: string;
  initial_price?: string;
  status?: string;
  items: SaveOrderItemPayload[];
};

export type UpdateOrderHeaderPayload = {
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  notes?: string;
  total_amount?: string;
  status?: string;
};

export type ClickOrderPayload = {
  category_id?: string;
  service_id?: string;
  category: string;
  service: string;
  price: string;
};

export type ClickOrderResult = {
  invoice_no: string;
  order_id: string;
  wa_url: string;
};

// ---------- API CALLS ----------

/**
 * Dipanggil otomatis saat tombol Pesan di web diklik pelanggan.
 * Menerbitkan nomor invoice otomatis & menghasilkan URL WhatsApp.
 */
export async function triggerClickOrder(payload: ClickOrderPayload): Promise<ClickOrderResult> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.wa_url) {
    throw new Error(json.error || "Gagal membuat invoice order");
  }

  return json;
}

/**
 * Buat invoice pesanan baru secara manual oleh admin saat chat WhatsApp masuk.
 */
export async function createManualOrder(payload: CreateManualOrderPayload): Promise<Order> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.data) {
    throw new Error(json.error || "Gagal membuat invoice order");
  }

  return json.data;
}

/**
 * Mengambil daftar order untuk dashboard admin dengan filter status, search, dan tanggal.
 */
export async function listOrdersAdmin(status = "", search = "", date = ""): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  if (date) params.set("date", date);

  const res = await fetch(`${resolveApiBase()}/api/v1/orders?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Gagal memuat daftar pesanan");
  const json = await res.json();
  return json.data || [];
}

/**
 * Mengambil detail invoice lengkap beserta baris rincian order_items.
 */
export async function getOrderDetail(idOrInvoice: string): Promise<Order> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/${encodeURIComponent(idOrInvoice)}`, {
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Invoice tidak ditemukan");
  return json.data;
}

/**
 * Update data header order (nama klien, WA, status, catatan, total).
 */
export async function updateOrderHeader(id: string, payload: UpdateOrderHeaderPayload): Promise<Order> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal memperbarui pesanan");
  return json.data;
}

/**
 * Menambah baris layanan ke dalam invoice.
 */
export async function addOrderItem(orderId: string, payload: SaveOrderItemPayload): Promise<OrderItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/${orderId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Gagal menambahkan item ke invoice");
  return json;
}

/**
 * Mengubah harga, qty, atau nama layanan pada baris invoice.
 */
export async function updateOrderItem(itemId: string, payload: SaveOrderItemPayload): Promise<OrderItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Gagal memperbarui item invoice");
  return json;
}

/**
 * Menghapus baris layanan dari invoice.
 */
export async function deleteOrderItem(itemId: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/items/${itemId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Gagal menghapus baris item invoice");
}

/**
 * Menghapus invoice pesanan (soft delete).
 */
export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/orders/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Gagal menghapus pesanan");
}
