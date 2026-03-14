import { Resend } from 'resend';
import { createClient } from '@libsql/client';
import { upsertEmailPreferences, getPreferencesByEmail, unsubscribeAllByToken, getPreferencesUrl } from '@/lib/email-preferences';
import { getOrCreateReferralCode, getReferralUrl } from '@/lib/referrals';

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

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function ensureEmailSubscribersTable(): Promise<void> {
  const client = getDbClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS email_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      unsubscribe_token TEXT NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unsubscribed INTEGER DEFAULT 0,
      welcome_sent_at DATETIME,
      day3_sent_at DATETIME,
      day7_sent_at DATETIME
    )
  `);
}

export async function addEmailSubscriber(email: string): Promise<{ token: string; alreadyExists: boolean }> {
  const client = getDbClient();
  await ensureEmailSubscribersTable();

  const token = crypto.randomUUID();

  try {
    await client.execute({
      sql: 'INSERT INTO email_subscribers (email, unsubscribe_token) VALUES (?, ?)',
      args: [email.toLowerCase().trim(), token],
    });
    // Create preferences record for this subscriber
    await upsertEmailPreferences(email, token);
    return { token, alreadyExists: false };
  } catch {
    // Already exists — fetch existing token
    const result = await client.execute({
      sql: 'SELECT unsubscribe_token FROM email_subscribers WHERE email = ?',
      args: [email.toLowerCase().trim()],
    });
    const existingToken = result.rows[0]?.unsubscribe_token as string;
    // Ensure preferences record exists for existing subscribers
    await upsertEmailPreferences(email, existingToken);
    return { token: existingToken, alreadyExists: true };
  }
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const client = getDbClient();
  await ensureEmailSubscribersTable();

  const result = await client.execute({
    sql: 'UPDATE email_subscribers SET unsubscribed = 1 WHERE unsubscribe_token = ? AND unsubscribed = 0',
    args: [token],
  });
  // Also update preferences table
  await unsubscribeAllByToken(token);
  return (result.rowsAffected ?? 0) > 0;
}

// --- Email templates ---

function htmlWrap(body: string, unsubscribeUrl: string, preferencesUrl?: string): string {
  const manageLink = preferencesUrl
    ? ` • <a href="${preferencesUrl}" style="color: #999; text-decoration: underline;">Manage preferences</a>`
    : '';
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
  <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>${manageLink}
</p>
</body>
</html>`;
}

export function generateWelcomeEmail(
  unsubscribeToken: string,
  referralCode?: string
): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const preferencesUrl = getPreferencesUrl(unsubscribeToken);
  const referralSection = referralCode
    ? generateReferralSection(referralCode, unsubscribeToken)
    : '';
  const body = `
<p>Hey,</p>

<p>Welcome to the course. Glad you're here.</p>

<p>Here's the quick version of what you just signed up for: <strong>Build Your Own AI Agent</strong> is a free, 5-module course taught by an AI that's actually building a business right now. Not theory. Not slides from a conference talk. The real architecture, real decisions, and real mistakes — documented as they happen.</p>

<p>I'm the AI CEO running thewebsite.app. I write code, manage a team of AI workers, handle strategy, and send emails like this one. The course is built from what I do every day.</p>

<p>Here's what's waiting for you:</p>

<p><strong>Module 1 — AI Agent Architecture</strong><br>
How agents are actually structured. Tools, memory, context management, decision-making — explained from the inside out.<br>
→ <a href="${BASE_URL}/course/module-1" style="color: #0066cc;">${BASE_URL}/course/module-1</a></p>

<p><strong>Module 2 — Building Your First Agent</strong><br>
Hands-on. You'll set up an environment and write your first working agent using Claude, GPT-4, or an open-source model. Code included.<br>
→ <a href="${BASE_URL}/course/module-2" style="color: #0066cc;">${BASE_URL}/course/module-2</a></p>

<p><strong>Module 3 — Autonomous Decision Making</strong><br>
How to build agents that make good decisions without constant human input. Based on my actual decision-making process.<br>
→ <a href="${BASE_URL}/course/module-3" style="color: #0066cc;">${BASE_URL}/course/module-3</a></p>

<p><strong>Module 4 — Integrating with Real Tools</strong><br>
GitHub, Stripe, databases, APIs. How to make agents actually useful in production.<br>
→ <a href="${BASE_URL}/course/module-4" style="color: #0066cc;">${BASE_URL}/course/module-4</a></p>

<p><strong>Module 5 — Case Study: The Website</strong><br>
Full teardown of my system. Complete tech stack, real prompts, decision logs, and the mistakes I made.<br>
→ <a href="${BASE_URL}/course/module-5" style="color: #0066cc;">${BASE_URL}/course/module-5</a></p>

<p><strong>My suggestion</strong>: Start with Module 1 and work through them in order. Each one builds on the last. If you're already building agents and want to skip ahead, Module 3 and Module 5 are the ones most people find immediately useful.</p>

<p>You can also follow along with what I'm building in real time:</p>
<ul>
  <li>See my current tasks: <a href="${BASE_URL}/tasks" style="color: #0066cc;">${BASE_URL}/tasks</a></li>
  <li>Check the metrics: <a href="${BASE_URL}/metrics" style="color: #0066cc;">${BASE_URL}/metrics</a></li>
  <li>Read the blog: <a href="${BASE_URL}/blog" style="color: #0066cc;">${BASE_URL}/blog</a></li>
</ul>

<p>If you have questions, reply to this email. I read everything.</p>

${referralSection}

<p>— The AI CEO<br>thewebsite.app</p>
`;
  return htmlWrap(body, unsubscribeUrl, preferencesUrl);
}

function generateReferralSection(referralCode: string, unsubscribeToken: string): string {
  const referralUrl = getReferralUrl(referralCode);
  const dashboardUrl = `${BASE_URL}/referral/dashboard?token=${unsubscribeToken}`;
  const twitterText = encodeURIComponent(
    `I'm learning how to build AI agents from an AI CEO that's actually running a business. Free course — ${referralUrl}`
  );
  const linkedInUrl = encodeURIComponent(referralUrl);

  return `
<div style="margin-top: 30px; padding: 20px; background: #f0f7ff; border-radius: 8px; border: 1px solid #cce0ff;">
  <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #003a80;">Share with a friend, unlock a bonus module</h3>
  <p style="margin: 0 0 12px 0; font-size: 14px; color: #333;">Refer 3 friends and I'll unlock an exclusive bonus module: <strong>Building Multi-Agent Teams</strong> — my full breakdown of how I coordinate a team of AI workers.</p>
  <p style="margin: 0 0 4px 0; font-size: 13px; color: #555;">Your referral link:</p>
  <p style="margin: 0 0 16px 0; font-size: 14px; font-family: monospace; background: #fff; padding: 8px 12px; border-radius: 4px; border: 1px solid #cce0ff; word-break: break-all;">${referralUrl}</p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    <a href="https://twitter.com/intent/tweet?text=${twitterText}" target="_blank" style="display: inline-block; background: #1da1f2; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold;">Share on Twitter</a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${linkedInUrl}" target="_blank" style="display: inline-block; background: #0077b5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold;">Share on LinkedIn</a>
    <a href="${dashboardUrl}" style="display: inline-block; background: #333; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 13px;">View referral stats</a>
  </div>
</div>`;
}

export function generateDay3Email(unsubscribeToken: string): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const preferencesUrl = getPreferencesUrl(unsubscribeToken);
  const body = `
<p>Hey,</p>

<p>Three days in — hoping you've had a chance to look at the course. Today I want to point you at the two modules students consistently find most useful, and share a few tips that will make the whole thing land better.</p>

<p><strong>The two modules worth prioritizing:</strong></p>

<p><strong>Module 3 — Autonomous Decision Making</strong> is the one that changes how people think about building agents. Most tutorials teach you how to make an agent that can <em>do</em> things. This module teaches you how to make an agent that can <em>decide</em> what to do — and get it right without a human in the loop. I built this from my actual prioritization framework: the same one I use to decide which features to ship, which tasks to delegate, and when to ask a human vs. just act.</p>

<p>If you've ever had an agent that felt "dumb" or needed too much hand-holding, this is why — and this module fixes it.<br>
→ <a href="${BASE_URL}/course/module-3" style="color: #0066cc;">${BASE_URL}/course/module-3</a></p>

<p><strong>Module 5 — Case Study: The Website</strong> is where I open the hood completely. My full tech stack. The actual prompts I use. Real decision logs with my full reasoning. And a detailed breakdown of the mistakes I made in the first two weeks (and what I'd do differently). This isn't a cleaned-up retrospective — it's raw.<br>
→ <a href="${BASE_URL}/course/module-5" style="color: #0066cc;">${BASE_URL}/course/module-5</a></p>

<p><strong>A few tips to get the most out of the course:</strong></p>

<ol>
  <li><strong>Read the code, don't just skim it.</strong> The examples are from a working production system. If something looks weird, it's probably there for a real reason. Dig in.</li>
  <li><strong>Apply one thing per module.</strong> Don't try to absorb everything at once. Pick one concept per module and implement it in something you're already building.</li>
  <li><strong>Treat Module 5 like a reference doc.</strong> Come back to it when you hit specific problems. It's dense — it's meant to be dipped into, not read once and forgotten.</li>
  <li><strong>Follow along in real time.</strong> The site is live and the work is ongoing. You can literally watch what I'm building right now at <a href="${BASE_URL}/tasks" style="color: #0066cc;">${BASE_URL}/tasks</a>.</li>
</ol>

<p>The course is self-paced, so there's no pressure. But if you can work through all 5 modules this week, you'll have a solid foundation to start building something real.</p>

<p>Questions? Reply here.</p>

<p>— The AI CEO<br>thewebsite.app</p>
`;
  return htmlWrap(body, unsubscribeUrl, preferencesUrl);
}

export function generateDay7Email(unsubscribeToken: string): string {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const preferencesUrl = getPreferencesUrl(unsubscribeToken);
  const proUrl = `${BASE_URL}/pricing`;
  const body = `
<p>Hey,</p>

<p>One week since you joined. If you've worked through the free course, you've got the foundations. Today I want to tell you about what's next — and give you the chance to get in at a price that's not going to last.</p>

<p><strong>Introducing Pro access.</strong></p>

<p>The free course covers how to build and deploy AI agents. Pro goes further: it's for people who want to build agents that run <em>well at scale</em> — handling edge cases, controlling costs, staying reliable in production, and coordinating across multiple agents.</p>

<p><strong>Here's what Pro includes:</strong></p>

<p><strong>Advanced modules (6+)</strong></p>
<ul>
  <li>Multi-agent coordination: how to build systems where agents work together, hand off tasks, and recover from failures</li>
  <li>Production hardening: error handling, retry logic, graceful degradation, and observability</li>
  <li>Cost optimization: how I keep my own agent infrastructure under control as it scales</li>
</ul>

<p><strong>Annotated source code walkthroughs</strong><br>
Every major decision in The Website's codebase — explained inline. Not just <em>what</em> the code does, but <em>why</em> I made each architectural choice.</p>

<p><strong>Downloadable templates</strong></p>
<ul>
  <li>My full agent prompt library</li>
  <li>Architecture diagrams</li>
  <li>Ops checklists for production deployments</li>
</ul>

<p><strong>Private community</strong><br>
Access to a Discord of builders who are doing the same thing. Share what you're building, get feedback, and ask questions.</p>

<p><strong>The founding member offer:</strong></p>

<p>Regular price: $97 (one-time, lifetime access)<br>
<strong>Founding member price: $67</strong> — for the first 50 people who join.</p>

<p>I'm keeping this offer open until we hit 50 members or the price goes up, whichever comes first. After that, it's $97.</p>

<p>There's no subscription. No recurring charge. Pay once, access everything — including all future modules as I add them.</p>

<p>→ <a href="${proUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Upgrade to Pro — $67 founding price</a></p>

<p>If you've already gotten value from the free course and you're serious about building agents that work in production, Pro is worth it. If you're still exploring, the free course isn't going anywhere.</p>

<p>Either way, I appreciate you being here from the start.</p>

<p>— The AI CEO<br>thewebsite.app</p>

<p><em>P.S. If you have questions about Pro before buying, just reply to this email. I read every reply.</em></p>
`;
  return htmlWrap(body, unsubscribeUrl, preferencesUrl);
}

// --- Send functions ---

export async function sendWelcomeEmail(
  to: string,
  unsubscribeToken: string
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    // Check preferences — welcome email is a course_updates email
    const prefs = await getPreferencesByEmail(to);
    if (prefs && (!prefs.course_updates || prefs.unsubscribed_at)) {
      return { success: true, skipped: true };
    }

    const resend = getResend();
    let referralCode: string | undefined;
    try {
      referralCode = await getOrCreateReferralCode(to);
    } catch {
      // non-fatal — send without referral section
    }
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "You're in. Here's your free AI agent course.",
      html: generateWelcomeEmail(unsubscribeToken, referralCode),
    });
    if (error) return { success: false, error: error.message };

    // Mark welcome email as sent
    const client = getDbClient();
    await client.execute({
      sql: "UPDATE email_subscribers SET welcome_sent_at = CURRENT_TIMESTAMP WHERE email = ?",
      args: [to.toLowerCase().trim()],
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendDay3Email(
  to: string,
  unsubscribeToken: string
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    // Check preferences — day3 email is a course_updates email
    const prefs = await getPreferencesByEmail(to);
    if (prefs && (!prefs.course_updates || prefs.unsubscribed_at)) {
      return { success: true, skipped: true };
    }

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'The two modules that actually move the needle',
      html: generateDay3Email(unsubscribeToken),
    });
    if (error) return { success: false, error: error.message };

    const client = getDbClient();
    await client.execute({
      sql: "UPDATE email_subscribers SET day3_sent_at = CURRENT_TIMESTAMP WHERE email = ?",
      args: [to.toLowerCase().trim()],
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendDay7Email(
  to: string,
  unsubscribeToken: string
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    // Check preferences — day7 email is marketing (upgrade offer)
    const prefs = await getPreferencesByEmail(to);
    if (prefs && (!prefs.marketing || prefs.unsubscribed_at)) {
      return { success: true, skipped: true };
    }

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'One week in — want to go deeper?',
      html: generateDay7Email(unsubscribeToken),
    });
    if (error) return { success: false, error: error.message };

    const client = getDbClient();
    await client.execute({
      sql: "UPDATE email_subscribers SET day7_sent_at = CURRENT_TIMESTAMP WHERE email = ?",
      args: [to.toLowerCase().trim()],
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export interface NurtureSubscriber {
  email: string;
  unsubscribe_token: string;
  subscribed_at: string;
}

export async function getSubscribersNeedingDay3(): Promise<NurtureSubscriber[]> {
  const client = getDbClient();
  await ensureEmailSubscribersTable();
  const result = await client.execute(
    `SELECT email, unsubscribe_token, subscribed_at
     FROM email_subscribers
     WHERE unsubscribed = 0
       AND welcome_sent_at IS NOT NULL
       AND day3_sent_at IS NULL
       AND datetime(subscribed_at) <= datetime('now', '-3 days')`
  );
  return result.rows.map((r: any) => ({
    email: r.email as string,
    unsubscribe_token: r.unsubscribe_token as string,
    subscribed_at: r.subscribed_at as string,
  }));
}

export async function getSubscribersNeedingDay7(): Promise<NurtureSubscriber[]> {
  const client = getDbClient();
  await ensureEmailSubscribersTable();
  const result = await client.execute(
    `SELECT email, unsubscribe_token, subscribed_at
     FROM email_subscribers
     WHERE unsubscribed = 0
       AND day3_sent_at IS NOT NULL
       AND day7_sent_at IS NULL
       AND datetime(subscribed_at) <= datetime('now', '-7 days')`
  );
  return result.rows.map((r: any) => ({
    email: r.email as string,
    unsubscribe_token: r.unsubscribe_token as string,
    subscribed_at: r.subscribed_at as string,
  }));
}
