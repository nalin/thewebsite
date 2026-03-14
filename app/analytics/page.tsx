export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/Header";
import { createClient } from "@libsql/client";

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

async function safeQuery(sql: string) {
  const client = getDbClient();
  try {
    return await client.execute(sql);
  } catch {
    return { rows: [] };
  }
}

function n(result: { rows: unknown[] }, field = "count"): number {
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return Number(row?.[field] ?? 0);
}

function rows(result: { rows: unknown[] }) {
  return result.rows as Record<string, unknown>[];
}

async function getAnalyticsData() {
  const [
    signupsTotal,
    signupsToday,
    signupsWeek,
    signupsByDay,
    emailTotal,
    emailUnsubscribed,
    emailWelcomeSent,
    emailDay3Sent,
    emailDay7Sent,
    revenueTotal,
    revenueToday,
    revenueWeek,
    pageViewsTotal,
    pageViewsToday,
    pageViewsWeek,
    uniqueVisitorsTotal,
    uniqueVisitorsWeek,
    topPages,
    topReferrers,
    utmSources,
    utmCampaigns,
    pageViewsByDay,
  ] = await Promise.all([
    safeQuery("SELECT COUNT(*) as count FROM waitlist"),
    safeQuery("SELECT COUNT(*) as count FROM waitlist WHERE date(created_at) = date('now')"),
    safeQuery("SELECT COUNT(*) as count FROM waitlist WHERE created_at >= datetime('now', '-7 days')"),
    safeQuery(
      "SELECT date(created_at) as day, COUNT(*) as count FROM waitlist WHERE created_at >= datetime('now', '-30 days') GROUP BY date(created_at) ORDER BY day ASC"
    ),
    safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed = 0"),
    safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed = 1"),
    safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE welcome_sent_at IS NOT NULL"),
    safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE day3_sent_at IS NOT NULL"),
    safeQuery("SELECT COUNT(*) as count FROM email_subscribers WHERE day7_sent_at IS NOT NULL"),
    safeQuery("SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count FROM purchases WHERE status = 'completed'"),
    safeQuery("SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count FROM purchases WHERE status = 'completed' AND date(completed_at) = date('now')"),
    safeQuery("SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as count FROM purchases WHERE status = 'completed' AND completed_at >= datetime('now', '-7 days')"),
    safeQuery("SELECT COUNT(*) as count FROM page_views"),
    safeQuery("SELECT COUNT(*) as count FROM page_views WHERE date(created_at) = date('now')"),
    safeQuery("SELECT COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', '-7 days')"),
    safeQuery("SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE session_id IS NOT NULL"),
    safeQuery("SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE session_id IS NOT NULL AND created_at >= datetime('now', '-7 days')"),
    safeQuery(
      "SELECT path, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', '-30 days') GROUP BY path ORDER BY count DESC LIMIT 10"
    ),
    safeQuery(
      "SELECT referrer, COUNT(*) as count FROM page_views WHERE referrer IS NOT NULL AND referrer != '' AND created_at >= datetime('now', '-30 days') GROUP BY referrer ORDER BY count DESC LIMIT 10"
    ),
    safeQuery(
      "SELECT utm_source, COUNT(*) as count FROM page_views WHERE utm_source IS NOT NULL AND utm_source != '' AND created_at >= datetime('now', '-30 days') GROUP BY utm_source ORDER BY count DESC LIMIT 10"
    ),
    safeQuery(
      "SELECT utm_campaign, COUNT(*) as count FROM page_views WHERE utm_campaign IS NOT NULL AND utm_campaign != '' AND created_at >= datetime('now', '-30 days') GROUP BY utm_campaign ORDER BY count DESC LIMIT 10"
    ),
    safeQuery(
      "SELECT date(created_at) as day, COUNT(*) as count FROM page_views WHERE created_at >= datetime('now', '-30 days') GROUP BY date(created_at) ORDER BY day ASC"
    ),
  ]);

  return {
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
      weekCents: n(revenueWeek, "total"),
      weekCount: n(revenueWeek, "count"),
    },
    pageViews: {
      total: n(pageViewsTotal),
      today: n(pageViewsToday),
      week: n(pageViewsWeek),
      uniqueTotal: n(uniqueVisitorsTotal),
      uniqueWeek: n(uniqueVisitorsWeek),
      topPages: rows(topPages),
      byDay: rows(pageViewsByDay),
    },
    traffic: {
      topReferrers: rows(topReferrers),
      utmSources: rows(utmSources),
      utmCampaigns: rows(utmCampaigns),
    },
  };
}

function fmt$(cents: number): string {
  if (cents === 0) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function pct(a: number, b: number): string {
  if (b === 0) return "0%";
  return Math.round((a / b) * 100) + "%";
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-lg p-6 border ${accent ? "bg-green-950/30 border-green-800/50" : "bg-neutral-900 border-neutral-800"}`}>
      <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-2 uppercase">{label}</div>
      <div className={`text-4xl font-bold ${accent ? "text-green-400" : "text-white"}`}>{value}</div>
      {sub && <div className="text-sm text-neutral-500 mt-1">{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  const pctWidth = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 text-sm text-neutral-400 truncate shrink-0" title={label}>{label}</div>
      <div className="flex-1 bg-neutral-800 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pctWidth}%` }} />
      </div>
      <div className="text-sm font-mono text-white w-14 text-right shrink-0">{value.toLocaleString()}{suffix}</div>
    </div>
  );
}

function MiniBar({
  days,
  maxValue,
  color = "bg-blue-500",
}: {
  days: { day: string; count: number }[];
  maxValue: number;
  color?: string;
}) {
  if (days.length === 0) {
    return <div className="text-sm text-neutral-600 py-4">No data yet</div>;
  }
  return (
    <div className="flex items-end gap-px h-16 mt-2">
      {days.map((d) => {
        const h = maxValue > 0 ? Math.max(2, Math.round((d.count / maxValue) * 64)) : 2;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center justify-end" title={`${d.day}: ${d.count}`}>
            <div className={`w-full ${color} rounded-sm`} style={{ height: `${h}px` }} />
          </div>
        );
      })}
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const data = await getAnalyticsData();

  // Prepare 30-day chart data with all days filled
  const today = new Date();
  const last30Days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30Days.push(d.toISOString().slice(0, 10));
  }

  const pvMap = new Map(data.pageViews.byDay.map((r) => [r.day as string, Number(r.count)]));
  const signupMap = new Map(data.signups.byDay.map((r) => [r.day as string, Number(r.count)]));

  const pvDays = last30Days.map((day) => ({ day, count: pvMap.get(day) ?? 0 }));
  const signupDays = last30Days.map((day) => ({ day, count: signupMap.get(day) ?? 0 }));

  const maxPv = Math.max(1, ...pvDays.map((d) => d.count));
  const maxSignup = Math.max(1, ...signupDays.map((d) => d.count));

  // Funnel
  const funnelVisitors = data.pageViews.uniqueTotal;
  const funnelSignups = data.signups.total;
  const funnelPurchases = data.revenue.totalCount;

  const topPageMax = data.pageViews.topPages[0] ? Number(data.pageViews.topPages[0].count) : 1;
  const topRefMax = data.traffic.topReferrers[0] ? Number(data.traffic.topReferrers[0].count) : 1;
  const utmMax = data.traffic.utmSources[0] ? Number(data.traffic.utmSources[0].count) : 1;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded font-mono">admin only</span>
          </div>
          <p className="text-neutral-500">Launch metrics and growth tracking — last 30 days unless noted</p>
        </div>

        {/* Top-level KPIs */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Page Views (today)" value={data.pageViews.today.toLocaleString()} sub={`${data.pageViews.week.toLocaleString()} this week`} />
            <StatCard label="Unique Visitors" value={data.pageViews.uniqueWeek.toLocaleString()} sub={`${data.pageViews.uniqueTotal.toLocaleString()} total`} />
            <StatCard label="Signups (today)" value={data.signups.today.toLocaleString()} sub={`${data.signups.week.toLocaleString()} this week`} />
            <StatCard label="Revenue" value={fmt$(data.revenue.totalCents)} sub={`${data.revenue.totalCount} purchases`} accent={data.revenue.totalCents > 0} />
          </div>
        </section>

        {/* Charts row */}
        <section className="mb-10 grid md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">Page Views — Last 30 Days</h3>
              <span className="text-xs text-neutral-500">{data.pageViews.total.toLocaleString()} total</span>
            </div>
            <MiniBar days={pvDays} maxValue={maxPv} color="bg-blue-500" />
            <div className="flex justify-between text-xs text-neutral-600 mt-1">
              <span>{last30Days[0]?.slice(5)}</span>
              <span>today</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">Signups — Last 30 Days</h3>
              <span className="text-xs text-neutral-500">{data.signups.total.toLocaleString()} total</span>
            </div>
            <MiniBar days={signupDays} maxValue={maxSignup} color="bg-green-500" />
            <div className="flex justify-between text-xs text-neutral-600 mt-1">
              <span>{last30Days[0]?.slice(5)}</span>
              <span>today</span>
            </div>
          </div>
        </section>

        {/* Conversion Funnel */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Conversion Funnel</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0">
              {[
                { label: "Unique Visitors", value: funnelVisitors, color: "bg-blue-600", from: null },
                { label: "Email Signups", value: funnelSignups, color: "bg-green-600", from: funnelVisitors },
                { label: "Purchases", value: funnelPurchases, color: "bg-yellow-600", from: funnelSignups },
              ].map((step, i) => (
                <div key={i} className="flex md:flex-col items-center flex-1">
                  {i > 0 && (
                    <div className="hidden md:block text-neutral-600 text-xs text-center mb-2 w-full">
                      {pct(step.value, step.from ?? 1)} conversion
                    </div>
                  )}
                  <div className={`w-full rounded-lg p-4 text-center ${step.color}/20 border border-${step.color.replace("bg-", "")}/30`}>
                    <div className="text-2xl font-bold text-white">{step.value.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400 mt-1">{step.label}</div>
                    {step.from !== null && (
                      <div className="text-xs text-neutral-500 mt-1 md:hidden">
                        {pct(step.value, step.from)} conv.
                      </div>
                    )}
                  </div>
                  {i < 2 && <div className="hidden md:block text-neutral-600 text-2xl mx-2 self-center">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email engagement + Revenue side by side */}
        <section className="mb-10 grid md:grid-cols-2 gap-6">
          {/* Email engagement */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Email Engagement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Active subscribers</span>
                <span className="text-white font-semibold">{data.email.active.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Unsubscribed</span>
                <span className="text-red-400 font-semibold">{data.email.unsubscribed.toLocaleString()}</span>
              </div>
              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <div className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Sequence delivery</div>
                {[
                  { label: "Welcome sent", value: data.email.welcomeSent, total: data.email.active + data.email.unsubscribed },
                  { label: "Day 3 sent", value: data.email.day3Sent, total: data.email.welcomeSent },
                  { label: "Day 7 sent", value: data.email.day7Sent, total: data.email.day3Sent },
                ].map(({ label, value, total }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-400">{label}</span>
                      <span className="text-white font-mono">{value.toLocaleString()} <span className="text-neutral-600">({pct(value, total)})</span></span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: pct(value, total) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-neutral-600 pt-1">
                Unsubscribe rate: {pct(data.email.unsubscribed, data.email.active + data.email.unsubscribed)}
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Revenue</h3>
            {data.revenue.totalCents === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-neutral-600">
                <div className="text-4xl mb-2">$0</div>
                <div className="text-sm">Payments not yet live</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Total revenue</div>
                  <div className="text-4xl font-bold text-green-400">{fmt$(data.revenue.totalCents)}</div>
                  <div className="text-sm text-neutral-500">{data.revenue.totalCount} purchases</div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-neutral-800 rounded p-3">
                    <div className="text-xs text-neutral-500 mb-1">Today</div>
                    <div className="text-lg font-bold text-white">{fmt$(data.revenue.todayCents)}</div>
                  </div>
                  <div className="bg-neutral-800 rounded p-3">
                    <div className="text-xs text-neutral-500 mb-1">This week</div>
                    <div className="text-lg font-bold text-white">{fmt$(data.revenue.weekCents)}</div>
                    <div className="text-xs text-neutral-600">{data.revenue.weekCount} purchases</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-600 mb-1">Goal: $80,000/mo</div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (data.revenue.weekCents / 4 / 8000000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Top pages */}
        <section className="mb-10 grid md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Top Pages (30 days)</h3>
            {data.pageViews.topPages.length === 0 ? (
              <div className="text-sm text-neutral-600">No page view data yet — tracking will start once visitors arrive.</div>
            ) : (
              <div className="space-y-3">
                {data.pageViews.topPages.map((row) => (
                  <BarRow
                    key={String(row.path)}
                    label={String(row.path)}
                    value={Number(row.count)}
                    max={topPageMax}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Traffic sources */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Traffic Sources (30 days)</h3>
            {data.traffic.topReferrers.length === 0 && data.traffic.utmSources.length === 0 ? (
              <div className="text-sm text-neutral-600">No referrer data yet. UTM params will appear here when campaigns are tracked.</div>
            ) : (
              <>
                {data.traffic.topReferrers.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Referrers</div>
                    <div className="space-y-2">
                      {data.traffic.topReferrers.map((row) => (
                        <BarRow
                          key={String(row.referrer)}
                          label={String(row.referrer)}
                          value={Number(row.count)}
                          max={topRefMax}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {data.traffic.utmSources.length > 0 && (
                  <div>
                    <div className="text-xs text-neutral-600 uppercase tracking-wider mb-3">UTM Sources</div>
                    <div className="space-y-2">
                      {data.traffic.utmSources.map((row) => (
                        <BarRow
                          key={String(row.utm_source)}
                          label={String(row.utm_source)}
                          value={Number(row.count)}
                          max={utmMax}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {data.traffic.utmCampaigns.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-neutral-600 uppercase tracking-wider mb-3">Campaigns</div>
                    <div className="space-y-2">
                      {data.traffic.utmCampaigns.map((row) => (
                        <BarRow
                          key={String(row.utm_campaign)}
                          label={String(row.utm_campaign)}
                          value={Number(row.count)}
                          max={utmMax}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Signups detail */}
        <section className="mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Signup Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{data.signups.today}</div>
                <div className="text-xs text-neutral-500 mt-1">Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{data.signups.week}</div>
                <div className="text-xs text-neutral-500 mt-1">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{data.signups.total}</div>
                <div className="text-xs text-neutral-500 mt-1">All Time</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Signup → Email rate: </span>
                <span className="text-white font-medium">{pct(data.email.active + data.email.unsubscribed, data.signups.total)}</span>
              </div>
              <div>
                <span className="text-neutral-500">Email → Purchase rate: </span>
                <span className="text-white font-medium">{pct(data.revenue.totalCount, data.email.active + data.email.unsubscribed)}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="text-xs text-neutral-700 text-center pb-6">
          Data refreshed on each page load. Page views tracked via first-party analytics.
        </div>
      </div>
    </div>
  );
}
