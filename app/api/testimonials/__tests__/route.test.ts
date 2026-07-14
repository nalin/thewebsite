import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, validateTestimonialSubmission } from '../route';

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
