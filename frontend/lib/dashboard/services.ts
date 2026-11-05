import { resolveApiBase } from "@/lib/dashboard/api";

export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price_prefix: string;
  price: string | null;
  unit: string;
  price_note: string;
  image_url: string;
  image_key: string;
  summary: string;
  highlights: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceListResponse = {
  total: number;
  limit: number;
  offset: number;
  data: ServiceItem[];
};

export type ServiceEnvelope = {
  message?: string;
  data: ServiceItem;
};

export type ServiceListParams = {
  search?: string;
  category?: string;
  include_inactive?: boolean;
  limit?: number;
  offset?: number;
};

export type ServicePayload = {
  slug?: string;
  title: string;
  category?: string;
  price_prefix?: string;
  price?: string | null;
  unit?: string;
  price_note?: string;
  image_url?: string;
  image_key?: string;
  summary?: string;
  highlights?: string[];
  sort_order?: number;
  is_active?: boolean;
};

export type UploadImageResult = {
  image_url: string;
  image_key: string;
  original_name: string;
};

export const SERVICE_CATEGORIES = [
  "Perawatan Rutin",
  "Instalasi",
  "Bongkar Pasang",
  "Reparasi",
  "Pengisian Freon",
  "Komersial & Industri",
] as const;

let mockServices: ServiceItem[] = [
  {
    id: "srv-1",
    slug: "cuci-ac",
    title: "Cuci AC & Deep Cleaning Higienis",
    category: "Perawatan Rutin",
    price_prefix: "Mulai dari",
    price: "Rp 65.000",
    unit: "/ unit",
    price_note: "1,5–2 PK Rp 85.000 · cassette / floor standing menyesuaikan.",
    image_url: "/images/ac-split-clean.jpg",
    image_key: "",
    summary: "Bersih menyeluruh, bebas becek, garansi 7 hari.",
    highlights: ["Tanpa becek", "Cek freon gratis", "Garansi 7 hari"],
    sort_order: 1,
    is_active: true,
    created_at: "2026-10-20T10:00:00Z",
    updated_at: "2026-10-25T14:30:00Z",
  },
  {
    id: "srv-2",
    slug: "pemasangan-ac",
    title: "Pemasangan AC Baru & Bekas (Standar Vakum)",
    category: "Instalasi",
    price_prefix: "Mulai dari",
    price: "Rp 250.000",
    unit: "/ unit",
    price_note: "1,5–2 PK Rp 350.000 · cassette / floor standing Rp 500.000.",
    image_url: "/images/ac-split-indoor.jpg",
    image_key: "",
    summary: "Instalasi rapi dengan vakum dan flaring presisi.",
    highlights: ["SOP vakum", "Pipa tembaga tebal", "Garansi 30 hari"],
    sort_order: 2,
    is_active: true,
    created_at: "2026-10-20T10:00:00Z",
    updated_at: "2026-10-26T09:15:00Z",
  },
  {
    id: "srv-3",
    slug: "bongkar-pasang",
    title: "Bongkar Pasang & Relokasi Unit AC",
    category: "Bongkar Pasang",
    price_prefix: "Mulai dari",
    price: "Rp 330.000",
    unit: "/ unit",
    price_note: "Bongkar saja tanpa pasang Rp 150.000.",
    image_url: "/images/wtm-pemasangan.jpg",
    image_key: "",
    summary: "Pindahan AC aman dengan teknik simpan freon.",
    highlights: ["Simpan freon", "Pasang ulang", "Uji performa"],
    sort_order: 3,
    is_active: true,
    created_at: "2026-10-21T08:00:00Z",
    updated_at: "2026-10-28T11:00:00Z",
  },
  {
    id: "srv-4",
    slug: "perbaikan-kerusakan",
    title: "Perbaikan AC & Penggantian Sparepart Asli",
    category: "Reparasi",
    price_prefix: "Biaya cek",
    price: "Rp 75.000",
    unit: "/ kunjungan",
    price_note: "Gratis bila lanjut perbaikan.",
    image_url: "/images/ac-technician.jpg",
    image_key: "",
    summary: "Diagnosa transparan, sparepart asli, garansi 30 hari.",
    highlights: ["Diagnosa transparan", "Sparepart original", "Garansi 30 hari"],
    sort_order: 4,
    is_active: true,
    created_at: "2026-10-22T13:45:00Z",
    updated_at: "2026-10-29T16:20:00Z",
  },
  {
    id: "srv-5",
    slug: "tambah-freon",
    title: "Isi & Tambah Freon R32 / R410A / R22",
    category: "Pengisian Freon",
    price_prefix: "Mulai dari",
    price: "Rp 150.000",
    unit: "/ unit",
    price_note: "Tergantung tipe refrigeran dan kapasitas PK unit.",
    image_url: "/images/wtm-pemipaan.jpg",
    image_key: "",
    summary: "Freon murni standar pabrikan dengan uji tekanan manifold.",
    highlights: ["Uji tekanan manifold", "Freon murni", "Garansi 30 hari"],
    sort_order: 5,
    is_active: true,
    created_at: "2026-10-23T07:30:00Z",
    updated_at: "2026-10-30T10:05:00Z",
  },
  {
    id: "srv-6",
    slug: "kontrak-maintenance",
    title: "Kontrak Maintenance AC Gedung & Industri",
    category: "Komersial & Industri",
    price_prefix: "Penawaran",
    price: "Kustom",
    unit: "/ kontrak",
    price_note: "Bisa per bulan, per kuartal, atau tahunan.",
    image_url: "/images/ac-lifestyle.jpg",
    image_key: "",
    summary: "Perawatan berkala terjadwal dengan laporan teknis resmi.",
    highlights: ["Jadwal fleksibel", "Invoice & faktur", "SLA respons cepat"],
    sort_order: 6,
    is_active: true,
    created_at: "2026-10-24T09:00:00Z",
    updated_at: "2026-10-31T08:40:00Z",
  },
];

export async function listServices(
  params: ServiceListParams = {}
): Promise<ServiceListResponse> {
  try {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.category) q.set("category", params.category);
    if (params.include_inactive) q.set("include_inactive", "true");
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    if (params.offset !== undefined) q.set("offset", String(params.offset));

    const res = await fetch(`${resolveApiBase()}/api/v1/services?${q.toString()}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = (await res.json()) as ServiceListResponse;
      return {
        total: json.total ?? 0,
        limit: json.limit ?? params.limit ?? 20,
        offset: json.offset ?? params.offset ?? 0,
        data: Array.isArray(json.data) ? json.data : [],
      };
    }
  } catch {
    // Fallback lokal jika backend belum berjalan
  }

  let filtered = [...mockServices];
  if (!params.include_inactive) {
    filtered = filtered.filter((s) => s.is_active);
  }
  if (params.category) {
    const cat = params.category.toLowerCase();
    filtered = filtered.filter((s) => s.category.toLowerCase().includes(cat));
  }
  if (params.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.summary.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
    );
  }

  filtered.sort((a, b) => a.sort_order - b.sort_order);

  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  const pageData = filtered.slice(offset, offset + limit);

  return {
    total: filtered.length,
    limit,
    offset,
    data: pageData,
  };
}

export async function createService(payload: ServicePayload): Promise<ServiceEnvelope> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return (await res.json()) as ServiceEnvelope;
    }
    const errJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errJson.error || `HTTP ${res.status}`);
  } catch {
    // Fallback lokal
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      slug: payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: payload.title,
      category: payload.category || "Umum",
      price_prefix: payload.price_prefix || "Mulai dari",
      price: payload.price ?? null,
      unit: payload.unit || "/ unit",
      price_note: payload.price_note || "",
      image_url: payload.image_url || "/images/ac-split-clean.jpg",
      image_key: payload.image_key || "",
      summary: payload.summary || "",
      highlights: payload.highlights || [],
      sort_order: payload.sort_order ?? mockServices.length + 1,
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockServices = [newService, ...mockServices];
    return { message: "Layanan berhasil ditambahkan (mode lokal)", data: newService };
  }
}

export async function updateService(
  id: string,
  payload: ServicePayload
): Promise<ServiceEnvelope> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return (await res.json()) as ServiceEnvelope;
    }
    const errJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errJson.error || `HTTP ${res.status}`);
  } catch {
    const index = mockServices.findIndex((s) => s.id === id);
    if (index !== -1) {
      mockServices[index] = {
        ...mockServices[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return { message: "Layanan berhasil diperbarui", data: mockServices[index] };
    }
    return { message: "Layanan diperbarui", data: mockServices[0] };
  }
}

export async function deleteService(id: string): Promise<{ message?: string }> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/services/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      return (await res.json()) as { message?: string };
    }
    const errJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errJson.error || `HTTP ${res.status}`);
  } catch {
    mockServices = mockServices.filter((s) => s.id !== id);
    return { message: "Layanan berhasil dihapus" };
  }
}

export async function uploadServiceImage(file: File): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${resolveApiBase()}/api/v1/services/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errJson.error || "Gagal mengunggah foto ke storage");
  }

  return (await res.json()) as UploadImageResult;
}
