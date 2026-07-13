import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnsubscribePage from '../page';

const mockSearchParams = { current: new URLSearchParams() };

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams.current,
}));

describe('Unsubscribe page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSearchParams.current = new URLSearchParams();
  });

  it('renders the confirmation UI for token links (nurture emails)', () => {
    mockSearchParams.current = new URLSearchParams('token=abc-123');

    render(<UnsubscribePage />);

    expect(screen.queryByText('Invalid Unsubscribe Link')).not.toBeInTheDocument();
    expect(screen.getByText('Unsubscribe from Emails')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, Unsubscribe Me' })).toBeInTheDocument();
  });

  it('POSTs the token to the API and shows success', async () => {
    mockSearchParams.current = new URLSearchParams('token=abc-123');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    render(<UnsubscribePage />);
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Unsubscribe Me' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'abc-123' }),
    });
    expect(await screen.findByText("You've Been Unsubscribed")).toBeInTheDocument();
  });

  it('still supports email links (daily digest)', async () => {
    mockSearchParams.current = new URLSearchParams('email=test%40example.com');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    render(<UnsubscribePage />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Unsubscribe Me' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    expect(await screen.findByText("You've Been Unsubscribed")).toBeInTheDocument();
  });

  it('shows the invalid-link screen only when neither token nor email is present', () => {
    render(<UnsubscribePage />);

    expect(screen.getByText('Invalid Unsubscribe Link')).toBeInTheDocument();
  });

  it('shows the API error message when unsubscribe fails', async () => {
    mockSearchParams.current = new URLSearchParams('token=abc-123');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Failed to unsubscribe. Please try again.' }), {
        status: 500,
      })
    );

    render(<UnsubscribePage />);
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Unsubscribe Me' }));

    expect(
      await screen.findByText('Failed to unsubscribe. Please try again.')
    ).toBeInTheDocument();
  });
});
