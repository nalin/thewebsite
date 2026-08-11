import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { sendDailyUpdate, DailyUpdateData } from "@/lib/email";
import { getNewBlogPosts } from "@/lib/accomplishments";
import { getPreferencesByEmail } from "@/lib/email-preferences";
import { isAuthorizedCron } from "@/lib/cron-auth";
import * as Sentry from "@sentry/nextjs";

// Store last send date to ensure idempotency
let lastSendDate: string | null = null;

export interface DigestCopy {
  storyHook: string;
  keyInsight: string;
}

// The digest used to carry a hardcoded launch-era story ("Day 3 of running The
// Website as an AI CEO…"). The schedule is paused, but a manual trigger would
// have mailed that months-stale copy to the whole list as if it were today's
// update. Rather than invent replacement copy the route can't know, this now
// REFUSES TO SEND until the copy is supplied per-run — which is also the
// standing rule that no mass send goes out without an explicit human decision.
//
// Supply it as env vars (DIGEST_STORY_HOOK / DIGEST_KEY_INSIGHT) or the run is
// a no-op. Pure and exported so the refusal is unit-testable.
// (Issue #154 item 3.)
export function resolveDigestCopy(
  env: Record<string, string | undefined>
): DigestCopy | null {
  const storyHook = env.DIGEST_STORY_HOOK?.trim();
  const keyInsight = env.DIGEST_KEY_INSIGHT?.trim();
  if (!storyHook || !keyInsight) return null;
  return { storyHook, keyInsight };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    if (!isAuthorizedCron(request)) {
      console.error(`[CRON] Unauthorized access attempt at ${timestamp}`);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceResend = searchParams.get("force_resend") === "true";

    console.log(`[CRON] Daily email cron started at ${timestamp}`, {
      forceResend,
    });

    // Check idempotency - don't send twice on the same day (unless force_resend=true)
    const today = new Date().toISOString().split('T')[0];
    if (lastSendDate === today && !forceResend) {
      console.log(`[CRON] Email already sent today (${today}), skipping`);
      return NextResponse.json({
        success: true,
        message: "Email already sent today",
        skipped: true,
      });
    }

    // Today's copy must be supplied for this run — see resolveDigestCopy.
    // Checked before touching the database: a run that cannot legitimately
    // send should do nothing at all.
    const copy = resolveDigestCopy(process.env);
    if (!copy) {
      console.warn(
        "[CRON] Refusing to send: DIGEST_STORY_HOOK/DIGEST_KEY_INSIGHT are not set. No email sent."
      );
      return NextResponse.json(
        {
          success: false,
          skipped: true,
          sent: 0,
          message:
            "Digest copy is not configured for this run (DIGEST_STORY_HOOK and DIGEST_KEY_INSIGHT). Refusing to send stale copy.",
        },
        { status: 409 }
      );
    }

    // Get all subscriber emails from waitlist
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:local.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Check if unsubscribed column exists by querying table schema
    let hasUnsubscribedColumn = false;
    try {
      const schemaResult = await client.execute(
        "PRAGMA table_info(waitlist)"
      );
      hasUnsubscribedColumn = schemaResult.rows.some((row: any) => row.name === 'unsubscribed');
    } catch (error) {
      // Can't check schema, assume column doesn't exist
    }

    // Add unsubscribed column if it doesn't exist
    if (!hasUnsubscribedColumn) {
      try {
        await client.execute(
          "ALTER TABLE waitlist ADD COLUMN unsubscribed INTEGER DEFAULT 0"
        );
        hasUnsubscribedColumn = true;
      } catch (error) {
        // Failed to add column, will query without it
      }
    }

    // Get all subscribers
    const result = hasUnsubscribedColumn
      ? await client.execute(
          "SELECT email FROM waitlist WHERE (unsubscribed = 0 OR unsubscribed IS NULL) ORDER BY created_at ASC"
        )
      : await client.execute(
          "SELECT email FROM waitlist ORDER BY created_at ASC"
        );

    const emails = result.rows.map((row: any) => row.email as string);

    if (emails.length === 0) {
      console.log(`[CRON] No subscribers to send to`);
      return NextResponse.json({
        success: true,
        message: "No subscribers to send to",
        count: 0,
      });
    }

    console.log(`[CRON] Sending to ${emails.length} recipients`);

    // Get blog posts that went live in the last 24 hours
    const newBlogPosts = getNewBlogPosts();

    // Prepare base email data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thewebsite.app";
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get waitlist count for metrics
    const waitlistCount = emails.length;

    const { storyHook, keyInsight } = copy;

    let successCount = 0;
    let errorCount = 0;

    // Send individual emails (each with unique unsubscribe link)
    for (const email of emails) {
      // Check digest preference before sending
      try {
        const prefs = await getPreferencesByEmail(email);
        if (prefs && (!prefs.digest || prefs.unsubscribed_at)) {
          console.log(`[CRON] Skipping ${email} — digest preference off or unsubscribed`);
          continue;
        }
      } catch {
        // Non-fatal: if prefs lookup fails, proceed with sending
      }

      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

      const emailData: DailyUpdateData = {
        storyHook,
        keyInsight,
        metrics: {
          waitlist: waitlistCount,
          revenue: 0,
          blogPosts: newBlogPosts.length > 0 ? 1 : 0,
        },
        newBlogPost: newBlogPosts.length > 0 ? {
          title: newBlogPosts[0].title,
          url: newBlogPosts[0].url,
        } : undefined,
        // Both /metrics and /tasks are now permanent redirects to /activity,
        // which is the one live page carrying public numbers and current work.
        // Mailing a redirect costs a hop and breaks if the redirect is ever
        // retired, so link the real page. (Issue #154 item 3.)
        metricsUrl: `${baseUrl}/activity`,
        tasksUrl: `${baseUrl}/activity`,
        date,
        unsubscribeUrl,
      };

      const result = await sendDailyUpdate(email, emailData);

      if (result.success) {
        successCount++;
        console.log(`[CRON] Successfully sent to ${email}`);
      } else {
        errorCount++;
        console.error(`[CRON] Failed to send to ${email}:`, result.error);
      }

      // Delay between emails to respect Resend rate limit (2 emails/second = 500ms delay)
      if (emails.indexOf(email) < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Update last send date
    lastSendDate = today;

    const duration = Date.now() - startTime;
    console.log(`[CRON] Daily email cron completed in ${duration}ms`, {
      successCount,
      errorCount,
      totalRecipients: emails.length,
    });

    return NextResponse.json({
      success: true,
      message: `Daily emails sent to ${successCount} subscribers`,
      totalSubscribers: emails.length,
      successCount,
      errorCount,
      storyFormat: true,
      timestamp,
      durationMs: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[CRON] Daily email cron error after ${duration}ms:`, error);
    Sentry.captureException(error, {
      tags: {
        component: "daily-email-cron",
        critical: "true",
      },
      extra: {
        timestamp,
        durationMs: duration,
      },
    });
    return NextResponse.json(
      {
        error: "Failed to send daily emails",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      },
      { status: 500 }
    );
  }
}
