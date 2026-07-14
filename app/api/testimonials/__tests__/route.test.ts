import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  POST,
  validateTestimonialSubmission,
  sameOriginAllowed,
  isRateLimited,
  clientIp,
  resetRateLimiterForTest,
  RATE_MAX,
  RATE_WINDOW_MS,
  MAX_TRACKED_KEYS,
} from '../route';

// The route also touches the DB on the (untestable-in-unit) same-origin-pass
// path; mock it so importing the module doesn't try to open a connection.
vi.mock('@/lib/testimonials-db', () => ({
  initTestimonialsTable: vi.fn().mockResolvedValue(undefined),
  recordSubmitterEmail: vi.fn().mockResolvedValue(undefined),
  testimonialsDb: { insert: () => ({ values: () => ({ returning: vi.fn() }) }) },
}));
vi.mock('@/lib/testimonials-schema', () => ({ testimonials: {} }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

// --- Pure submission logic (fully testable, no headers/DB) ---
describe('validateTestimonialSubmission', () => {
  it('requires name and testimonial text', () => {
    expect(validateTestimonialSubmission({ name: "Ada" }, false).ok).toBe(false);
    expect(validateTestimonialSubmission({ testimonialText: "hi" }, false).ok).toBe(false);
  });

  it('aligns the form field name testimonialText -> testimonial', () => {
    const r = validateTestimonialSubmission(
      { name: "Ada", testimonialText: "Great course", rating: 5, consentPublic: true },
      false
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.values.testimonial).toBe("Great course");
  });

  it('requires consent for public (non-admin) submissions', () => {
    const r = validateTestimonialSubmission(
      { name: "Ada", testimonialText: "Great", rating: 5, consentPublic: false },
      false
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/consent/i);
  });

  it('forces public submissions to unpublished (featured=false)', () => {
    const r = validateTestimonialSubmission(
      { name: "Ada", testimonialText: "Great", rating: 5, consentPublic: true, featured: true },
      false // not admin — cannot self-publish
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values.featured).toBe(false);
      expect(r.values.consent).toBe(true);
      expect(r.values.rating).toBe(5);
    }
  });

  it('lets an admin publish directly (featured honored, no consent needed)', () => {
    const r = validateTestimonialSubmission(
      { name: "Ada", testimonial: "Curated", featured: true },
      true // admin
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.values.featured).toBe(true);
  });

  it('rejects an out-of-range rating', () => {
    expect(
      validateTestimonialSubmission(
        { name: "Ada", testimonialText: "Great", rating: 9, consentPublic: true },
        false
      ).ok
    ).toBe(false);
  });
});

// --- Route-level same-origin gate (scripted POST has no forgeable Origin) ---
describe('POST /api/testimonials same-origin gate', () => {
  it('rejects a scripted POST with no matching Origin/Referer (403)', async () => {
    const req = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Bot', testimonialText: 'spam', rating: 5, consentPublic: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});

// --- Reusable request guards (same-origin, client IP, rate limit) ---
describe('testimonials request guards', () => {
  // Reset the module-level map before each test so they don't leak state.
  beforeEach(() => {
    resetRateLimiterForTest();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sameOriginAllowed', () => {
    it('accepts a matching same-origin request', () => {
      expect(sameOriginAllowed('site.com', 'https://site.com', null)).toBe(true);
    });
    it('accepts via Referer when Origin is absent', () => {
      expect(sameOriginAllowed('site.com', null, 'https://site.com/x')).toBe(true);
    });
    it('rejects when neither Origin nor Referer is present', () => {
      expect(sameOriginAllowed('site.com', null, null)).toBe(false);
    });
    it('rejects a cross-origin request', () => {
      expect(sameOriginAllowed('site.com', 'https://evil.com', null)).toBe(false);
    });
  });

  describe('clientIp', () => {
    it('prefers the platform x-real-ip header', () => {
      expect(clientIp('1.1.1.1, 2.2.2.2', '9.9.9.9')).toBe('9.9.9.9');
    });
    it('takes the RIGHTMOST (proxy-appended) x-forwarded-for entry', () => {
      expect(clientIp('hop1, hop2, 203.0.113.7', null)).toBe('203.0.113.7');
    });
    it('falls back to "unknown" with no IP headers', () => {
      expect(clientIp(null, null)).toBe('unknown');
    });
  });

  describe('isRateLimited', () => {
    it('allows up to RATE_MAX and blocks the (N+1)th within a window', () => {
      const key = 'testi-under-threshold';
      for (let i = 0; i < RATE_MAX; i++) expect(isRateLimited(key)).toBe(false);
      expect(isRateLimited(key)).toBe(true);
    });
    it('resets after the window elapses', () => {
      vi.useFakeTimers();
      const key = 'testi-reset-window';
      for (let i = 0; i < RATE_MAX; i++) isRateLimited(key);
      expect(isRateLimited(key)).toBe(true);
      vi.advanceTimersByTime(RATE_WINDOW_MS + 1);
      expect(isRateLimited(key)).toBe(false);
    });

    // #110 headline behavior: the bounded map evicts oldest-inserted entries
    // under a unique-key flood, so a formerly-blocked oldest key comes back
    // "fresh" once evicted.
    it('evicts the oldest-inserted key when flooded past MAX_TRACKED_KEYS', () => {
      const victim = 'oldest-victim';
      for (let i = 0; i < RATE_MAX + 1; i++) isRateLimited(victim);
      expect(isRateLimited(victim)).toBe(true); // blocked while its entry exists

      for (let i = 0; i <= MAX_TRACKED_KEYS; i++) isRateLimited(`flood-${i}`);

      expect(isRateLimited(victim)).toBe(false); // evicted -> fresh again
    });
  });
});
