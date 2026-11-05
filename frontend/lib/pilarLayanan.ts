import { resolveApiBase } from "@/lib/dashboard/api";

export type PilarLayananItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  link_url: string;
  is_featured: boolean;
  cta_text: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PilarLayananListResponse = {
  message?: string;
  data: PilarLayananItem[];
};

export type PilarLayananSingleResponse = {
  message?: string;
  data: PilarLayananItem;
};

export type PilarLayananPayload = {
  code: string;
  title: string;
  description: string;
  link_url: string;
  is_featured: boolean;
  cta_text: string;
  sort_order: number;
  is_active: boolean;
};

export const defaultPilarLayanan: PilarLayananItem[] = [
  {
    id: "1",
    code: "01",
    title: "Supply & pengadaan AC",
    description:
      "Split, cassette, floor standing, hingga VRF/VRV dari berbagai merk.",
    link_url: "/layanan",
    is_featured: false,
    cta_text: "",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    code: "02",
    title: "Instalasi AC konvensional & VRF",
    description:
      "Pemipaan tembaga presisi, flaring, dan vakum sesuai spesifikasi pabrikan.",
    link_url: "/layanan",
    is_featured: false,
    cta_text: "",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    code: "03",
    title: "Maintenance & services",
    description:
      "Perawatan berkala, pembersihan kimia, perbaikan PCB, dan kompresor.",
    link_url: "/layanan",
    is_featured: false,
    cta_text: "",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "4",
    code: "04",
    title: "Supply & pengadaan ducting",
    description: "Fabrikasi dan pengadaan BJLS, PU duct, serta spiral duct.",
    link_url: "/layanan",
    is_featured: false,
    cta_text: "",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "5",
    code: "05",
    title: "Instalasi ducting",
    description:
      "Sekolah, rumah sakit, perkantoran, tenant mall, dan fasilitas industri.",
    link_url: "/layanan",
    is_featured: false,
    cta_text: "",
    sort_order: 5,
    is_active: true,
  },
  {
    id: "6",
    code: "06",
    title: "Butuh kombinasi layanan?",
    description: "Diskusikan kebutuhan proyek Anda dengan tim kami.",
    link_url:
      "https://wa.me/6281216622840?text=Halo%20CV%20Win%20Teknik%20Mandiri%2C%20saya%20ingin%20mendiskusikan%20kebutuhan%20AC%20atau%20ducting%20untuk%20proyek%20saya.",
    is_featured: true,
    cta_text: "Konsultasi",
    sort_order: 6,
    is_active: true,
  },
];

/**
 * Mengambil data pilar layanan aktif dari REST API Golang (GET /api/v1/pilar-layanan).
 * Menggunakan fallback defaultPilarLayanan jika backend belum aktif/offline.
 */
export async function fetchPilarLayanan(): Promise<PilarLayananItem[]> {
  try {
    const url = `${resolveApiBase()}/api/v1/pilar-layanan`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return defaultPilarLayanan;
    }

    const json = (await res.json()) as PilarLayananListResponse;
    if (Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }

    return defaultPilarLayanan;
  } catch {
    return defaultPilarLayanan;
  }
}

/**
 * Mengambil seluruh daftar pilar layanan untuk dashboard admin (bisa menyertakan inactive).
 */
export async function listPilarLayananAdmin(includeInactive = true): Promise<PilarLayananItem[]> {
  const url = `${resolveApiBase()}/api/v1/pilar-layanan?include_inactive=${includeInactive ? "true" : "false"}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat data pilar layanan (${res.status})`);
  }

  const json = (await res.json()) as PilarLayananListResponse;
  return json.data || [];
}

/**
 * Menambahkan data kartu pilar layanan baru.
 */
export async function createPilarLayanan(payload: PilarLayananPayload): Promise<PilarLayananItem> {
  const url = `${resolveApiBase()}/api/v1/pilar-layanan`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: PilarLayananItem };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal menambahkan pilar layanan (${res.status})`);
  }

  return json.data;
}

/**
 * Memperbarui data pilar layanan yang ada.
 */
export async function updatePilarLayanan(id: string, payload: PilarLayananPayload): Promise<PilarLayananItem> {
  const url = `${resolveApiBase()}/api/v1/pilar-layanan/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: PilarLayananItem };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal memperbarui pilar layanan (${res.status})`);
  }

  return json.data;
}

/**
 * Menghapus pilar layanan (soft delete).
 */
export async function deletePilarLayanan(id: string): Promise<void> {
  const url = `${resolveApiBase()}/api/v1/pilar-layanan/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || `Gagal menghapus pilar layanan (${res.status})`);
  }
}
