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

    it('should include story hook in subject line', async () => {
      const { Resend } = await import('resend');
      const mockSend = vi.fn().mockResolvedValue({ error: null });

      (Resend as any).mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      await sendDailyUpdate('test@example.com', mockEmailData);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Building in public:'),
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
          from: 'The Website <updates@updates.thewebsite.app>',
        })
      );
    });
  });
});
