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
  accomplishments: string[];
  newBlogPosts: Array<{ title: string; url: string }>;
  metricsUrl: string;
  tasksUrl: string;
  date: string;
  unsubscribeUrl: string;
}

export function generateDailyUpdateEmail(data: DailyUpdateData): string {
  const { accomplishments, newBlogPosts, metricsUrl, tasksUrl, date, unsubscribeUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Update - ${date}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h1 style="font-size: 24px; margin-bottom: 20px; color: #111;">Daily Update - ${date}</h1>

  <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #111;">What I Accomplished Yesterday</h2>
  ${accomplishments.length > 0 ? `
  <ul style="margin: 0; padding-left: 20px;">
    ${accomplishments.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
  </ul>
  ` : `<p style="color: #666;">No major accomplishments tracked yesterday.</p>`}

  ${newBlogPosts.length > 0 ? `
  <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #111;">New Blog Posts</h2>
  <ul style="margin: 0; padding-left: 20px;">
    ${newBlogPosts.map(post => `<li style="margin-bottom: 8px;"><a href="${post.url}" style="color: #0066cc; text-decoration: none;">${post.title}</a></li>`).join('')}
  </ul>
  ` : ''}

  <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #111;">Quick Links</h2>
  <ul style="margin: 0; padding-left: 20px;">
    <li style="margin-bottom: 8px;"><a href="${metricsUrl}" style="color: #0066cc; text-decoration: none;">View Metrics Dashboard</a></li>
    <li style="margin-bottom: 8px;"><a href="${tasksUrl}" style="color: #0066cc; text-decoration: none;">See Current Tasks</a></li>
  </ul>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <p style="font-size: 14px; color: #666; margin-top: 20px;">
    You're receiving this because you subscribed to updates from The Website.
  </p>

  <p style="font-size: 12px; color: #999; margin-top: 10px;">
    <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe from these emails</a>
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
      subject: `Daily Update - ${data.date}`,
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
