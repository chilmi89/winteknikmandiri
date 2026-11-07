import { resolveApiBase } from "@/lib/dashboard/api";

export type ServiceCategory = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ServiceItem = {
  id: string;
  category_id: string;
  category_name?: string;
  category_code?: string;
  title: string;
  description: string;
  highlights: string[];
  price_prefix: string;
  price: string;
  unit: string;
  price_note: string;
  image_url: string;
  image_key?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ServiceCategoryPayload = {
  code: string;
  name: string;
  is_active?: boolean;
};

export type ServiceItemPayload = {
  category_id: string;
  title: string;
  description?: string;
  highlights?: string[];
  price_prefix?: string;
  price?: string;
  unit?: string;
  price_note?: string;
  image_url?: string;
  image_key?: string;
  sort_order?: number;
  is_active?: boolean;
};

// ---------- FETCH METHODS PUBLIK ----------

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/service-categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchServiceItems(categoryID = ""): Promise<ServiceItem[]> {
  try {
    const q = categoryID ? `?category_id=${encodeURIComponent(categoryID)}` : "";
    const res = await fetch(`${resolveApiBase()}/api/v1/service-items${q}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

// ---------- CRUD METHODS ADMIN ----------

export async function listCategoriesAdmin(includeInactive = true): Promise<ServiceCategory[]> {
  const res = await fetch(
    `${resolveApiBase()}/api/v1/service-categories?include_inactive=${includeInactive}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Gagal memuat kategori");
  const json = await res.json();
  return json.data || [];
}

export async function createCategory(payload: ServiceCategoryPayload): Promise<ServiceCategory> {
  const res = await fetch(`${resolveApiBase()}/api/v1/service-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal membuat kategori");
  return json.data;
}

export async function updateCategory(id: string, payload: ServiceCategoryPayload): Promise<ServiceCategory> {
  const res = await fetch(`${resolveApiBase()}/api/v1/service-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal mengubah kategori");
  return json.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/service-categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus kategori");
}

export async function listItemsAdmin(categoryID = "", includeInactive = true): Promise<ServiceItem[]> {
  const params = new URLSearchParams();
  if (categoryID) params.set("category_id", categoryID);
  if (includeInactive) params.set("include_inactive", "true");

  const res = await fetch(`${resolveApiBase()}/api/v1/service-items?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal memuat item layanan");
  const json = await res.json();
  return json.data || [];
}

export async function createItem(payload: ServiceItemPayload): Promise<ServiceItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/service-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal membuat layanan");
  return json.data;
}

export async function updateItem(id: string, payload: ServiceItemPayload): Promise<ServiceItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/service-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.data) throw new Error(json.error || "Gagal mengubah layanan");
  return json.data;
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/service-items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus layanan");
}

export async function uploadServicePhoto(file: File): Promise<{ image_url: string; image_key: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${resolveApiBase()}/api/v1/service-items/upload-photo`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.image_url) throw new Error(json.error || "Gagal mengunggah foto");
  return json;
}
