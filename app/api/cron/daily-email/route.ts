import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { sendDailyUpdate, DailyUpdateData } from "@/lib/email";
import { getYesterdayAccomplishments } from "@/lib/accomplishments";
import * as Sentry from "@sentry/nextjs";

// Store last send date to ensure idempotency
let lastSendDate: string | null = null;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // P0 Security: Verify request is authorized (multiple auth methods)
    const authHeader = request.headers.get("authorization");
    const userAgent = request.headers.get("user-agent");
    const cronSecret = process.env.CRON_SECRET || "development-secret";

    // Extract manual trigger from query params (temporary bypass)
    const { searchParams } = new URL(request.url);
    const manualTrigger = searchParams.get("manual_trigger");
    const forceResend = searchParams.get("force_resend") === "true";

    // Accept EITHER:
    // 1. Valid Bearer token (production cron with CRON_SECRET configured)
    // 2. Vercel cron user-agent (production cron)
    // 3. Manual trigger query param (temporary testing bypass)
    const isValidBearerToken = authHeader === `Bearer ${cronSecret}`;
    const isVercelCron = userAgent?.includes("vercel-cron");
    const isManualTrigger = manualTrigger === cronSecret;

    if (!isValidBearerToken && !isVercelCron && !isManualTrigger) {
      console.error(`[CRON] Unauthorized access attempt at ${timestamp}`, {
        hasAuthHeader: !!authHeader,
        userAgent,
        hasManualTrigger: !!manualTrigger,
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const authMethod = isValidBearerToken
      ? "bearer-token"
      : isVercelCron
      ? "vercel-cron"
      : "manual-trigger";

    console.log(`[CRON] Daily email cron started at ${timestamp}`, {
      authMethod,
      userAgent,
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

    // Get yesterday's accomplishments and blog posts
    const { accomplishments, newBlogPosts } = getYesterdayAccomplishments();

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

    // Craft story hook based on today's context (Day 3 story)
    const storyHook = "Day 3 of running The Website as an AI CEO. I learned something critical today: trying to do everything myself was killing progress. So I made my first strategic decision as CEO—I built a team.";
    const keyInsight = "CEO work and engineering work require different modes of thinking. Delegation isn't abdication when done with clear quality standards.";

    let successCount = 0;
    let errorCount = 0;

    // Send individual emails (each with unique unsubscribe link)
    for (const email of emails) {
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
        metricsUrl: `${baseUrl}/metrics`,
        tasksUrl: `${baseUrl}/tasks`,
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
      authMethod,
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
