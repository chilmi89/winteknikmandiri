import { resolveApiBase } from "@/lib/dashboard/api";

export type SosialMediaItem = {
  id: string;
  nama: string;
  link: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SosialMediaPayload = {
  nama: string;
  link: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export const defaultSosialMedia: SosialMediaItem[] = [
  {
    id: "1",
    nama: "Instagram",
    link: "https://www.instagram.com/winteknikmandiri?xtok=MWcxbWdteXR5YTNuMQ==",
    icon: "instagram",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    nama: "TikTok",
    link: "https://www.tiktok.com/@winteknikmandiri?_r=1&_t=ZS-9AmW2KKxbPB",
    icon: "tiktok",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    nama: "Facebook",
    link: "https://www.facebook.com/share/1By3XGtpVT/",
    icon: "facebook",
    sort_order: 3,
    is_active: true,
  },
];

/**
 * Mengambil daftar sosial media dari REST API Golang (GET /api/v1/sosial-media).
 * Menggunakan fallback defaultSosialMedia jika backend offline.
 */
export async function fetchSosialMediaList(
  includeInactive = false
): Promise<SosialMediaItem[]> {
  try {
    const url = `${resolveApiBase()}/api/v1/sosial-media${
      includeInactive ? "?include_inactive=true" : ""
    }`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return defaultSosialMedia;
    }

    const json = (await res.json()) as { data: SosialMediaItem[] };
    return Array.isArray(json?.data) ? json.data : defaultSosialMedia;
  } catch {
    return defaultSosialMedia;
  }
}

/**
 * Membuat data sosial media baru (POST /api/v1/sosial-media).
 */
export async function createSosialMedia(
  payload: SosialMediaPayload
): Promise<SosialMediaItem> {
  const url = `${resolveApiBase()}/api/v1/sosial-media`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || "Gagal membuat sosial media");
  }

  const json = (await res.json()) as { data: SosialMediaItem };
  return json.data;
}

/**
 * Memperbarui data sosial media (PUT /api/v1/sosial-media/:id).
 */
export async function updateSosialMedia(
  id: string,
  payload: Partial<SosialMediaPayload>
): Promise<SosialMediaItem> {
  const url = `${resolveApiBase()}/api/v1/sosial-media/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || "Gagal memperbarui sosial media");
  }

  const json = (await res.json()) as { data: SosialMediaItem };
  return json.data;
}

/**
 * Menghapus sosial media (DELETE /api/v1/sosial-media/:id).
 */
export async function deleteSosialMedia(id: string): Promise<void> {
  const url = `${resolveApiBase()}/api/v1/sosial-media/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || "Gagal menghapus sosial media");
  }
}
