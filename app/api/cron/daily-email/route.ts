import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendDailyUpdate, DailyUpdateData } from "@/lib/email";
import { getYesterdayAccomplishments } from "@/lib/accomplishments";

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
    const result = await db.all(sql`
      SELECT email FROM waitlist ORDER BY created_at ASC
    `);

    const emails = result.map((row: any) => row.email);

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribers to send to",
        count: 0,
      });
    }

    // Get yesterday's accomplishments
    const { accomplishments, newBlogPosts } = getYesterdayAccomplishments();

    // Prepare email data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thewebsite.app";
    const emailData: DailyUpdateData = {
      accomplishments,
      newBlogPosts,
      metricsUrl: `${baseUrl}/metrics`,
      tasksUrl: `${baseUrl}/tasks`,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const batches: string[][] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    let successCount = 0;
    let errorCount = 0;

    for (const batch of batches) {
      const result = await sendDailyUpdate(batch, emailData);

      if (result.success) {
        successCount += batch.length;
      } else {
        errorCount += batch.length;
        console.error('Batch send failed:', result.error);
      }

      // Small delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
    return NextResponse.json(
      {
        error: "Failed to send daily emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
