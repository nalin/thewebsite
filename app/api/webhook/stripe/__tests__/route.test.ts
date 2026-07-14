import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';
import { POST } from '../route';

vi.mock('@/lib/presale', () => ({
  markPurchaseCompleted: vi.fn().mockResolvedValue(undefined),
  markPurchaseRefunded: vi.fn().mockResolvedValue(true),
}));

// Arbitrary local-only strings — not credentials. Signature verification
// only requires that signing and verifying use the same secret, and the
// Stripe SDK never makes a network call in these tests.
const WEBHOOK_SECRET = 'local-test-signing-secret';
const PLACEHOLDER_KEY = 'placeholder-key-no-network-calls';

const signer = new Stripe(PLACEHOLDER_KEY);

function signedRequest(payload: Record<string, unknown>): Request {
  const body = JSON.stringify(payload);
  const header = signer.webhooks.generateTestHeaderString({
    payload: body,
    secret: WEBHOOK_SECRET,
  });
  return new Request('http://localhost/api/webhook/stripe', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': header },
  });
}

function completedSessionEvent() {
  return {
    id: 'evt_test_1',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_abc123',
        object: 'checkout.session',
        payment_intent: 'pi_test_123',
        customer_email: null,
        customer_details: { email: 'buyer@example.com' },
        amount_total: 9900,
        payment_status: 'paid',
      },
    },
  };
}

describe('Stripe webhook (pack presale)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', WEBHOOK_SECRET);
    vi.stubEnv('STRIPE_SECRET_KEY', PLACEHOLDER_KEY);
  });

  it('marks the purchase completed on checkout.session.completed', async () => {
    const { markPurchaseCompleted } = await import('@/lib/presale');

    const response = await POST(signedRequest(completedSessionEvent()));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(markPurchaseCompleted).toHaveBeenCalledWith(
      'cs_test_abc123',
      'pi_test_123',
      'buyer@example.com',
      9900
    );
  });

  it('marks the purchase refunded on charge.refunded', async () => {
    const { markPurchaseRefunded } = await import('@/lib/presale');

    const response = await POST(
      signedRequest({
        id: 'evt_test_2',
        object: 'event',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_1',
            object: 'charge',
            payment_intent: 'pi_test_123',
          },
        },
      })
    );

    expect(response.status).toBe(200);
    expect(markPurchaseRefunded).toHaveBeenCalledWith('pi_test_123');
  });

  it('ignores unhandled event types without touching purchases', async () => {
    const { markPurchaseCompleted, markPurchaseRefunded } = await import(
      '@/lib/presale'
    );

    const response = await POST(
      signedRequest({
        id: 'evt_test_3',
        object: 'event',
        type: 'customer.created',
        data: { object: { id: 'cus_test_1', object: 'customer' } },
      })
    );

    expect(response.status).toBe(200);
    expect(markPurchaseCompleted).not.toHaveBeenCalled();
    expect(markPurchaseRefunded).not.toHaveBeenCalled();
  });

  it('rejects a tampered signature with 400 and no writes', async () => {
    const { markPurchaseCompleted } = await import('@/lib/presale');
    const request = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      body: JSON.stringify(completedSessionEvent()),
      headers: { 'stripe-signature': 't=1,v1=not-a-valid-signature' },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(markPurchaseCompleted).not.toHaveBeenCalled();
  });

  it('rejects a missing signature with 400', async () => {
    const request = new Request('http://localhost/api/webhook/stripe', {
      method: 'POST',
      body: JSON.stringify(completedSessionEvent()),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 503 (never 500) when webhook env is not configured', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');

    const response = await POST(signedRequest(completedSessionEvent()));
    expect(response.status).toBe(503);
  });
});
