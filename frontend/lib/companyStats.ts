import { resolveApiBase } from "@/lib/dashboard/api";

export type CompanyStatItem = {
  id: string;
  label: string;
  value: string;
  target_number: number;
  has_plus: boolean;
  keterangan: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreateCompanyStatPayload = {
  label: string;
  value: string;
  target_number?: number;
  has_plus?: boolean;
  keterangan?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateCompanyStatPayload = {
  label?: string;
  value?: string;
  target_number?: number;
  has_plus?: boolean;
  keterangan?: string;
  sort_order?: number;
  is_active?: boolean;
};

export const defaultCompanyStats: CompanyStatItem[] = [
  {
    id: "1",
    label: "Berdiri Sejak",
    value: "2014",
    target_number: 2014,
    has_plus: false,
    keterangan: "Melayani jasa instalasi, pengadaan, dan perawatan pendingin udara HVAC terpercaya di Kediri sejak 2014.",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    label: "Proyek Selesai",
    value: "364+",
    target_number: 364,
    has_plus: true,
    keterangan: "Penanganan tata udara di sekolahan, retail mall, perkantoran, dan kawasan industri komersial.",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    label: "Proyek Berjalan",
    value: "36+",
    target_number: 36,
    has_plus: true,
    keterangan: "Pekerjaan instalasi baru dan kontrak pemeliharaan berkala aktif yang sedang ditangani teknisi.",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "4",
    label: "Mitra Korporasi",
    value: "20+",
    target_number: 20,
    has_plus: true,
    keterangan: "Kemitraan jangka panjang dengan tenant ritel nasional, pengelola gedung, dan pabrik.",
    sort_order: 4,
    is_active: true,
  },
];

/**
 * Mengambil statistik aktif untuk halaman publik (Beranda, Tentang Kami, Galeri).
 */
export async function fetchCompanyStats(): Promise<CompanyStatItem[]> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/company-stats`, {
      cache: "no-store",
    });
    if (!res.ok) return defaultCompanyStats;
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return defaultCompanyStats;
  } catch {
    return defaultCompanyStats;
  }
}

/**
 * Mengambil seluruh statistik untuk dashboard admin.
 */
export async function listCompanyStatsAdmin(): Promise<CompanyStatItem[]> {
  const res = await fetch(`${resolveApiBase()}/api/v1/company-stats/admin`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat data statistik");
  const json = await res.json();
  return json.data || [];
}

/**
 * Tambah statistik baru.
 */
export async function createCompanyStat(payload: CreateCompanyStatPayload): Promise<CompanyStatItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/company-stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal membuat statistik");
  return json.data;
}

/**
 * Update data statistik.
 */
export async function updateCompanyStat(id: string, payload: UpdateCompanyStatPayload): Promise<CompanyStatItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/company-stats/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal memperbarui statistik");
  return json.data;
}

/**
 * Toggle status aktif/nonaktif.
 */
export async function toggleCompanyStat(id: string): Promise<CompanyStatItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/company-stats/${id}/toggle`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal mengubah status aktif");
  return json.data;
}

/**
 * Hapus data statistik.
 */
export async function deleteCompanyStat(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/company-stats/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus data statistik");
}
