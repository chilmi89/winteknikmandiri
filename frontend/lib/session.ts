const DEFAULT_AUTH_SECRET =
  process.env.AUTH_SECRET || "wtm-secret-key-cv-win-teknik-mandiri-2026-s3cur3";

/**
 * Menandatangani payload session menggunakan algoritma kriptografi HMAC-SHA256
 * berbasis Web Crypto API (didukung penuh di browser, Next.js Edge Runtime, dan Node.js).
 */
export async function signSession(
  payload: string,
  secret = DEFAULT_AUTH_SECRET
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Format token: Base64Payload.HmacSignature
  const b64Payload = btoa(unescape(encodeURIComponent(payload)));
  return `${b64Payload}.${hashHex}`;
}

/**
 * Memverifikasi keaslian tanda tangan session.
 * Mengembalikan objek payload jika valid, atau null jika tanda tangan dipalsukan/dimanipulasi.
 */
export async function verifySession<T = unknown>(
  token: string,
  secret = DEFAULT_AUTH_SECRET
): Promise<T | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [b64Payload, signatureHex] = parts;

    const payload = decodeURIComponent(escape(atob(b64Payload)));
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return null;
    const sigBytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payload)
    );

    if (!isValid) return null;
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}
