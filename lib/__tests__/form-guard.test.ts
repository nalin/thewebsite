import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  formToken,
  verifySignupForm,
  FORM_TOKEN_FIELD,
  HONEYPOT_FIELD,
} from "../form-guard";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("form-guard", () => {
  const savedFormSecret = process.env.FORM_TOKEN_SECRET;
  const savedAuthSecret = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.FORM_TOKEN_SECRET = "test-secret";
  });

  afterEach(() => {
    if (savedFormSecret === undefined) delete process.env.FORM_TOKEN_SECRET;
    else process.env.FORM_TOKEN_SECRET = savedFormSecret;
    if (savedAuthSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = savedAuthSecret;
  });

  it("accepts a submission carrying the rendered token", () => {
    const result = verifySignupForm(
      form({ email: "a@b.c", [FORM_TOKEN_FIELD]: formToken() })
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a direct POST with no token — the #203 campaign shape", () => {
    const result = verifySignupForm(form({ email: "a@b.c" }));
    expect(result).toEqual({ ok: false, reason: "missing_token" });
  });

  it("rejects a forged token", () => {
    const result = verifySignupForm(
      form({ email: "a@b.c", [FORM_TOKEN_FIELD]: "f".repeat(64) })
    );
    expect(result).toEqual({ ok: false, reason: "bad_token" });
  });

  it("rejects a filled honeypot even when the token is valid", () => {
    const result = verifySignupForm(
      form({
        email: "a@b.c",
        [FORM_TOKEN_FIELD]: formToken(),
        [HONEYPOT_FIELD]: "https://spam.example",
      })
    );
    expect(result).toEqual({ ok: false, reason: "honeypot" });
  });

  it("token changes when the secret rotates, invalidating harvested values", () => {
    const before = formToken();
    process.env.FORM_TOKEN_SECRET = "rotated-secret";
    expect(formToken()).not.toBe(before);
    const result = verifySignupForm(
      form({ email: "a@b.c", [FORM_TOKEN_FIELD]: before })
    );
    expect(result.ok).toBe(false);
  });

  it("fails open when no secret is configured", () => {
    delete process.env.FORM_TOKEN_SECRET;
    delete process.env.AUTH_SECRET;
    expect(formToken()).toBe("");
    const result = verifySignupForm(form({ email: "a@b.c" }));
    expect(result.ok).toBe(true);
  });
});
