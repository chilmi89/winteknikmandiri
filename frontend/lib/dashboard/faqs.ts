import { resolveApiBase } from "@/lib/dashboard/api";

/** Satu FAQ sesuai kontrak backend Go (id berupa string UUID). */
export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FaqListResponse = {
  total: number;
  limit: number;
  offset: number;
  data: Faq[];
};

export type FaqEnvelope = {
  message?: string;
  data: Faq;
};

export type FaqListParams = {
  search?: string;
  category?: string;
  include_inactive?: boolean;
  limit?: number;
  offset?: number;
};

export type FaqPayload = {
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
};

/** Kategori yang tersedia di dropdown form dan filter FAQ. */
export const FAQ_CATEGORIES = [
  "Layanan",
  "Garansi",
  "Proyek",
  "Biaya",
  "Teknis",
  "Pemesanan",
  "Umum",
] as const;

/**
 * Mengambil daftar FAQ langsung dari REST API Golang (/api/v1/faqs).
 */
export async function listFaqs(
  params: FaqListParams = {}
): Promise<FaqListResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.category) q.set("category", params.category);
  if (params.include_inactive) q.set("include_inactive", "true");
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.offset !== undefined) q.set("offset", String(params.offset));

  const url = `${resolveApiBase()}/api/v1/faqs?${q.toString()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };
    throw new Error(
      errorJson.details || errorJson.error || `Gagal mengambil data FAQ (HTTP ${res.status})`
    );
  }

  const json = (await res.json()) as FaqListResponse;
  return {
    total: json.total ?? 0,
    limit: json.limit ?? params.limit ?? 10,
    offset: json.offset ?? params.offset ?? 0,
    data: Array.isArray(json.data) ? json.data : [],
  };
}

/**
 * Menambahkan FAQ baru ke database PostgreSQL via Golang API (POST /api/v1/faqs).
 */
export async function createFaq(payload: FaqPayload): Promise<FaqEnvelope> {
  const url = `${resolveApiBase()}/api/v1/faqs`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      question: payload.question,
      answer: payload.answer,
      category: payload.category || "Umum",
      sort_order: payload.sort_order ?? 0,
      is_active: payload.is_active ?? true,
    }),
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };
    throw new Error(
      errorJson.details || errorJson.error || `Gagal menambahkan FAQ (HTTP ${res.status})`
    );
  }

  return (await res.json()) as FaqEnvelope;
}

/**
 * Memperbarui data FAQ di database PostgreSQL via Golang API (PUT /api/v1/faqs/:id).
 */
export async function updateFaq(
  id: string,
  payload: FaqPayload
): Promise<FaqEnvelope> {
  const url = `${resolveApiBase()}/api/v1/faqs/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      question: payload.question,
      answer: payload.answer,
      category: payload.category || "Umum",
      sort_order: payload.sort_order ?? 0,
      is_active: payload.is_active ?? true,
    }),
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };
    throw new Error(
      errorJson.details || errorJson.error || `Gagal memperbarui FAQ (HTTP ${res.status})`
    );
  }

  return (await res.json()) as FaqEnvelope;
}

/**
 * Menghapus FAQ dari database PostgreSQL via Golang API (DELETE /api/v1/faqs/:id).
 */
export async function deleteFaq(id: string): Promise<{ message?: string }> {
  const url = `${resolveApiBase()}/api/v1/faqs/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };
    throw new Error(
      errorJson.details || errorJson.error || `Gagal menghapus FAQ (HTTP ${res.status})`
    );
  }

  return (await res.json()) as { message?: string };
}

export type PublicFaqItem = {
  number: string;
  question: string;
  answer: string;
};

/**
 * Mengambil daftar FAQ publik aktif untuk landing page utama.
 */
export async function getPublicFaqs(): Promise<PublicFaqItem[]> {
  try {
    const res = await listFaqs({ limit: 50 });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item, idx) => ({
        number: String(idx + 1).padStart(2, "0"),
        question: item.question,
        answer: item.answer,
      }));
    }
  } catch {
    // Graceful fallback
  }
  return [];
}
