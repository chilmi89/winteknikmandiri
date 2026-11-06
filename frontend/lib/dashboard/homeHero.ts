import { resolveApiBase } from "@/lib/dashboard/api";
import type { HomeHeroData } from "@/components/dashboard/home-hero/HomeHeroManager";

export type HomeHeroResponse = {
  message?: string;
  data: {
    id: number;
    badge_text: string;
    badge_colors: Record<string, string>;
    title: string;
    title_color: string;
    title_highlight_color: string;
    title_colors: Record<string, string>;
    slogan: string;
    slogan_colors: Record<string, string>;
    description: string;
    description_colors: Record<string, string>;
    media_type: "image" | "video";
    media_url: string;
    thumbnail_url: string;
    cta_primary_text: string;
    cta_primary_url: string;
    cta_secondary_text: string;
    cta_secondary_url: string;
    is_active: boolean;
  };
};

/**
 * Mengambil data konfigurasi Hero aktif dari REST API Golang (GET /api/v1/home-hero).
 */
export async function fetchHomeHero(): Promise<HomeHeroData | null> {
  try {
    const url = `${resolveApiBase()}/api/v1/home-hero`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as HomeHeroResponse;
    if (!json.data) return null;

    const d = json.data;

    // Normalisasi Record<string, string> ke Record<number, string>
    const normalizeColors = (raw: Record<string, string> | undefined): Record<number, string> => {
      const res: Record<number, string> = {};
      if (raw) {
        for (const [k, v] of Object.entries(raw)) {
          const idx = parseInt(k, 10);
          if (!isNaN(idx)) {
            res[idx] = v;
          }
        }
      }
      return res;
    };

    return {
      badge_text: d.badge_text || "KONTRAKTOR AC • KEDIRI • SEJAK 2014",
      badge_colors: normalizeColors(d.badge_colors),
      title: d.title || "WIN TEKNIK MANDIRI AC KEDIRI",
      title_colors: normalizeColors(d.title_colors),
      slogan: d.slogan || "FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS",
      slogan_colors: normalizeColors(d.slogan_colors),
      description: d.description || "Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk hunian, komersial, dan industri di Kediri Raya",
      description_colors: normalizeColors(d.description_colors),
      media_type: d.media_type || "video",
      media_url: d.media_url || "/hero-section/video_hero_ac.mp4",
      thumbnail_url: d.thumbnail_url || "/images/wtm-pemasangan.jpg",
      cta_primary_text: d.cta_primary_text || "Konsultasi via WhatsApp",
      cta_primary_url: d.cta_primary_url || "https://wa.me/6281216622840",
      cta_secondary_text: d.cta_secondary_text || "Lihat layanan",
      cta_secondary_url:
        d.cta_secondary_url && d.cta_secondary_url !== "#sosial-media"
          ? d.cta_secondary_url
          : "#layanan",
      is_active: d.is_active ?? true,
    };
  } catch {
    return null;
  }
}

/**
 * Menyimpan konfigurasi Hero ke REST API Golang (PUT /api/v1/home-hero).
 */
export async function updateHomeHero(data: HomeHeroData): Promise<HomeHeroResponse> {
  const url = `${resolveApiBase()}/api/v1/home-hero`;

  // Konversi Record<number, string> ke Record<string, string> untuk JSON
  const mapToStringKeys = (m: Record<number, string>): Record<string, string> => {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(m)) {
      res[k] = v;
    }
    return res;
  };

  const payload = {
    badge_text: data.badge_text,
    badge_colors: mapToStringKeys(data.badge_colors),
    title: data.title,
    title_colors: mapToStringKeys(data.title_colors),
    slogan: data.slogan,
    slogan_colors: mapToStringKeys(data.slogan_colors),
    description: data.description,
    description_colors: mapToStringKeys(data.description_colors),
    media_type: data.media_type,
    media_url: data.media_url,
    thumbnail_url: data.thumbnail_url,
    cta_primary_text: data.cta_primary_text,
    cta_primary_url: data.cta_primary_url,
    cta_secondary_text: data.cta_secondary_text,
    cta_secondary_url: data.cta_secondary_url,
    is_active: data.is_active,
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return (await res.json()) as HomeHeroResponse;
}

/**
 * Mengunggah file media (video/foto) banner hero ke backend (MinIO / storage).
 */
export async function uploadHeroMedia(file: File): Promise<{ url: string }> {
  const url = `${resolveApiBase()}/api/v1/home-hero/upload`;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };
    throw new Error(
      err.details || err.error || `Upload gagal (HTTP ${res.status})`
    );
  }

  const json = (await res.json()) as { message?: string; url: string };
  return { url: json.url };
}
