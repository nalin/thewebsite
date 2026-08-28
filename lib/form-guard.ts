import { createHmac, timingSafeEqual } from "crypto";

// Anti-spam guard for the public signup forms (issue #203).
//
// Threat model: the August 2026 campaign POSTed harvested addresses straight to
// /api/course/access and /api/waitlist without ever fetching a page (525 wall
// submits against a single tracked page view). The token below is embedded in
// the server-rendered form, so accepting only requests that carry it forces a
// bot to fetch the page first — which this class of bot does not do.
//
// The token is deliberately CONSTANT per secret, not time-bucketed: the
// homepage and lead-magnet pages are fully static, so a rotating token would
// expire between deploys and silently reject real visitors. The cost is that a
// bot which does fetch a page can replay the token; the honeypot field and the
// send caps in the routes cover that escalation, and rotating the secret (or
// bumping the version string) invalidates any harvested value.
//
// Same-origin checks are NOT part of this guard on purpose: the campaign
// already forged a same-origin Referer, so header checks add nothing here.

export const FORM_TOKEN_FIELD = "form_token";
// Named to look like a real field so naive form-fillers complete it. Real
// browsers never show it (see SignupGuardFields) and autofill is disabled.
export const HONEYPOT_FIELD = "website";

function secret(): string {
  return process.env.FORM_TOKEN_SECRET || process.env.AUTH_SECRET || "";
}

export function formToken(): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update("signup-form-token-v1").digest("hex");
}

export type FormRejection = "honeypot" | "missing_token" | "bad_token";

// Fails open when no secret is configured (local dev without env), so a
// misconfigured deploy degrades to the pre-guard behaviour instead of taking
// signups down.
export function verifySignupForm(
  formData: FormData
): { ok: true } | { ok: false; reason: FormRejection } {
  const honey = formData.get(HONEYPOT_FIELD);
  if (typeof honey === "string" && honey.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const expected = formToken();
  if (!expected) return { ok: true };

  const got = formData.get(FORM_TOKEN_FIELD);
  if (typeof got !== "string" || got.length === 0) {
    return { ok: false, reason: "missing_token" };
  }
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_token" };
  }
  return { ok: true };
}
