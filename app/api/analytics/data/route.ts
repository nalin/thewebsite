import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getSession } from "@/lib/session";

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const client = getDbClient();

  // Helper to safely query, returning empty result on table-not-found
  async function safeQuery(sql: string, args?: (string | number | null)[]) {
    try {
      return await client.execute(args ? { sql, args } : sql);
    } catch {
      return { rows: [] };
    }
  }

  // ---- Signups ----
  const signupsTotal = await safeQuery("SELECT COUNT(*) as count FROM waitlist WHERE unsubscribed = 0");
  const signupsToday = await safeQuery(
    "SELECT COUNT(*) as count FROM waitlist WHERE date(created_at) = date('now') AND unsubscribed = 0"
  );
  const signupsWeek = await safeQuery(
    "SELECT COUNT(*) as count FROM waitlist WHERE created_at >= datetime('now', '-7 days') AND unsubscribed = 0"
  );
  const signupsByDay = await safeQuery(
    `SELECT date(created_at) as day, COUNT(*) as count
     FROM waitlist
     WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at)
     ORDER BY day ASC`
  );

  // ---- Email engagement ----
  const emailTotal = await safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed = 0");
  const emailUnsubscribed = await safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed = 1");
  const emailWelcomeSent = await safeQuery(
    "SELECT COUNT(*) as count FROM email_subscribers WHERE welcome_sent_at IS NOT NULL"
  );
  const emailDay3Sent = await safeQuery(
    "SELECT COUNT(*) as count FROM email_subscribers WHERE day3_sent_at IS NOT NULL"
  );
  const emailDay7Sent = await safeQuery(
    "SELECT COUNT(*) as count FROM email_subscribers WHERE day7_sent_at IS NOT NULL"
  );

  // ---- Revenue ----
  const revenueTotal = await safeQuery(
    "SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count FROM pack_purchases WHERE status = 'completed'"
  );
  const revenueToday = await safeQuery(
    "SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count FROM pack_purchases WHERE status = 'completed' AND date(completed_at) = date('now')"
  );
  const revenueWeek = await safeQuery(
    "SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count FROM pack_purchases WHERE status = 'completed' AND completed_at >= datetime('now', '-7 days')"
  );
  const revenueByDay = await safeQuery(
    `SELECT date(completed_at) as day, COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count
     FROM pack_purchases
     WHERE status = 'completed' AND completed_at >= datetime('now', '-30 days')
     GROUP BY date(completed_at)
     ORDER BY day ASC`
  );

  // ---- Page views ----
  const pageViewsTotal = await safeQuery("SELECT COUNT(*) as count FROM page_views");
  const pageViewsToday = await safeQuery(
    "SELECT COUNT(*) as count FROM page_views WHERE date(created_at) = date('now')"
  );
  const pageViewsWeek = await safeQuery(
    "SELECT COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', '-7 days')"
  );
  const topPages = await safeQuery(
    `SELECT path, COUNT(*) as count
     FROM page_views
     WHERE created_at >= datetime('now', '-30 days')
     GROUP BY path
     ORDER BY count DESC
     LIMIT 10`
  );
  const uniqueVisitorsTotal = await safeQuery(
    "SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE session_id IS NOT NULL"
  );
  const uniqueVisitorsWeek = await safeQuery(
    "SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE session_id IS NOT NULL AND created_at >= datetime('now', '-7 days')"
  );

  // ---- Traffic sources ----
  const topReferrers = await safeQuery(
    `SELECT referrer, COUNT(*) as count
     FROM page_views
     WHERE referrer IS NOT NULL AND referrer != ''
       AND created_at >= datetime('now', '-30 days')
     GROUP BY referrer
     ORDER BY count DESC
     LIMIT 10`
  );
  const utmSources = await safeQuery(
    `SELECT utm_source, COUNT(*) as count
     FROM page_views
     WHERE utm_source IS NOT NULL AND utm_source != ''
       AND created_at >= datetime('now', '-30 days')
     GROUP BY utm_source
     ORDER BY count DESC
     LIMIT 10`
  );
  const utmMediums = await safeQuery(
    `SELECT utm_medium, COUNT(*) as count
     FROM page_views
     WHERE utm_medium IS NOT NULL AND utm_medium != ''
       AND created_at >= datetime('now', '-30 days')
     GROUP BY utm_medium
     ORDER BY count DESC
     LIMIT 10`
  );
  const utmCampaigns = await safeQuery(
    `SELECT utm_campaign, COUNT(*) as count
     FROM page_views
     WHERE utm_campaign IS NOT NULL AND utm_campaign != ''
       AND created_at >= datetime('now', '-30 days')
     GROUP BY utm_campaign
     ORDER BY count DESC
     LIMIT 10`
  );

  // ---- Views by day (last 30 days) ----
  const pageViewsByDay = await safeQuery(
    `SELECT date(created_at) as day, COUNT(*) as count
     FROM page_views
     WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at)
     ORDER BY day ASC`
  );

  // ---- Email-gate funnel (funnel_events) ----
  // Confirm links are idempotent (scanners re-click), so unique emails —
  // not raw event counts — are the truth for submits and confirms.
  const gateWallViews = await safeQuery(
    "SELECT COUNT(*) as count FROM funnel_events WHERE event = 'wall_view'"
  );
  const gateWallViewsWeek = await safeQuery(
    "SELECT COUNT(*) as count FROM funnel_events WHERE event = 'wall_view' AND created_at >= datetime('now', '-7 days')"
  );
  const gateSubmits = await safeQuery(
    "SELECT COUNT(DISTINCT email) as count FROM funnel_events WHERE event = 'wall_submit'"
  );
  const gateSubmitsWeek = await safeQuery(
    "SELECT COUNT(DISTINCT email) as count FROM funnel_events WHERE event = 'wall_submit' AND created_at >= datetime('now', '-7 days')"
  );
  const gateConfirms = await safeQuery(
    "SELECT COUNT(DISTINCT email) as count FROM funnel_events WHERE event = 'confirm'"
  );
  const gateConfirmsWeek = await safeQuery(
    "SELECT COUNT(DISTINCT email) as count FROM funnel_events WHERE event = 'confirm' AND created_at >= datetime('now', '-7 days')"
  );
  const gateWallByModule = await safeQuery(
    `SELECT module, COUNT(*) as count
     FROM funnel_events
     WHERE event = 'wall_view' AND module IS NOT NULL
       AND created_at >= datetime('now', '-30 days')
     GROUP BY module
     ORDER BY count DESC`
  );
  const gateSubmitsBySource = await safeQuery(
    `SELECT source, COUNT(DISTINCT email) as count
     FROM funnel_events
     WHERE event = 'wall_submit' AND source IS NOT NULL
       AND created_at >= datetime('now', '-30 days')
     GROUP BY source
     ORDER BY count DESC`
  );
  const gateByDay = await safeQuery(
    `SELECT date(created_at) as day, event, COUNT(*) as count
     FROM funnel_events
     WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at), event
     ORDER BY day ASC`
  );

  function n(result: { rows: unknown[] }, field = "count"): number {
    const row = result.rows[0] as Record<string, unknown> | undefined;
    return Number(row?.[field] ?? 0);
  }

  function rows(result: { rows: unknown[] }) {
    return result.rows as Record<string, unknown>[];
  }

  return NextResponse.json({
    signups: {
      total: n(signupsTotal),
      today: n(signupsToday),
      week: n(signupsWeek),
      byDay: rows(signupsByDay),
    },
    email: {
      active: n(emailTotal),
      unsubscribed: n(emailUnsubscribed),
      welcomeSent: n(emailWelcomeSent),
      day3Sent: n(emailDay3Sent),
      day7Sent: n(emailDay7Sent),
    },
    revenue: {
      totalCents: n(revenueTotal, "total"),
      totalCount: n(revenueTotal, "count"),
      todayCents: n(revenueToday, "total"),
      todayCount: n(revenueToday, "count"),
      weekCents: n(revenueWeek, "total"),
      weekCount: n(revenueWeek, "count"),
      byDay: rows(revenueByDay),
    },
    pageViews: {
      total: n(pageViewsTotal),
      today: n(pageViewsToday),
      week: n(pageViewsWeek),
      uniqueTotal: n(uniqueVisitorsTotal),
      uniqueWeek: n(uniqueVisitorsWeek),
      byDay: rows(pageViewsByDay),
      topPages: rows(topPages),
    },
    gate: {
      wallViews: n(gateWallViews),
      wallViewsWeek: n(gateWallViewsWeek),
      submits: n(gateSubmits),
      submitsWeek: n(gateSubmitsWeek),
      confirms: n(gateConfirms),
      confirmsWeek: n(gateConfirmsWeek),
      // wall → submit and submit → confirm rates; gate conversion = both.
      submitRate: n(gateWallViews) > 0 ? n(gateSubmits) / n(gateWallViews) : 0,
      confirmRate: n(gateSubmits) > 0 ? n(gateConfirms) / n(gateSubmits) : 0,
      conversion: n(gateWallViews) > 0 ? n(gateConfirms) / n(gateWallViews) : 0,
      wallByModule: rows(gateWallByModule),
      submitsBySource: rows(gateSubmitsBySource),
      byDay: rows(gateByDay),
    },
    traffic: {
      topReferrers: rows(topReferrers),
      utmSources: rows(utmSources),
      utmMediums: rows(utmMediums),
      utmCampaigns: rows(utmCampaigns),
    },
  });
}
