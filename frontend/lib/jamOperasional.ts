import { resolveApiBase } from "@/lib/dashboard/api";

export type JamOperasionalItem = {
  id: string;
  day_label: string;
  hours: string;
  is_closed: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type JamOperasionalSetting = {
  badge_text: string;
  title: string;
  note: string;
  updated_at?: string;
};

export type JamOperasionalBundle = {
  setting: JamOperasionalSetting;
  items: JamOperasionalItem[];
};

export type JamOperasionalBundleResponse = {
  message?: string;
  data: JamOperasionalBundle;
};

export type JamOperasionalPayload = {
  day_label: string;
  hours: string;
  is_closed: boolean;
  sort_order: number;
  is_active: boolean;
};

export type JamOperasionalSettingPayload = {
  badge_text?: string;
  title?: string;
  note?: string;
};

export const defaultJamOperasionalSetting: JamOperasionalSetting = {
  badge_text: "Buka Hari Kerja",
  title: "Jam Operasional",
  note: "* Untuk mitra kontrak pemeliharaan gedung & darurat komersial, tim standby melayani penanganan terjadwal di luar jam kantor.",
};

export const defaultJamOperasionalItems: JamOperasionalItem[] = [
  {
    id: "1",
    day_label: "Senin – Jumat",
    hours: "08.00 – 16.00",
    is_closed: false,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    day_label: "Sabtu",
    hours: "08.00 – 12.00",
    is_closed: false,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "3",
    day_label: "Minggu & tanggal merah",
    hours: "Libur",
    is_closed: true,
    sort_order: 3,
    is_active: true,
  },
];

/**
 * Mengambil bundle setting dan item jam operasional untuk halaman publik (Kontak & Footer).
 */
export async function fetchJamOperasional(): Promise<JamOperasionalBundle> {
  try {
    const url = `${resolveApiBase()}/api/v1/jam-operasional`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        setting: defaultJamOperasionalSetting,
        items: defaultJamOperasionalItems,
      };
    }

    const json = (await res.json()) as JamOperasionalBundleResponse;
    if (json.data && Array.isArray(json.data.items) && json.data.items.length > 0) {
      return json.data;
    }

    return {
      setting: defaultJamOperasionalSetting,
      items: defaultJamOperasionalItems,
    };
  } catch {
    return {
      setting: defaultJamOperasionalSetting,
      items: defaultJamOperasionalItems,
    };
  }
}

/**
 * Mengambil bundle jam operasional untuk dashboard admin (bisa menyertakan inactive).
 */
export async function listJamOperasionalAdmin(includeInactive = true): Promise<JamOperasionalBundle> {
  const url = `${resolveApiBase()}/api/v1/jam-operasional?include_inactive=${includeInactive ? "true" : "false"}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat jam operasional (${res.status})`);
  }

  const json = (await res.json()) as JamOperasionalBundleResponse;
  return json.data;
}

/**
 * Menambah baris jadwal baru.
 */
export async function createJamOperasional(payload: JamOperasionalPayload): Promise<JamOperasionalItem> {
  const url = `${resolveApiBase()}/api/v1/jam-operasional`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: JamOperasionalItem };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal menambahkan jadwal (${res.status})`);
  }

  return json.data;
}

/**
 * Memperbarui baris jadwal yang ada.
 */
export async function updateJamOperasional(id: string, payload: JamOperasionalPayload): Promise<JamOperasionalItem> {
  const url = `${resolveApiBase()}/api/v1/jam-operasional/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: JamOperasionalItem };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal memperbarui jadwal (${res.status})`);
  }

  return json.data;
}

/**
 * Menghapus baris jadwal (soft delete).
 */
export async function deleteJamOperasional(id: string): Promise<void> {
  const url = `${resolveApiBase()}/api/v1/jam-operasional/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || `Gagal menghapus jadwal (${res.status})`);
  }
}

/**
 * Memperbarui setting kartu (badge text, title, note).
 */
export async function updateJamOperasionalSetting(payload: JamOperasionalSettingPayload): Promise<JamOperasionalSetting> {
  const url = `${resolveApiBase()}/api/v1/jam-operasional/setting`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: JamOperasionalSetting };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal memperbarui pengaturan (${res.status})`);
  }

  return json.data;
}
