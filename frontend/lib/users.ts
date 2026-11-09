import { resolveApiBase } from "@/lib/dashboard/api";

export type UserItem = {
  id: string;
  name: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUserPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type UpdateUserPayload = {
  name: string;
  username: string;
  email: string;
  is_active?: boolean;
};

export type ResetPasswordPayload = {
  new_password: string;
};

/**
 * Mengambil daftar seluruh pengguna dari API Go.
 */
export async function fetchUsers(): Promise<UserItem[]> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/users`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Membuat akun pengguna baru.
 */
export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.data) {
    throw new Error(json.error || "Gagal membuat pengguna baru");
  }

  return json.data;
}

/**
 * Memperbarui profil pengguna (nama, username, email).
 */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserItem> {
  const res = await fetch(`${resolveApiBase()}/api/v1/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.data) {
    throw new Error(json.error || "Gagal memperbarui pengguna");
  }

  return json.data;
}

/**
 * Reset / ganti kata sandi pengguna oleh admin.
 */
export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/users/${id}/reset-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_password: newPassword }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Gagal mengganti kata sandi");
  }
}

/**
 * Menghapus akun pengguna (soft delete).
 */
export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${resolveApiBase()}/api/v1/users/${id}`, {
    method: "DELETE",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Gagal menghapus pengguna");
  }
}
