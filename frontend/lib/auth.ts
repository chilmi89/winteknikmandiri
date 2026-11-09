import { resolveApiBase } from "@/lib/dashboard/api";

export const AUTH_COOKIE_NAME = "wtm_admin_session";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  name: string;
};

export type LoginResult = {
  success: boolean;
  user?: AdminUser;
  error?: string;
};

/**
 * Melakukan verifikasi login ke backend Go Gin (/api/v1/auth/login).
 * Jika berhasil, otomatis menyimpan cookie session browser.
 */
export async function loginAdmin(
  identifier: string,
  password: string
): Promise<LoginResult> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: identifier.trim(),
        password: password.trim(),
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.data) {
      return {
        success: false,
        error: json.error || "Username atau kata sandi tidak cocok.",
      };
    }

    const user: AdminUser = json.data;

    // Pasang session cookie di browser (berlaku 7 hari)
    const sessionData = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        loginAt: Date.now(),
      })
    );

    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${AUTH_COOKIE_NAME}=${sessionData}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${
      isSecure ? "; Secure" : ""
    }`;

    return {
      success: true,
      user,
    };
  } catch {
    return {
      success: false,
      error: "Gagal terhubung ke server. Periksa koneksi internet Anda.",
    };
  }
}

/**
 * Mengambil data session user yang sedang login dari cookie.
 */
export function getAdminSession(): AdminUser | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === AUTH_COOKIE_NAME && value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        return {
          id: parsed.id,
          username: parsed.username,
          email: parsed.email,
          name: parsed.name,
        };
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Melakukan logout dengan menghapus cookie session.
 */
export function logoutAdmin(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
