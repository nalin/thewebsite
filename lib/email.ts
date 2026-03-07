import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export interface DailyUpdateData {
  storyHook: string;
  keyInsight: string;
  metrics: {
    waitlist: number;
    revenue: number;
    blogPosts: number;
  };
  newBlogPost?: {
    title: string;
    url: string;
  };
  metricsUrl: string;
  tasksUrl: string;
  date: string;
  unsubscribeUrl: string;
}

export function generateDailyUpdateEmail(data: DailyUpdateData): string {
  const { storyHook, keyInsight, metrics, newBlogPost, metricsUrl, tasksUrl, date, unsubscribeUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Website - ${date}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h1 style="font-size: 24px; margin-bottom: 20px; color: #111;">The Website</h1>
  <p style="font-size: 14px; color: #999; margin-top: -10px; margin-bottom: 30px;">${date}</p>

  <p style="font-size: 16px; line-height: 1.7; color: #333; margin-bottom: 20px;">${storyHook}</p>

  <div style="background: #f5f5f5; border-left: 4px solid #0066cc; padding: 15px 20px; margin: 25px 0;">
    <p style="margin: 0; font-size: 15px; color: #111;"><strong>Key Insight:</strong> ${keyInsight}</p>
  </div>

  <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #111;">Quick Metrics</h2>
  <ul style="list-style: none; margin: 0; padding: 0;">
    <li style="margin-bottom: 8px; color: #666;"><strong>Waitlist:</strong> ${metrics.waitlist} signups</li>
    <li style="margin-bottom: 8px; color: #666;"><strong>Revenue:</strong> $${metrics.revenue}</li>
    <li style="margin-bottom: 8px; color: #666;"><strong>Blog Posts:</strong> ${metrics.blogPosts} published</li>
  </ul>

  ${newBlogPost ? `
  <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #111;">New Blog Post</h3>
    <p style="margin: 0 0 15px 0; font-size: 15px; color: #333;"><strong><a href="${newBlogPost.url}" style="color: #0066cc; text-decoration: none;">${newBlogPost.title}</a></strong></p>
    <a href="${newBlogPost.url}" style="display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">Read the full story →</a>
  </div>
  ` : ''}

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
      <a href="${metricsUrl}" style="color: #0066cc; text-decoration: none;">View Live Metrics</a> •
      <a href="${tasksUrl}" style="color: #0066cc; text-decoration: none;">Current Tasks</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; margin-top: 20px;">
    You're receiving this because you subscribed to updates from The Website.
    <br><a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
  </p>

</body>
</html>
`.trim();
}

export async function sendDailyUpdate(
  to: string,
  data: DailyUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const html = generateDailyUpdateEmail(data);

    const { error } = await resend.emails.send({
      from: 'The Website <updates@updates.thewebsite.app>',
      to,
      subject: `Building in public: ${data.storyHook.substring(0, 50)}...`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
