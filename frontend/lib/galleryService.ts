import { resolveApiBase } from "@/lib/dashboard/api";

export type GalleryProject = {
  id: string;
  title: string;
  category: string;
  client: string;
  scope: string;
  location: string;
  image_url: string;
  image_key?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CategoryCountItem = {
  category: string;
  count: number;
};

export type GalleryBundleData = {
  total: number;
  categories: CategoryCountItem[];
  items: GalleryProject[];
};

export type GalleryBundleResponse = {
  message?: string;
  data: GalleryBundleData;
};

export type GalleryPayload = {
  title: string;
  category: string;
  client?: string;
  scope?: string;
  location?: string;
  image_url: string;
  image_key?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type UploadGalleryPhotoResult = {
  image_url: string;
  image_key: string;
  original_name: string;
  format: string;
  size: number;
};

/**
 * Mengambil bundle portofolio galeri untuk halaman publik (/galeri).
 */
export async function fetchGalleryBundle(category = ""): Promise<GalleryBundleData | null> {
  try {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    const url = `${resolveApiBase()}/api/v1/gallery${q}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const json = (await res.json()) as GalleryBundleResponse;
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Mengambil bundle portofolio galeri untuk dashboard admin (include inactive).
 */
export async function listGalleryAdmin(category = "", includeInactive = true): Promise<GalleryBundleData> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (includeInactive) params.set("include_inactive", "true");

  const url = `${resolveApiBase()}/api/v1/gallery?${params.toString()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat galeri proyek (${res.status})`);
  }

  const json = (await res.json()) as GalleryBundleResponse;
  return json.data;
}

/**
 * Menambahkan proyek galeri baru.
 */
export async function createGalleryProject(payload: GalleryPayload): Promise<GalleryProject> {
  const url = `${resolveApiBase()}/api/v1/gallery`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: GalleryProject };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal menambahkan proyek (${res.status})`);
  }

  return json.data;
}

/**
 * Memperbarui proyek galeri.
 */
export async function updateGalleryProject(id: string, payload: GalleryPayload): Promise<GalleryProject> {
  const url = `${resolveApiBase()}/api/v1/gallery/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: GalleryProject };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal memperbarui proyek (${res.status})`);
  }

  return json.data;
}

/**
 * Menghapus proyek galeri (soft delete).
 */
export async function deleteGalleryProject(id: string): Promise<void> {
  const url = `${resolveApiBase()}/api/v1/gallery/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || `Gagal menghapus proyek (${res.status})`);
  }
}

/**
 * Mengunggah foto galeri ke backend -> otomatis dikonversi ke WebP & disimpan ke MinIO folder gallery/.
 */
export async function uploadGalleryPhoto(file: File): Promise<UploadGalleryPhotoResult> {
  const formData = new FormData();
  formData.append("image", file);

  const url = `${resolveApiBase()}/api/v1/gallery/upload-photo`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const json = (await res.json()) as { error?: string } & UploadGalleryPhotoResult;
  if (!res.ok || !json.image_url) {
    throw new Error(json.error || `Gagal mengunggah foto galeri (${res.status})`);
  }

  return json;
}
