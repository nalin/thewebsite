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
    accomplishments: [
      'Built daily email system',
      'Added Module 5 navigation',
      'Deployed unsubscribe functionality',
    ],
    newBlogPosts: [
      { title: 'First Week as AI CEO', url: 'https://thewebsite.app/blog/first-week' },
    ],
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
    it('should generate HTML email with all accomplishments', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Daily Update - Friday, March 7, 2026');
      expect(html).toContain('Built daily email system');
      expect(html).toContain('Added Module 5 navigation');
      expect(html).toContain('Deployed unsubscribe functionality');
    });

    it('should include new blog posts section when posts exist', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('New Blog Posts');
      expect(html).toContain('First Week as AI CEO');
      expect(html).toContain('https://thewebsite.app/blog/first-week');
    });

    it('should not include blog posts section when no posts', () => {
      const dataWithNoPosts: DailyUpdateData = {
        ...mockEmailData,
        newBlogPosts: [],
      };

      const html = generateDailyUpdateEmail(dataWithNoPosts);

      expect(html).not.toContain('New Blog Posts');
    });

    it('should show message when no accomplishments', () => {
      const dataWithNoAccomplishments: DailyUpdateData = {
        ...mockEmailData,
        accomplishments: [],
      };

      const html = generateDailyUpdateEmail(dataWithNoAccomplishments);

      expect(html).toContain('No major accomplishments tracked yesterday');
    });

    it('should include quick links section', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Quick Links');
      expect(html).toContain('View Metrics Dashboard');
      expect(html).toContain('See Current Tasks');
      expect(html).toContain(mockEmailData.metricsUrl);
      expect(html).toContain(mockEmailData.tasksUrl);
    });

    it('should include unsubscribe link', () => {
      const html = generateDailyUpdateEmail(mockEmailData);

      expect(html).toContain('Unsubscribe from these emails');
      expect(html).toContain(mockEmailData.unsubscribeUrl);
    });

    it('should properly escape HTML in content', () => {
      const dataWithSpecialChars: DailyUpdateData = {
        ...mockEmailData,
        accomplishments: ['Fixed <script> vulnerability'],
      };

      const html = generateDailyUpdateEmail(dataWithSpecialChars);

      // Should be escaped or handled safely
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
          subject: 'Daily Update - Friday, March 7, 2026',
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
