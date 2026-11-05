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
};

export type PilarLayananListResponse = {
  message?: string;
  data: PilarLayananItem[];
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
