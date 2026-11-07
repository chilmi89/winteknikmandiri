import { resolveApiBase } from "@/lib/dashboard/api";

export type TeamMemberItem = {
  id: string;
  name: string;
  skill: string;
  image_url: string;
  image_key?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TeamMemberListResponse = {
  message?: string;
  data: TeamMemberItem[];
};

export type TeamMemberPayload = {
  name: string;
  skill: string;
  image_url: string;
  image_key?: string;
  is_active: boolean;
};

export type UploadTeamPhotoResult = {
  image_url: string;
  image_key: string;
  original_name: string;
  format: string;
  size: number;
};

export const defaultTeamMembers: TeamMemberItem[] = [
  {
    id: "1",
    name: "Team Wahyu",
    skill: "Spesialis VRF & Unit Komersial",
    image_url: "/gallery/Foto%20TIM/Team%20Wahyu.png",
    is_active: true,
  },
  {
    id: "2",
    name: "Team Sobirin",
    skill: "Spesialis Fabrikasi & Ducting",
    image_url: "/gallery/Foto%20TIM/Team%20Sobirin.png",
    is_active: true,
  },
  {
    id: "3",
    name: "Team Junaid",
    skill: "Supervisor Proyek & Maintenance",
    image_url: "/gallery/Foto%20TIM/Team%20Junaid.png",
    is_active: true,
  },
  {
    id: "4",
    name: "Team Asep",
    skill: "Teknisi Senior Refrigerant & Electrical",
    image_url: "/gallery/Foto%20TIM/Team%20Asep.png",
    is_active: true,
  },
];

/**
 * Mengambil daftar anggota tim aktif untuk halaman Tentang Kami.
 */
export async function fetchTeamMembers(): Promise<TeamMemberItem[]> {
  try {
    const url = `${resolveApiBase()}/api/v1/teams`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return defaultTeamMembers;
    }

    const json = (await res.json()) as TeamMemberListResponse;
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }

    return defaultTeamMembers;
  } catch {
    return defaultTeamMembers;
  }
}

/**
 * Mengambil daftar tim untuk dashboard admin.
 */
export async function listTeamMembersAdmin(includeInactive = true): Promise<TeamMemberItem[]> {
  const url = `${resolveApiBase()}/api/v1/teams?include_inactive=${includeInactive ? "true" : "false"}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat tim teknisi (${res.status})`);
  }

  const json = (await res.json()) as TeamMemberListResponse;
  return json.data || [];
}

/**
 * Menambahkan tim baru.
 */
export async function createTeamMember(payload: TeamMemberPayload): Promise<TeamMemberItem> {
  const url = `${resolveApiBase()}/api/v1/teams`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: TeamMemberItem };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal menambahkan tim (${res.status})`);
  }

  return json.data;
}

/**
 * Memperbarui data tim.
 */
export async function updateTeamMember(id: string, payload: TeamMemberPayload): Promise<TeamMemberItem> {
  const url = `${resolveApiBase()}/api/v1/teams/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as { error?: string; data?: TeamMemberItem };
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Gagal memperbarui data tim (${res.status})`);
  }

  return json.data;
}

/**
 * Menghapus tim (soft delete).
 */
export async function deleteTeamMember(id: string): Promise<void> {
  const url = `${resolveApiBase()}/api/v1/teams/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || `Gagal menghapus tim (${res.status})`);
  }
}

/**
 * Mengunggah foto tim ke backend -> otomatis dikonversi ke WebP & disimpan ke MinIO folder teams/.
 */
export async function uploadTeamPhoto(file: File): Promise<UploadTeamPhotoResult> {
  const formData = new FormData();
  formData.append("image", file);

  const url = `${resolveApiBase()}/api/v1/teams/upload-photo`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const json = (await res.json()) as { error?: string } & UploadTeamPhotoResult;
  if (!res.ok || !json.image_url) {
    throw new Error(json.error || `Gagal mengunggah foto tim (${res.status})`);
  }

  return json;
}
