import type { Inquiry, InquiriesResponse } from "@/lib/dashboard/types";

/**
 * Di production (VPS) request lewat Caddy pada origin yang sama,
 * jadi base URL cukup relatif ("") agar tidak salah arah ke localhost.
 * Di `next dev` (port 3000/3001) backend Go berjalan di :8080.
 */
export function resolveApiBase(): string {
  const internal = process.env.INTERNAL_API_URL?.trim();
  if (typeof window === "undefined" && internal) {
    return internal.replace(/\/$/, "");
  }

  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { port, protocol, hostname } = window.location;
    if (port === "3000" || port === "3001") {
      return `${protocol}//${hostname}:8080`;
    }
  }

  // Server-side fallback untuk development lokal
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  return "";
}

export const demoInquiries: Inquiry[] = [
  {
    id: "1",
    name: "Budi Santoso",
    phone: "0812-1662-2840",
    service: "Instalasi VRF & Ducting",
    address: "Jl. Dhoho No. 12, Kediri",
    notes: "Survey lokasi gedung 3 lantai, butuh 6 unit indoor.",
    status: "diproses",
    created_at: "2026-10-30T09:24:00+07:00",
    updated_at: "2026-10-30T09:24:00+07:00",
  },
  {
    id: "2",
    name: "Siti Aminah",
    phone: "0813-3355-1122",
    service: "Cuci AC Berkala",
    address: "Perumahan Ngadiluwih Blok C-4",
    notes: "3 unit AC split, minta jadwal akhir pekan.",
    status: "pending",
    created_at: "2026-10-30T08:02:00+07:00",
    updated_at: "2026-10-30T08:02:00+07:00",
  },
  {
    id: "3",
    name: "PT Sinar Pangan",
    phone: "0812-9900-4411",
    service: "Fabrikasi Ducting BJLS",
    address: "Kawasan Industri Pare, Kediri",
    notes: "Ducting exhaust dapur produksi, panjang ± 24 meter.",
    status: "selesai",
    created_at: "2026-10-29T14:15:00+07:00",
    updated_at: "2026-10-30T07:10:00+07:00",
  },
  {
    id: "4",
    name: "Andi Pratama",
    phone: "0857-8181-2020",
    service: "Tambah Freon & Perbaikan",
    address: "Jl. Mastrip No. 88, Kediri",
    notes: "AC tidak dingin sejak seminggu, ada bunyi kasar.",
    status: "pending",
    created_at: "2026-10-29T11:40:00+07:00",
    updated_at: "2026-10-29T11:40:00+07:00",
  },
  {
    id: "5",
    name: "Mall Galeria Bali",
    phone: "0361-770-881",
    service: "Maintenance AHU",
    address: "Kuta, Bali",
    notes: "Kontrak pemeliharaan AHU bulanan, 4 unit.",
    status: "diproses",
    created_at: "2026-10-28T16:05:00+07:00",
    updated_at: "2026-10-29T09:00:00+07:00",
  },
  {
    id: "6",
    name: "Dewi Lestari",
    phone: "0821-4477-9090",
    service: "Pemasangan AC Baru",
    address: "Jl. Kilisuci No. 21, Kediri",
    notes: "Pasang 2 unit AC 1 PK + pipa 5 meter.",
    status: "selesai",
    created_at: "2026-10-28T10:30:00+07:00",
    updated_at: "2026-10-28T15:45:00+07:00",
  },
  {
    id: "7",
    name: "CV Bumi Teknik",
    phone: "0812-3555-7788",
    service: "Instalasi Exhaust",
    address: "Ngadiluwih, Kediri",
    notes: "Butuh penawaran resmi untuk proyek gudang.",
    status: "pending",
    created_at: "2026-10-27T13:20:00+07:00",
    updated_at: "2026-10-27T13:20:00+07:00",
  },
  {
    id: "8",
    name: "Rudi Hartono",
    phone: "0856-1122-3344",
    service: "Service AC Panggilan",
    address: "Jl. PB Sudirman No. 5, Kediri",
    notes: "AC kamar tidur mati total, minta dicek hari ini.",
    status: "diproses",
    created_at: "2026-10-27T08:55:00+07:00",
    updated_at: "2026-10-27T10:15:00+07:00",
  },
  {
    id: "9",
    name: "SMA Negeri 2 Kediri",
    phone: "0354-771-220",
    service: "Instalasi AC Ruang Kelas",
    address: "Jl. Veteran No. 12, Kediri",
    notes: "Pengadaan 8 unit AC untuk 4 ruang kelas.",
    status: "pending",
    created_at: "2026-10-26T15:10:00+07:00",
    updated_at: "2026-10-26T15:10:00+07:00",
  },
  {
    id: "10",
    name: "Ayu Wulandari",
    phone: "0819-7788-5566",
    service: "Cuci AC Berkala",
    address: "Perumahan Pesantren Indah, Kediri",
    notes: "Langganan cuci AC setiap 4 bulan.",
    status: "selesai",
    created_at: "2026-10-25T09:05:00+07:00",
    updated_at: "2026-10-25T13:30:00+07:00",
  },
  {
    id: "11",
    name: "Hotel Merdeka",
    phone: "0354-682-900",
    service: "Perbaikan Chiller",
    address: "Jl. Basuki Rahmat, Kediri",
    notes: "Chiller lantai 2 overheat, butuh teknisi bersertifikat.",
    status: "diproses",
    created_at: "2026-10-24T17:40:00+07:00",
    updated_at: "2026-10-25T08:20:00+07:00",
  },
  {
    id: "12",
    name: "Joko Susilo",
    phone: "0812-2020-3030",
    service: "Bongkar Pasang AC",
    address: "Jl. Joyoboyo No. 44, Kediri",
    notes: "Pindah AC ke rumah baru, 1 unit.",
    status: "batal",
    created_at: "2026-10-24T10:00:00+07:00",
    updated_at: "2026-10-24T12:00:00+07:00",
  },
  {
    id: "13",
    name: "Toko Sumber Rejeki",
    phone: "0857-3344-8899",
    service: "Instalasi Cold Storage",
    address: "Pasar Setono Betek, Kediri",
    notes: "Cold storage 4x3 meter untuk produk beku.",
    status: "pending",
    created_at: "2026-10-23T14:25:00+07:00",
    updated_at: "2026-10-23T14:25:00+07:00",
  },
  {
    id: "14",
    name: "Rina Marlina",
    phone: "0821-6655-4433",
    service: "Tambah Freon & Perbaikan",
    address: "Jl. Erlangga No. 7, Kediri",
    notes: "AC bocor freon, minta pengecekan kebocoran.",
    status: "selesai",
    created_at: "2026-10-22T11:15:00+07:00",
    updated_at: "2026-10-22T16:40:00+07:00",
  },
];

export type FetchInquiriesResult = {
  data: Inquiry[];
  total: number;
  offline: boolean;
};

/** Ambil data permohonan dari API Go Gin; fallback ke data demo bila gagal. */
export async function fetchInquiries(
  limit = 100
): Promise<FetchInquiriesResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `${resolveApiBase()}/api/v1/inquiries?limit=${limit}`,
      { cache: "no-store", signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = (await res.json()) as InquiriesResponse;
    const data = Array.isArray(payload.data) ? payload.data : [];

    return { data, total: payload.total ?? data.length, offline: false };
  } catch {
    return {
      data: demoInquiries,
      total: demoInquiries.length,
      offline: true,
    };
  }
}
