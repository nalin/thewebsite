import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    run: vi.fn(),
    all: vi.fn(),
  },
}));

describe('Waitlist API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/waitlist', () => {
    it('should successfully add valid email to waitlist', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('should reject invalid email format', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=invalid_email');
    });

    it('should reject empty email', async () => {
      const formData = new FormData();
      formData.append('email', '');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=invalid_email');
    });

    it('should reject email without @ symbol', async () => {
      const formData = new FormData();
      formData.append('email', 'testemail.com');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=invalid_email');
    });

    it('should handle duplicate email gracefully', async () => {
      const { db } = await import('@/lib/db');

      // Mock database to throw duplicate error
      (db.run as any).mockRejectedValueOnce(new Error('UNIQUE constraint failed'));

      const formData = new FormData();
      formData.append('email', 'existing@example.com');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      // Should still redirect to success (user is already subscribed)
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('should normalize email case', async () => {
      const formData = new FormData();
      formData.append('email', 'Test@Example.COM');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('should handle database connection errors', async () => {
      const { db } = await import('@/lib/db');

      // Mock database to throw connection error
      (db.run as any).mockRejectedValueOnce(new Error('Database connection failed'));

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('error=server_error');
    });

    it('should trim whitespace from email', async () => {
      const formData = new FormData();
      formData.append('email', '  test@example.com  ');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('redirects to a same-origin `next` path so the page shows its own success state', async () => {
      const formData = new FormData();
      formData.append('email', 'lead@example.com');
      formData.append('next', '/free-guide');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const location = response.headers.get('location') ?? '';

      expect(response.status).toBe(307);
      expect(location).toContain('/free-guide?success=joined');
    });

    it('blocks open-redirect: a protocol-relative `next` falls back to the homepage', async () => {
      const formData = new FormData();
      formData.append('email', 'lead@example.com');
      formData.append('next', '//evil.com');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const location = response.headers.get('location') ?? '';

      expect(response.status).toBe(307);
      expect(location).not.toContain('evil.com');
      expect(location).toBe('http://localhost:3000/?success=joined');
    });

    it('blocks a dot-less protocol-relative `next` (//evil resolves off-origin)', async () => {
      // Regression for the PR #109 review: "//evil" contains no dot, so it slips
      // past a char-class regex but new URL("//evil", origin) -> http://evil/.
      for (const evil of ['//evil', '///evil', '//evil/path']) {
        const formData = new FormData();
        formData.append('email', 'lead@example.com');
        formData.append('next', evil);

        const request = new NextRequest('http://localhost:3000/api/waitlist', {
          method: 'POST',
          body: formData,
        });

        const response = await POST(request);
        const location = response.headers.get('location') ?? '';

        expect(response.status).toBe(307);
        // Must stay on our origin, never resolve to http://evil/...
        expect(new URL(location).host).toBe('localhost:3000');
        expect(location).toBe('http://localhost:3000/?success=joined');
      }
    });

    it('carries a same-origin `next` through to the error redirect too', async () => {
      const formData = new FormData();
      formData.append('email', 'not-an-email');
      formData.append('next', '/starter-kit');

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const location = response.headers.get('location') ?? '';

      expect(response.status).toBe(307);
      expect(location).toContain('/starter-kit?error=invalid_email');
    });
  });
});
