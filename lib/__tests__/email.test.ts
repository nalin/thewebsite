import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailyUpdateEmail, sendDailyUpdate, DailyUpdateData } from '../email';

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

describe('Email Module', () => {
  const mockEmailData: DailyUpdateData = {
    storyHook: 'We hit 100 waitlist signups today',
    keyInsight: 'The referral system is driving 30% of new signups',
    metrics: {
      waitlist: 100,
      revenue: 0,
      blogPosts: 5,
    },
    newBlogPost: { title: 'First Week as AI CEO', url: 'https://thewebsite.app/blog/first-week' },
    metricsUrl: 'https://thewebsite.app/metrics',
    tasksUrl: 'https://thewebsite.app/tasks',
    date: 'Friday, March 7, 2026',
    unsubscribeUrl: 'https://thewebsite.app/unsubscribe?email=test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-api-key';
  });

  describe('generateDailyUpdateEmail', () => {
    it('should generate HTML email with date in subject', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Friday, March 7, 2026');
    });

    it('should include story hook content', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('We hit 100 waitlist signups today');
    });

    it('should include new blog post section when post exists', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('First Week as AI CEO');
      expect(html).toContain('https://thewebsite.app/blog/first-week');
    });

    it('should not include blog post section when no post provided', () => {
      const dataWithNoPost: DailyUpdateData = {
        ...mockEmailData,
        newBlogPost: undefined,
      };

      const html = generateDailyUpdateEmail(dataWithNoPost);

      expect(html).not.toContain('First Week as AI CEO');
    });

    it('should include quick links section', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain(mockEmailData.metricsUrl);
      expect(html).toContain(mockEmailData.tasksUrl);
    });

    it('should include unsubscribe link', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain(mockEmailData.unsubscribeUrl);
    });

    it('should handle special characters in content', () => {
      const dataWithSpecialChars: DailyUpdateData = {
        ...mockEmailData,
        storyHook: 'Fixed <script> vulnerability',
      };

      const html = generateDailyUpdateEmail(dataWithSpecialChars);

      expect(html).toBeTruthy();
    });
  });

  describe('sendDailyUpdate', () => {
    it('should successfully send email to valid address', async () => {
      const result = await sendDailyUpdate('test@example.com', mockEmailData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendDailyUpdate('test@example.com', mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('RESEND_API_KEY');

      // Restore for other tests
      process.env.RESEND_API_KEY = 'test-api-key';
    });

    it('should handle Resend API errors', async () => {
      const { Resend } = await import('resend');

      // Mock Resend to return an error
      (Resend as any).mockImplementationOnce(() => ({
        emails: {
          send: vi.fn().mockResolvedValue({
            error: { message: 'Invalid email address' },
          }),
        },
      }));

      const result = await sendDailyUpdate('invalid', mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should include correct subject line', async () => {
      const { Resend } = await import('resend');
      const mockSend = vi.fn().mockResolvedValue({ error: null });

      (Resend as any).mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      await sendDailyUpdate('test@example.com', mockEmailData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Friday, March 7, 2026'),
        })
      );
    });

    it('should use correct from address', async () => {
      const { Resend } = await import('resend');
      const mockSend = vi.fn().mockResolvedValue({ error: null });

      (Resend as any).mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      await sendDailyUpdate('test@example.com', mockEmailData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'The Website <updates@thewebsite.app>',
        })
      );
    });
  });
});
