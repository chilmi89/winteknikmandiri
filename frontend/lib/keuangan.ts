import { resolveApiBase } from "@/lib/dashboard/api";

export type KategoriKeuangan = {
  id: string;
  nama_kategori: string;
  tipe: "pemasukan" | "pengeluaran";
  deskripsi: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type JurnalItem = {
  id: string;
  jurnal_id: string;
  tipe: "pemasukan" | "pengeluaran";
  deskripsi: string;
  kategori_id?: string;
  nama_kategori: string;
  metode_pembayaran: "transfer" | "cash" | "kasbon" | "qris";
  nominal: string;
  amount_numeric: number;
  sumber: "manual" | "proyek" | "gaji";
  order_id?: string;
  invoice_no?: string;
  gaji_id?: string;
  kode_gaji?: string;
  catatan: string;
  created_at?: string;
  updated_at?: string;
};

export type JurnalKeuangan = {
  id: string;
  kode_jurnal: string;
  judul: string;
  waktu_transaksi: string; // ISO 8601
  cabang: string;
  status: "draft" | "lunas" | "batal";
  total_pemasukan: string;
  total_pengeluaran: string;
  saldo_bersih: string;
  numeric_pemasukan: number;
  numeric_pengeluaran: number;
  numeric_saldo: number;
  catatan: string;
  items: JurnalItem[];
  created_at: string;
  updated_at: string;
};

export type KeuanganSummary = {
  total_pemasukan: string;
  total_pengeluaran: string;
  sisa_saldo_kas: string;
  numeric_pemasukan: number;
  numeric_pengeluaran: number;
  numeric_saldo: number;
  total_transaksi: number;
};

export type ListJurnalResponse = {
  summary: KeuanganSummary;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: JurnalKeuangan[];
};

export type CreateKategoriPayload = {
  nama_kategori: string;
  tipe: "pemasukan" | "pengeluaran";
  deskripsi?: string;
};

export type UpdateKategoriPayload = {
  nama_kategori?: string;
  tipe?: "pemasukan" | "pengeluaran";
  deskripsi?: string;
};

export type CreateJurnalItemPayload = {
  tipe: "pemasukan" | "pengeluaran";
  deskripsi: string;
  kategori_id?: string;
  metode_pembayaran?: string;
  nominal: string;
  sumber?: string;
  order_id?: string;
  gaji_id?: string;
  catatan?: string;
};

export type CreateJurnalPayload = {
  judul?: string;
  waktu_transaksi?: string;
  cabang?: string;
  status?: string;
  catatan?: string;
  items: CreateJurnalItemPayload[];
};

export type UpdateJurnalPayload = {
  judul?: string;
  waktu_transaksi?: string;
  cabang?: string;
  status?: string;
  catatan?: string;
  items?: CreateJurnalItemPayload[];
};

// ---------- API CALLS ----------

/**
 * Mengambil daftar master kategori akun keuangan.
 */
export async function listKategoriAdmin(tipe?: string): Promise<KategoriKeuangan[]> {
  const q = new URLSearchParams();
  if (tipe && tipe !== "all") q.set("tipe", tipe);

  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/kategori?${q.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat kategori keuangan");
  const json = await res.json();
  return json.data || [];
}

/**
 * Tambah kategori keuangan baru.
 */
export async function createKategoriAdmin(payload: CreateKategoriPayload): Promise<KategoriKeuangan> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/kategori`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal membuat kategori");
  return json.data;
}

/**
 * Update kategori keuangan.
 */
export async function updateKategoriAdmin(id: string, payload: UpdateKategoriPayload): Promise<KategoriKeuangan> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/kategori/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal memperbarui kategori");
  return json.data;
}

/**
 * Hapus kategori keuangan.
 */
export async function deleteKategoriAdmin(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/kategori/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus kategori keuangan");
}

/**
 * Mengambil daftar nota jurnal kas dengan summary & pagination.
 */
export async function listJurnalAdmin(params?: {
  search?: string;
  status?: string;
  cabang?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
  limit?: number;
}): Promise<ListJurnalResponse> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.cabang && params.cabang !== "all") q.set("cabang", params.cabang);
  if (params?.date_from) q.set("date_from", params.date_from);
  if (params?.date_to) q.set("date_to", params.date_to);
  if (params?.sort_by) q.set("sort_by", params.sort_by);
  if (params?.sort_dir) q.set("sort_dir", params.sort_dir);
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));

  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/jurnal?${q.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat jurnal keuangan");
  const json = await res.json();
  return json.data;
}

/**
 * Mengambil detail lengkap 1 nota kas beserta seluruh baris rinciannya.
 */
export async function getJurnalDetail(id: string): Promise<JurnalKeuangan> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/jurnal/${id}`, {
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Jurnal tidak ditemukan");
  return json.data;
}

/**
 * Membuat nota kas baru beserta baris-baris rinciannya.
 */
export async function createJurnalAdmin(payload: CreateJurnalPayload): Promise<JurnalKeuangan> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/jurnal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal mencatat transaksi jurnal");
  return json.data;
}

/**
 * Memperbarui nota kas beserta rincian barisnya (Simpan Sementara / Final).
 */
export async function updateJurnalAdmin(id: string, payload: UpdateJurnalPayload): Promise<JurnalKeuangan> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/jurnal/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal memperbarui transaksi jurnal");
  return json.data;
}

/**
 * Menghapus nota kas (soft delete).
 */
export async function deleteJurnalAdmin(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/keuangan/jurnal/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus transaksi jurnal");
}
