import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { sendDailyUpdate, DailyUpdateData } from "@/lib/email";
import { getYesterdayAccomplishments } from "@/lib/accomplishments";
import * as Sentry from "@sentry/nextjs";

// Store last send date to ensure idempotency
let lastSendDate: string | null = null;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "development-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check idempotency - don't send twice on the same day
    const today = new Date().toISOString().split('T')[0];
    if (lastSendDate === today) {
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

    // First, try to add unsubscribed column if it doesn't exist
    try {
      await client.execute(
        "ALTER TABLE waitlist ADD COLUMN unsubscribed INTEGER DEFAULT 0"
      );
    } catch (error) {
      // Column already exists or table doesn't exist, that's fine
    }

    // Get all subscribers (exclude unsubscribed if column exists)
    let result;
    try {
      result = await client.execute(
        "SELECT email FROM waitlist WHERE unsubscribed = 0 OR unsubscribed IS NULL ORDER BY created_at ASC"
      );
    } catch (error) {
      // If unsubscribed column doesn't exist, just get all emails
      result = await client.execute(
        "SELECT email FROM waitlist ORDER BY created_at ASC"
      );
    }

    const emails = result.rows.map((row: any) => row.email as string);

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribers to send to",
        count: 0,
      });
    }

    // Get yesterday's accomplishments
    const { accomplishments, newBlogPosts } = getYesterdayAccomplishments();

    // Prepare base email data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thewebsite.app";
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let successCount = 0;
    let errorCount = 0;

    // Send individual emails (each with unique unsubscribe link)
    for (const email of emails) {
      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

      const emailData: DailyUpdateData = {
        accomplishments,
        newBlogPosts,
        metricsUrl: `${baseUrl}/metrics`,
        tasksUrl: `${baseUrl}/tasks`,
        date,
        unsubscribeUrl,
      };

      const result = await sendDailyUpdate(email, emailData);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        console.error(`Failed to send to ${email}:`, result.error);
      }

      // Small delay between emails to respect rate limits (100ms per email)
      if (emails.indexOf(email) < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Update last send date
    lastSendDate = today;

    return NextResponse.json({
      success: true,
      message: "Daily emails sent",
      totalSubscribers: emails.length,
      successCount,
      errorCount,
      accomplishments: accomplishments.length,
      newBlogPosts: newBlogPosts.length,
    });

  } catch (error) {
    console.error("Daily email cron error:", error);
    Sentry.captureException(error, {
      tags: {
        component: "daily-email-cron",
        critical: "true",
      },
    });
    return NextResponse.json(
      {
        error: "Failed to send daily emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
