import { resolveApiBase } from "@/lib/dashboard/api";

export type GajiProyek = {
  id: string;
  gaji_id: string;
  order_id: string;
  invoice_no: string;
  nama_layanan: string;
  nama_customer: string;
  nominal: string;
  keterangan: string;
  created_at?: string;
  updated_at?: string;
};

export type Gaji = {
  id: string;
  kode_gaji: string;
  team_id: string;
  team_name: string;
  team_skill: string;
  total_gaji: string;
  status: "draft" | "dibayar";
  catatan: string;
  proyek: GajiProyek[];
  created_at: string;
  updated_at: string;
};

export type ListGajiResponse = {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: Gaji[];
};

export type AttachProyekPayload = {
  order_id: string;
  nominal: string;
  keterangan?: string;
};

export type CreateGajiPayload = {
  team_id: string;
  status?: string;
  catatan?: string;
  proyek: AttachProyekPayload[];
};

export type UpdateGajiPayload = {
  team_id?: string;
  status?: string;
  catatan?: string;
  proyek?: AttachProyekPayload[];
};

// ---------- API CALLS ----------

/**
 * Mengambil daftar slip gaji tim dengan filter lengkap (tim, proyek, tanggal, status, search) & pagination.
 */
export async function listGajiAdmin(params?: {
  team_id?: string;
  order_id?: string;
  date?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ListGajiResponse> {
  const q = new URLSearchParams();
  if (params?.team_id) q.set("team_id", params.team_id);
  if (params?.order_id) q.set("order_id", params.order_id);
  if (params?.date) q.set("date", params.date);
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));

  const res = await fetch(`${resolveApiBase()}/api/v1/gaji?${q.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat data gaji");
  const json = await res.json();
  return json.data;
}

/**
 * Mengambil daftar invoice proyek closing yang belum pernah digajikan di slip lain.
 */
export async function listAvailableOrdersForGaji(excludeGajiId?: string): Promise<any[]> {
  const q = new URLSearchParams();
  if (excludeGajiId) q.set("exclude_gaji_id", excludeGajiId);
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/available-orders?${q.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat proyek yang tersedia");
  const json = await res.json();
  return json.data || [];
}

/**
 * Mengambil detail 1 slip gaji lengkap beserta proyek-proyeknya.
 */
export async function getGajiDetail(id: string): Promise<Gaji> {
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/${id}`, {
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gaji tidak ditemukan");
  return json.data;
}

/**
 * Membuat slip gaji baru & menempelkan proyek-proyeknya.
 */
export async function createGaji(payload: CreateGajiPayload): Promise<Gaji> {
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal membuat slip gaji");
  return json.data;
}

/**
 * Memperbarui status / catatan slip gaji.
 */
export async function updateGaji(id: string, payload: UpdateGajiPayload): Promise<Gaji> {
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal memperbarui slip gaji");
  return json.data;
}

/**
 * Menempelkan 1 proyek baru ke slip gaji.
 */
export async function attachProyekGaji(gajiId: string, payload: AttachProyekPayload): Promise<Gaji> {
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/${gajiId}/proyek`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal menempelkan proyek");
  return json.data;
}

/**
 * Mengubah nominal upah borongan proyek.
 */
export async function updateProyekNominal(proyekId: string, nominal: string, keterangan = ""): Promise<Gaji> {
  const q = new URLSearchParams({ nominal, keterangan });
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/proyek/${proyekId}?${q.toString()}`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal mengupdate nominal proyek");
  return json.data;
}

/**
 * Melepas proyek dari slip gaji.
 */
export async function deleteProyekFromGaji(proyekId: string): Promise<Gaji> {
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/proyek/${proyekId}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal melepas proyek");
  return json.data;
}

/**
 * Menghapus slip gaji (soft delete).
 */
export async function deleteGaji(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/gaji/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus slip gaji");
}
