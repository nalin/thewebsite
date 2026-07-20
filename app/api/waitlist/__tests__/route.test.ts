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

// Keep the mailing-list side effects out of the unit tests — they hit the
// libsql client and Resend otherwise.
vi.mock('@/lib/nurture-emails', () => ({
  addEmailSubscriber: vi.fn(async () => ({ token: 'tok', alreadyExists: false })),
  sendWelcomeEmail: vi.fn(async () => undefined),
}));
vi.mock('@/lib/referrals', () => ({
  trackReferral: vi.fn(async () => undefined),
}));

// The interpolated values live in the drizzle `sql` template's queryChunks;
// stringifying is enough to assert what the route sent for a given statement.
async function statementFor(fragment: string): Promise<string> {
  const { db } = await import('@/lib/db');
  const call = (db.run as any).mock.calls.find((c: any[]) =>
    JSON.stringify(c[0]?.queryChunks ?? c[0]).includes(fragment)
  );
  return call ? JSON.stringify(call[0]?.queryChunks ?? call[0]) : '';
}

function signup(fields: Record<string, string>): NextRequest {
  const formData = new FormData();
  for (const [k, v] of Object.entries(fields)) formData.append(k, v);
  return new NextRequest('http://localhost:3000/api/waitlist', {
    method: 'POST',
    body: formData,
  });
}

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

  // Regression for issue #161: a returning visitor re-entering their email got
  // `error=server_error`, because a unique-constraint failure was only tolerated
  // at the one call site wrapped in a try/catch. Signing up twice is idempotent,
  // so a duplicate must land on the same success state as a first-time signup —
  // from ANY point in the signup path.
  describe('duplicate signup is graceful (issue #161)', () => {
    const dupe = () => new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: waitlist.email');

    it('succeeds when the duplicate surfaces from the waitlist INSERT itself', async () => {
      const { db } = await import('@/lib/db');
      // CREATE TABLE and ALTER succeed; the third statement is the INSERT.
      (db.run as any)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(dupe());

      const response = await POST(signup({ email: 'existing@example.com' }));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('succeeds when the duplicate surfaces from any earlier statement', async () => {
      const { db } = await import('@/lib/db');
      (db.run as any).mockRejectedValueOnce(dupe());

      const response = await POST(signup({ email: 'existing@example.com' }));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('recognises a libsql-style error object (code, no message match)', async () => {
      const { db } = await import('@/lib/db');
      const err: any = new Error('SQLite error');
      err.code = 'SQLITE_CONSTRAINT_UNIQUE';
      (db.run as any).mockRejectedValueOnce(err);

      const response = await POST(signup({ email: 'existing@example.com' }));

      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('recognises a duplicate wrapped in a driver error `cause`', async () => {
      const { db } = await import('@/lib/db');
      const err: any = new Error('query failed');
      err.cause = dupe();
      (db.run as any).mockRejectedValueOnce(err);

      const response = await POST(signup({ email: 'existing@example.com' }));

      expect(response.headers.get('location')).toContain('success=joined');
    });

    it('returns a duplicate to the lead-magnet page that sent it', async () => {
      const { db } = await import('@/lib/db');
      (db.run as any).mockRejectedValueOnce(dupe());

      const response = await POST(
        signup({ email: 'existing@example.com', next: '/starter-kit' })
      );

      expect(response.headers.get('location')).toContain('/starter-kit?success=joined');
    });

    it('clears the ref_code cookie on a duplicate, same as a first-time signup', async () => {
      const { db } = await import('@/lib/db');
      (db.run as any).mockRejectedValueOnce(dupe());

      const response = await POST(signup({ email: 'existing@example.com' }));

      expect(response.headers.get('set-cookie')).toContain('ref_code=');
      expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    });

    it('still reports a genuine write failure as server_error', async () => {
      const { db } = await import('@/lib/db');
      (db.run as any).mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await POST(signup({ email: 'test@example.com', next: '/starter-kit' }));

      expect(response.status).toBe(307);
      // ...and carries the caller's page through, like the other error states.
      expect(response.headers.get('location')).toContain('/starter-kit?error=server_error');
    });

    it('lets the database dedupe: INSERT is ON CONFLICT DO NOTHING', async () => {
      await POST(signup({ email: 'test@example.com' }));

      expect(await statementFor('INSERT INTO waitlist')).toContain(
        'ON CONFLICT(email) DO NOTHING'
      );
    });

    it('normalizes the email so case/whitespace variants are the same subscriber', async () => {
      const { addEmailSubscriber } = await import('@/lib/nurture-emails');

      await POST(signup({ email: '  Test@Example.COM  ' }));

      expect(await statementFor('INSERT INTO waitlist')).toContain('test@example.com');
      expect(addEmailSubscriber).toHaveBeenCalledWith('test@example.com');
    });
  });
});
