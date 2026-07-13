// Signed course-access cookie helpers. Web Crypto only — no db/email imports —
// so middleware can import this without dragging server-only deps into the
// edge bundle.

export const ACCESS_COOKIE = "course_access";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return new Uint8Array(sig);
}

export async function signAccessCookie(email: string): Promise<string> {
  const payload = b64url(new TextEncoder().encode(email.toLowerCase()));
  const sig = b64url(await hmac(payload));
  return `v1.${payload}.${sig}`;
}

// Returns the verified email, or null if the cookie is missing/invalid.
export async function verifyAccessCookie(
  value: string | undefined
): Promise<string | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  try {
    const expected = b64url(await hmac(parts[1]));
    if (expected.length !== parts[2].length) return null;
    // Constant-time-ish comparison
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ parts[2].charCodeAt(i);
    }
    if (diff !== 0) return null;
    return new TextDecoder().decode(b64urlDecode(parts[1]));
  } catch {
    return null;
  }
}
