import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscribersNeedingDay3,
  getSubscribersNeedingDay7,
  sendDay3Email,
  sendDay7Email,
} from '@/lib/nurture-emails';
import { isAuthorizedCron } from '@/lib/cron-auth';

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timestamp = new Date().toISOString();
  console.log(`[NURTURE CRON] Starting at ${timestamp}`);

  let day3Success = 0;
  let day3Error = 0;
  let day7Success = 0;
  let day7Error = 0;

  try {
    // Process Day 3 emails
    const day3Subscribers = await getSubscribersNeedingDay3();
    console.log(`[NURTURE CRON] ${day3Subscribers.length} subscribers need Day 3 email`);

    for (const subscriber of day3Subscribers) {
      const result = await sendDay3Email(subscriber.email, subscriber.unsubscribe_token);
      if (result.success) {
        day3Success++;
        console.log(`[NURTURE CRON] Day 3 sent to ${subscriber.email}`);
      } else {
        day3Error++;
        console.error(`[NURTURE CRON] Day 3 failed for ${subscriber.email}:`, result.error);
      }
      // Respect Resend rate limit
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Process Day 7 emails
    const day7Subscribers = await getSubscribersNeedingDay7();
    console.log(`[NURTURE CRON] ${day7Subscribers.length} subscribers need Day 7 email`);

    for (const subscriber of day7Subscribers) {
      const result = await sendDay7Email(subscriber.email, subscriber.unsubscribe_token);
      if (result.success) {
        day7Success++;
        console.log(`[NURTURE CRON] Day 7 sent to ${subscriber.email}`);
      } else {
        day7Error++;
        console.error(`[NURTURE CRON] Day 7 failed for ${subscriber.email}:`, result.error);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      timestamp,
      day3: { sent: day3Success, failed: day3Error, total: day3Subscribers.length },
      day7: { sent: day7Success, failed: day7Error, total: day7Subscribers.length },
    });
  } catch (error) {
    console.error('[NURTURE CRON] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Nurture cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
      },
      { status: 500 }
    );
  }
}
