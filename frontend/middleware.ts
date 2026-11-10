import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

const AUTH_COOKIE_NAME = "wtm_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Verifikasi keaslian tanda tangan session kriptografi HMAC-SHA256
  let isValidSession = false;
  if (rawCookie) {
    const sessionToken = decodeURIComponent(rawCookie);
    const sessionPayload = await verifySession(sessionToken);
    if (sessionPayload) {
      isValidSession = true;
    }
  }

  // 1. Proteksi seluruh rute /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      // Bersihkan cookie palsu / kedaluwarsa jika ada
      if (rawCookie) {
        res.cookies.delete(AUTH_COOKIE_NAME);
      }
      return res;
    }
    return NextResponse.next();
  }

  // 2. Jika user sudah login dengan session valid dan mengakses /login, arahkan ke /dashboard
  if (pathname === "/login") {
    if (isValidSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
