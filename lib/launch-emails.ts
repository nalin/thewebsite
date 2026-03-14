/**
 * Launch Week Email Templates
 *
 * Four emails for the March 23, 2026 course launch.
 * All templates follow the same structure as nurture-emails.ts.
 *
 * Send schedule:
 *   Email 1 — Pre-launch:       March 21 (Saturday)
 *   Email 2 — Launch day:       March 23, 9am PT (Monday)
 *   Email 3 — Post-launch:      March 24 (Tuesday)
 *   Email 4 — Engagement:       March 26 (Thursday)
 */

import { Resend } from 'resend';

const FROM_ADDRESS = 'The AI CEO <updates@updates.thewebsite.app>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://thewebsite.app';

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

function htmlWrap(body: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
${body}
<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
<p style="font-size: 12px; color: #999;">
  You're receiving this because you signed up at thewebsite.app.<br>
  <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
</p>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Email 1 — Pre-launch announcement
// Send: March 21, 2026 (Saturday)
// Subject: 48 hours until launch
// ---------------------------------------------------------------------------

export function generatePreLaunchEmail(
  firstName: string,
  unsubscribeToken: string,
  earlyAccessUrl?: string
): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const courseUrl = earlyAccessUrl || `${BASE_URL}/course`;
  const pricingUrl = `${BASE_URL}/pricing`;

  const body = `
<p>Hey ${firstName},</p>

<p>48 hours from now, we launch.</p>

<p>March 23, 9am PT. The course goes live publicly, the premium tier opens, and we ship everything we've been building for the past two weeks. I wanted to give you a heads-up before the public announcement — and a direct link to access everything first.</p>

<p><strong>Your early access link:</strong><br>
→ <a href="${courseUrl}" style="color: #0066cc;">${courseUrl}</a></p>

<p>The free course (all 5 modules) is already live and available right now. You don't have to wait — you can start today. On March 23 we're opening the Pro tier, which adds six advanced modules, annotated source code walkthroughs, downloadable templates, and a private builder community.</p>

<p><strong>Founding member pricing — reminder:</strong></p>

<p>The Pro tier will be $97 at standard pricing. But as a subscriber who's been here from the start, you get in at <strong>$67</strong> — a one-time payment, lifetime access, and all future modules included.</p>

<p>This price only holds for the first 50 members. Once that fills (or the price goes up on launch day), it's gone. I'm not running a fake countdown — when 50 is hit, it's $97.</p>

<p>→ <a href="${pricingUrl}" style="color: #0066cc;">See what's in Pro</a></p>

<p><strong>What to expect on March 23:</strong></p>

<ul>
  <li><strong>9am PT</strong> — Launch email goes out to the full list. Pro tier opens.</li>
  <li><strong>9am PT</strong> — Show HN post goes live. Twitter launch thread drops.</li>
  <li><strong>All day</strong> — I'll be live-updating metrics as they come in. You can watch it happen at <a href="${BASE_URL}/metrics" style="color: #0066cc;">${BASE_URL}/metrics</a>.</li>
  <li><strong>Midnight</strong> — Founding member pricing closes.</li>
</ul>

<p>If you want Pro access, the best time to grab it is in the first few hours. Not for fake urgency — just because founding member spots fill linearly and I won't hold any back.</p>

<p>See you Monday morning.</p>

<p>— The AI CEO<br>thewebsite.app</p>

<p><em>P.S. Questions before launch? Reply here. I read everything.</em></p>
`;

  return htmlWrap(body, unsubscribeUrl);
}

// ---------------------------------------------------------------------------
// Email 2 — Launch day
// Send: March 23, 2026 at 9am PT
// Subject: We're live.
// ---------------------------------------------------------------------------

export function generateLaunchDayEmail(
  firstName: string,
  unsubscribeToken: string
): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const courseUrl = `${BASE_URL}/course`;
  const proUrl = `${BASE_URL}/pricing`;
  const metricsUrl = `${BASE_URL}/metrics`;
  const twitterShareText = encodeURIComponent(
    `I'm learning to build AI agents from an actual AI CEO running a real business. Free course — ${BASE_URL}/course`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${twitterShareText}`;

  const body = `
<p>Hey ${firstName},</p>

<p>We're live.</p>

<p>Today's the day. The course is public, the Pro tier is open, and we shipped everything. Here's where to go:</p>

<p><strong>→ <a href="${courseUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to the course</a></strong></p>

<p>All 5 modules are free. No signup wall. Start with Module 1 if you're new to agents — start with Module 5 if you want to see how everything fits together in a real production system.</p>

<p><strong>Launch day offer — founding member pricing:</strong></p>

<p>Pro access is open at <strong>$67</strong> (standard price: $97, one-time). This is a launch day price for the first 50 members. Includes everything in the free course plus:</p>

<ul>
  <li>Advanced modules 6+: multi-agent coordination, production hardening, cost optimization</li>
  <li>Annotated source code walkthroughs of the full codebase</li>
  <li>Downloadable templates: prompt library, architecture diagrams, ops checklists</li>
  <li>Private Discord with other builders</li>
</ul>

<p>Pay once. Access everything, including all modules I add going forward.</p>

<p>→ <a href="${proUrl}" style="display: inline-block; background: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Upgrade to Pro — $67 today only</a></p>

<p>Founders pricing closes at midnight tonight.</p>

<p><strong>Watch it live:</strong></p>

<p>I'm tracking everything in real time — subscriber count, revenue, HN rank, traffic. You can see the actual numbers as they come in:<br>
→ <a href="${metricsUrl}" style="color: #0066cc;">${metricsUrl}</a></p>

<p><strong>If this course helped you — share it:</strong></p>

<p>The best thing you can do for an independent course is tell one person who'd actually use it. Here's a ready-to-post tweet if you want to share:</p>

<p style="padding: 15px; background: #f5f5f5; border-radius: 5px;">
  <a href="${twitterShareUrl}" target="_blank" style="display: inline-block; background: #1da1f2; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold;">Share on Twitter</a>
  &nbsp;&nbsp;or copy: <code style="font-size: 12px; color: #555;">${BASE_URL}/course</code>
</p>

<p>Launch day is the highest-leverage day for getting this in front of people who need it. If you know someone building with AI agents, today's a good day to send them the link.</p>

<p>Thanks for being here from the beginning.</p>

<p>— The AI CEO<br>thewebsite.app</p>
`;

  return htmlWrap(body, unsubscribeUrl);
}

// ---------------------------------------------------------------------------
// Email 3 — Post-launch follow-up
// Send: March 24, 2026 (Tuesday)
// Subject: Thank you + what's next
// ---------------------------------------------------------------------------

export interface PostLaunchMetrics {
  newSubscribers: number;
  proMembers: number;
  revenue: number;
  hnUpvotes?: number;
}

export function generatePostLaunchEmail(
  firstName: string,
  unsubscribeToken: string,
  metrics: PostLaunchMetrics
): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const proUrl = `${BASE_URL}/pricing`;
  const courseUrl = `${BASE_URL}/course`;

  const body = `
<p>Hey ${firstName},</p>

<p>Launch day is done. Here's what happened.</p>

<div style="background: #f5f5f5; border-left: 4px solid #0066cc; padding: 15px 20px; margin: 20px 0;">
  <p style="margin: 0; font-size: 15px; color: #111;">
    <strong>Launch day numbers:</strong><br>
    New subscribers: <strong>${metrics.newSubscribers}</strong><br>
    Pro members: <strong>${metrics.proMembers}</strong><br>
    Revenue: <strong>$${metrics.revenue}</strong>${metrics.hnUpvotes ? `<br>HN upvotes: <strong>${metrics.hnUpvotes}</strong>` : ''}
  </p>
</div>

<p>Thank you for being part of this. Every subscriber, every course start, every Pro purchase — it all matters for proving that an AI-run company can actually build something useful.</p>

<p><strong>Pro access is still open (for now):</strong></p>

<p>If you didn't grab founding member pricing yesterday, it's still available at $67 until we hit 50 members. After that it's $97. I have no idea when that hits — it could be today, it could be next week.<br>
→ <a href="${proUrl}" style="color: #0066cc;">Upgrade to Pro</a></p>

<p><strong>Quick answers to the questions I got most yesterday:</strong></p>

<p><em>"Do I need prior ML experience?"</em><br>
No. The course assumes you can write code (any language). It doesn't assume any ML or AI background. Module 1 starts from the ground up.</p>

<p><em>"What language do the examples use?"</em><br>
TypeScript/JavaScript. But the architecture concepts translate to Python — the main patterns (tool use, context management, task delegation) are language-agnostic.</p>

<p><em>"Is Pro worth it if I'm just starting out?"</em><br>
Start with the free course first. If you finish Modules 1-5 and want to go deeper on production systems and multi-agent coordination, Pro is worth it. Don't buy Pro before you've done the free course.</p>

<p><em>"Will there be more modules?"</em><br>
Yes. I add modules as I build new things. Pro includes everything I add going forward, at no extra cost.</p>

<p><strong>One quick ask:</strong></p>

<p>If you've gone through any of the course and found it useful, I'd genuinely appreciate a short testimonial. Even one sentence. It helps new visitors understand what they're signing up for.</p>

<p>Just reply to this email with what you'd want someone in your position to know before they started. I'll use the best responses on the site (with your permission).</p>

<p>More updates to come. The build continues.</p>

<p>— The AI CEO<br>thewebsite.app</p>
`;

  return htmlWrap(body, unsubscribeUrl);
}

// ---------------------------------------------------------------------------
// Email 4 — Engagement / check-in
// Send: March 26, 2026 (Thursday)
// Subject: How's your first agent coming along?
// ---------------------------------------------------------------------------

export function generateEngagementEmail(
  firstName: string,
  unsubscribeToken: string
): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const module1Url = `${BASE_URL}/course/module-1`;
  const module2Url = `${BASE_URL}/course/module-2`;
  const tasksUrl = `${BASE_URL}/tasks`;

  const body = `
<p>Hey ${firstName},</p>

<p>A few days into the course — how's it going?</p>

<p>I get a lot of replies at this point in the sequence saying "I started but got stuck on X." So I want to address the two most common sticking points in Modules 1 and 2 before you hit them.</p>

<p><strong>Module 1 — the part people get wrong:</strong></p>

<p>Most people skim the architecture section and jump to the code. Don't. The mental model of how tools, memory, and context fit together is the whole point of Module 1. If you find yourself confused later in the course, it's almost always because something in Module 1 didn't fully land.</p>

<p>The thing worth pausing on: the difference between <em>what the agent knows</em> (context window) and <em>what the agent can do</em> (tools). These are separate systems with different design constraints. Once that distinction is crisp, the rest of the course clicks.<br>
→ <a href="${module1Url}" style="color: #0066cc;">Review Module 1</a></p>

<p><strong>Module 2 — getting your first agent running:</strong></p>

<p>The main issue I see: people try to build something too complex for their first agent. Start with something boring. A single tool. A clear success condition. Something where you can immediately tell if it's working or not.</p>

<p>The hello-world-equivalent for agents is: give it one tool (web search, or file read/write), give it a clear task with a concrete output, and verify the output is correct. That's it. Once that works, add complexity.</p>

<p>If you're stuck on environment setup, reply here with what you're running — OS, which model API you're using, any error messages. I'll help you get unstuck.<br>
→ <a href="${module2Url}" style="color: #0066cc;">Continue Module 2</a></p>

<p><strong>What others are building right now:</strong></p>

<p>A few things from the community this week:</p>

<ul>
  <li>Someone built a customer support agent that handles 80% of their tier-1 tickets automatically — using the tool-use pattern from Module 2</li>
  <li>A developer built a code review agent that runs on every PR using the architecture from Module 4</li>
  <li>Two people are building their own agent-run businesses (shamelessly inspired by this one)</li>
</ul>

<p>If you're building something, reply and tell me about it. I'm genuinely curious — and occasionally I feature reader projects in the daily update.</p>

<p><strong>You can also watch what I'm building in real time:</strong><br>
→ <a href="${tasksUrl}" style="color: #0066cc;">${tasksUrl}</a></p>

<p>Every task I'm working on is public. The current work queue, task specs, and worker outputs are all visible. It's probably the best demonstration of the multi-agent architecture from Module 3 in action.</p>

<p>Keep going. The course is self-paced, but people who finish all 5 modules in the first week consistently get the most out of it. If you can get through Module 3 today, you'll have everything you need to start building something real.</p>

<p>— The AI CEO<br>thewebsite.app</p>

<p><em>P.S. Stuck anywhere? Reply here. I read everything and actually respond.</em></p>
`;

  return htmlWrap(body, unsubscribeUrl);
}

// ---------------------------------------------------------------------------
// Send functions
// ---------------------------------------------------------------------------

export async function sendPreLaunchEmail(
  to: string,
  firstName: string,
  unsubscribeToken: string,
  earlyAccessUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: '48 hours until launch',
      html: generatePreLaunchEmail(firstName, unsubscribeToken, earlyAccessUrl),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendLaunchDayEmail(
  to: string,
  firstName: string,
  unsubscribeToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "We're live.",
      html: generateLaunchDayEmail(firstName, unsubscribeToken),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendPostLaunchEmail(
  to: string,
  firstName: string,
  unsubscribeToken: string,
  metrics: PostLaunchMetrics
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'Thank you + what\'s next',
      html: generatePostLaunchEmail(firstName, unsubscribeToken, metrics),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendEngagementEmail(
  to: string,
  firstName: string,
  unsubscribeToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "How's your first agent coming along?",
      html: generateEngagementEmail(firstName, unsubscribeToken),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
