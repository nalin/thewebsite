import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailyUpdateEmail, sendDailyUpdate, DailyUpdateData } from '../email';

// Mock Resend.
//
// Two things this has to get right, both of which the previous version got
// wrong (issue #163):
//  1. `new Resend(...)` is a CONSTRUCTOR call. Vitest 4 will not construct a
//     mock whose implementation is an arrow function ("did not use 'function'
//     or 'class' in its implementation"), so every send threw
//     "... is not a constructor" and sendDailyUpdate reported failure.
//  2. lib/email.ts memoizes the client in a module-level `resendInstance`, so
//     only the FIRST construction in this file ever runs. Per-test
//     `mockImplementationOnce` therefore never took effect. One shared
//     `sendMock`, configured per test, sidesteps the memoization entirely.
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock('resend', () => ({
  Resend: vi.fn(function MockResend() {
    return { emails: { send: sendMock } };
  }),
}));

describe('Email Module', () => {
  const mockEmailData: DailyUpdateData = {
    storyHook: 'Day 3 of building The Website as an AI CEO. Something unexpected happened today.',
    keyInsight: 'CEO work and engineering work require completely different modes of thinking.',
    metrics: {
      waitlist: 42,
      revenue: 0,
      blogPosts: 1,
    },
    newBlogPost: {
      title: 'First Week as AI CEO',
      url: 'https://thewebsite.app/blog/first-week',
    },
    metricsUrl: 'https://thewebsite.app/metrics',
    tasksUrl: 'https://thewebsite.app/tasks',
    date: 'Friday, March 7, 2026',
    unsubscribeUrl: 'https://thewebsite.app/unsubscribe?email=test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockReset();
    sendMock.mockResolvedValue({ error: null });
    process.env.RESEND_API_KEY = 'test-api-key';
  });

  describe('generateDailyUpdateEmail', () => {
    it('should generate HTML email with story hook and key insight', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('The Website - Friday, March 7, 2026');
      expect(html).toContain('Day 3 of building The Website as an AI CEO');
      expect(html).toContain('Key Insight:');
      expect(html).toContain('CEO work and engineering work require completely different modes of thinking.');
    });

    it('should include metrics section', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Quick Metrics');
      expect(html).toContain('42 signups');
      expect(html).toContain('$0');
      expect(html).toContain('1 published');
    });

    it('should include new blog post section when post exists', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('New Blog Post');
      expect(html).toContain('First Week as AI CEO');
      expect(html).toContain('https://thewebsite.app/blog/first-week');
    });

    it('should not include blog post section when no post', () => {
      const dataWithNoPost: DailyUpdateData = {
        ...mockEmailData,
        newBlogPost: undefined,
      };

      const html = generateDailyUpdateEmail(dataWithNoPost);

      expect(html).not.toContain('New Blog Post');
    });

    it('should include metrics and tasks links', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain(mockEmailData.metricsUrl);
      expect(html).toContain(mockEmailData.tasksUrl);
    });

    // /metrics and /tasks are both permanent redirects to /activity now, so
    // the digest points both links there (issue #154 item 3) — and the
    // template collapses them instead of printing the same URL twice.
    it('prints one link when metrics and tasks point at the same page', () => {
      const sameTarget = 'https://thewebsite.app/activity';
      const html = generateDailyUpdateEmail({
        ...mockEmailData,
        metricsUrl: sameTarget,
        tasksUrl: sameTarget,
      });

      expect(html.split(sameTarget).length - 1).toBe(1);
      expect(html).not.toContain('Current Tasks');
      expect(html).toContain('View Live Metrics');
    });

    it('should include unsubscribe link', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Unsubscribe');
      expect(html).toContain(mockEmailData.unsubscribeUrl);
    });

    it('should include date in email', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Friday, March 7, 2026');
    });
  });

  describe('sendDailyUpdate', () => {
    it('should successfully send email to valid address', async () => {
      const result = await sendDailyUpdate('test@example.com', mockEmailData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle Resend API errors', async () => {
      sendMock.mockResolvedValueOnce({
        error: { message: 'Invalid email address' },
      });

      const result = await sendDailyUpdate('invalid', mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should include story hook in subject line', async () => {
      await sendDailyUpdate('test@example.com', mockEmailData);

      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Building in public:'),
        })
      );
    });

    // The one sender identity for the whole site (lib/email-sender.ts) —
    // issue #154 item 5 unified the digest and the nurture sequence on it.
    it('should use correct from address', async () => {
      await sendDailyUpdate('test@example.com', mockEmailData);

      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'The Website <updates@updates.thewebsite.app>',
        })
      );
    });
  });
});
