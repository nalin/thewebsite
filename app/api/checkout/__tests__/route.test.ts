import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('Checkout API (disabled)', () => {
  it('returns 503 with a disabled message and never creates a session', async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('checkout disabled pending relaunch');
    expect(data.url).toBeUndefined();
  });
});
