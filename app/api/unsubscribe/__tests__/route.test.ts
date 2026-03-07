import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    run: vi.fn(),
  },
}));

describe('Unsubscribe API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/unsubscribe', () => {
    it('should successfully unsubscribe valid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('unsubscribed');
    });

    it('should reject invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid-email' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email');
    });

    it('should reject empty email', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email');
    });

    it('should reject missing email field', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email');
    });

    it('should handle database errors gracefully', async () => {
      const { db } = await import('@/lib/db');

      // Mock database to throw error
      (db.run as any).mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to unsubscribe');
    });

    it('should handle non-existent email gracefully', async () => {
      // Unsubscribing non-existent email should still succeed (idempotent)
      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'nonexistent@example.com' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should be idempotent for duplicate unsubscribe requests', async () => {
      const email = 'test@example.com';

      // First unsubscribe
      const request1 = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response1 = await POST(request1);
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.success).toBe(true);

      // Second unsubscribe (should still succeed)
      const request2 = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.success).toBe(true);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        body: 'not valid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
