import { resolveApiBase } from "@/lib/dashboard/api";

export type VisiSetting = {
  visi_eyebrow: string;
  visi_text: string;
  updated_at?: string;
};

export type MisiItem = {
  id: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type VisiMisiBundle = {
  visi: VisiSetting;
  misi: MisiItem[];
};

export type MisiPayload = {
  code: string;
  title: string;
  tagline: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export const defaultVisiSetting: VisiSetting = {
  visi_eyebrow: "Visi Perusahaan",
  visi_text:
    "Menghadirkan layanan tata udara yang terpercaya, efisien, dan inovatif untuk memenuhi kebutuhan sektor hunian, komersial, hingga industri.",
};

export const defaultMisiItems: MisiItem[] = [
  {
    id: "1",
    code: "01",
    title: "Layanan Prima",
    tagline: "Presisi & Tepat Waktu",
    description:
      "Menghadirkan pengerjaan instalasi, perawatan berkala, dan reparasi unit AC yang rapi, tepat jadwal, serta berstandar teknis pabrikan.",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    code: "02",
    title: "Solusi Efisien",
    tagline: "Kalkulasi Beban Ruang",
    description:
      "Merancang sistem tata udara yang hemat konsumsi daya dan presisi sesuai perhitungan beban termal ruang hunian, komersial, maupun industri.",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    code: "03",
    title: "Teknisi Profesional",
    tagline: "SOP & Integritas Tinggi",
    description:
      "Menerjunkan teknisi bersertifikasi yang berintegritas tinggi, teliti dalam pengelasan pipa, dan mengutamakan keselamatan kerja.",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "4",
    code: "04",
    title: "Kemitraan Berkelanjutan",
    tagline: "Garansi Tertulis 30 Hari",
    description:
      "Membangun hubungan jangka panjang melalui transparansi rincian biaya, respon tanggap darurat, dan jaminan garansi resmi tertulis.",
    sort_order: 4,
    is_active: true,
  },
];

/**
 * Mengambil bundle visi dan misi perusahaan dari REST API Golang (GET /api/v1/visi-misi).
 */
export async function fetchVisiMisi(
  includeInactive = false
): Promise<VisiMisiBundle> {
  try {
    const url = `${resolveApiBase()}/api/v1/visi-misi${
      includeInactive ? "?include_inactive=true" : ""
    }`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        visi: defaultVisiSetting,
        misi: defaultMisiItems,
      };
    }

    const json = (await res.json()) as { data: VisiMisiBundle };
    return {
      visi: json.data?.visi || defaultVisiSetting,
      misi: Array.isArray(json.data?.misi) ? json.data.misi : defaultMisiItems,
    };
  } catch {
    return {
      visi: defaultVisiSetting,
      misi: defaultMisiItems,
    };
  }
}

/**
 * Memperbarui kutipan visi perusahaan (PUT /api/v1/visi-misi/visi).
 */
export async function updateVisiSetting(
  visiText: string,
  visiEyebrow = "Visi Perusahaan"
): Promise<VisiSetting> {
  const url = `${resolveApiBase()}/api/v1/visi-misi/visi`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      visi_text: visiText,
      visi_eyebrow: visiEyebrow,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Gagal memperbarui visi perusahaan");
  }

  const json = (await res.json()) as { data: VisiSetting };
  return json.data;
}

/**
 * Membuat butir misi baru (POST /api/v1/visi-misi/misi).
 */
export async function createMisi(payload: MisiPayload): Promise<MisiItem> {
  const url = `${resolveApiBase()}/api/v1/visi-misi/misi`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Gagal membuat butir misi");
  }

  const json = (await res.json()) as { data: MisiItem };
  return json.data;
}

/**
 * Memperbarui butir misi (PUT /api/v1/visi-misi/misi/:id).
 */
export async function updateMisi(
  id: string,
  payload: Partial<MisiPayload>
): Promise<MisiItem> {
  const url = `${resolveApiBase()}/api/v1/visi-misi/misi/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Gagal memperbarui butir misi");
  }

  const json = (await res.json()) as { data: MisiItem };
  return json.data;
}

/**
 * Menghapus butir misi (DELETE /api/v1/visi-misi/misi/:id).
 */
export async function deleteMisi(id: string): Promise<void> {
  const url = `${resolveApiBase()}/api/v1/visi-misi/misi/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Gagal menghapus butir misi");
  }
}
