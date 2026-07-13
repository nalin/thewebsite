import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';

const sessionsCreate = vi.fn();

vi.mock('@/lib/stripe', () => ({
  stripe: {
    get checkout() {
      return { sessions: { create: sessionsCreate } };
    },
  },
}));

vi.mock('@/lib/presale', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/presale')>();
  return {
    ...original,
    createPendingPurchase: vi.fn().mockResolvedValue(undefined),
  };
});

function checkoutRequest(body?: string, contentType?: string): Request {
  return new Request('http://localhost/api/presale/checkout', {
    method: 'POST',
    body,
    headers: contentType ? { 'content-type': contentType } : {},
  });
}

describe('Presale checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_SECRET_KEY', 'placeholder-key');
    vi.stubEnv('STRIPE_PRICE_ID', 'price_test_placeholder');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.test');
    sessionsCreate.mockResolvedValue({
      id: 'cs_test_new',
      url: 'https://checkout.stripe.com/test-session',
    });
  });

  it('returns 503 (never 500) when Stripe env is not configured', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    vi.stubEnv('STRIPE_PRICE_ID', '');

    const response = await POST(checkoutRequest());
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('not open yet');
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it('creates a session from STRIPE_PRICE_ID and redirects 303 to Stripe', async () => {
    const { createPendingPurchase } = await import('@/lib/presale');

    const response = await POST(checkoutRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'https://checkout.stripe.com/test-session'
    );
    expect(sessionsCreate).toHaveBeenCalledTimes(1);
    const args = sessionsCreate.mock.calls[0][0];
    expect(args.mode).toBe('payment');
    expect(args.line_items).toEqual([
      { price: 'price_test_placeholder', quantity: 1 },
    ]);
    expect(args.success_url).toBe(
      'https://example.test/pack/success?session_id={CHECKOUT_SESSION_ID}'
    );
    expect(args.cancel_url).toBe('https://example.test/pricing');
    // Stripe best practice: omit entirely so dynamic payment methods apply.
    expect(args).not.toHaveProperty('payment_method_types');
    expect(createPendingPurchase).toHaveBeenCalledWith('cs_test_new', null);
  });

  it('records the pending purchase with the prefill email from the form', async () => {
    const { createPendingPurchase } = await import('@/lib/presale');
    const form = new URLSearchParams({ email: 'buyer@example.com' });

    const response = await POST(
      checkoutRequest(form.toString(), 'application/x-www-form-urlencoded')
    );

    expect(response.status).toBe(303);
    expect(sessionsCreate.mock.calls[0][0].customer_email).toBe(
      'buyer@example.com'
    );
    expect(createPendingPurchase).toHaveBeenCalledWith(
      'cs_test_new',
      'buyer@example.com'
    );
  });

  it('returns 502 when Stripe errors (still never a 500)', async () => {
    sessionsCreate.mockRejectedValueOnce(new Error('stripe down'));

    const response = await POST(checkoutRequest());
    expect(response.status).toBe(502);
  });
});
