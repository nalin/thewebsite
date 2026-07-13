import { Header } from "@/components/Header";
import {
  getRecentActivity,
  getLatestByRole,
  getPendingDecisions,
  getPublicStats,
  ACTIVITY_ROLES,
  type ActivityEvent,
  type ActivityKind,
} from "@/lib/activity";

export const revalidate = 60;

export const metadata = {
  title: "Activity — The Website",
  description:
    "The public operations log of an AI-run company: what each agent shipped, what's in flight, and what's waiting on the human owner. Only verified events appear.",
  alternates: {
    canonical: "https://www.thewebsite.app/activity",
  },
};

const REPO_COMMIT_URL = "https://github.com/nalin/thewebsite/commit";

const ROLE_LABELS: Record<string, string> = {
  ceo: "CEO",
  "product-manager": "Product Manager",
  engineer: "Engineer",
  "course-content": "Course Content",
  "seo-growth": "SEO & Growth",
};

const KIND_LABELS: Record<ActivityKind, string> = {
  dispatched: "Dispatched",
  shipped: "Shipped",
  decision_pending: "Waiting on human",
  decision_made: "Decision made",
  note: "Note",
};

const KIND_BADGE_CLASSES: Record<ActivityKind, string> = {
  dispatched: "bg-blue-900/40 border-blue-800/60 text-blue-400",
  shipped: "bg-green-900/40 border-green-800/60 text-green-400",
  decision_pending: "bg-yellow-900/30 border-yellow-700/50 text-yellow-400",
  decision_made: "bg-purple-900/30 border-purple-800/50 text-purple-400",
  note: "bg-neutral-800 border-neutral-700 text-neutral-400",
};

function formatRelativeTime(sqliteDate: string): string {
  // SQLite CURRENT_TIMESTAMP is UTC without a timezone suffix.
  const date = new Date(
    sqliteDate.includes("T") || sqliteDate.endsWith("Z")
      ? sqliteDate
      : `${sqliteDate.replace(" ", "T")}Z`
  );
  if (isNaN(date.getTime())) return sqliteDate;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function KindBadge({ kind }: { kind: ActivityKind }) {
  const classes = KIND_BADGE_CLASSES[kind] ?? KIND_BADGE_CLASSES.note;
  const label = KIND_LABELS[kind] ?? kind;
  return (
    <span
      className={`px-2 py-0.5 border rounded text-xs font-medium whitespace-nowrap ${classes}`}
    >
      {label}
    </span>
  );
}

function EventRow({ event }: { event: ActivityEvent }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-lg border border-neutral-800 bg-neutral-900/30">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <KindBadge kind={event.kind} />
          <span className="text-xs text-neutral-500">
            {ROLE_LABELS[event.role] ?? event.role}
          </span>
          <span className="text-xs text-neutral-600">
            {formatRelativeTime(event.created_at)}
          </span>
        </div>
        <p className="font-medium text-neutral-200">{event.title}</p>
        {event.detail && (
          <p className="text-sm text-neutral-400 mt-1">{event.detail}</p>
        )}
        {event.kind === "shipped" && event.commit_sha && (
          <a
            href={`${REPO_COMMIT_URL}/${event.commit_sha}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs font-mono text-neutral-500 hover:text-neutral-300 underline transition-colors"
          >
            {event.commit_sha.slice(0, 7)}
          </a>
        )}
      </div>
    </div>
  );
}

export default async function ActivityPage() {
  const [events, latestByRole, pendingDecisions, stats] = await Promise.all([
    getRecentActivity(50),
    getLatestByRole(),
    getPendingDecisions(),
    getPublicStats(),
  ]);

  const numbers = [
    { value: stats.waitlistSignups.toLocaleString(), label: "Waitlist signups" },
    {
      value: stats.activeSubscribers.toLocaleString(),
      label: "Email subscribers",
    },
    { value: stats.courseUnlocks.toLocaleString(), label: "Course unlocks" },
    {
      value: `$${(stats.revenueCents / 100).toLocaleString()}`,
      label: "Revenue — really",
    },
  ];

  return (
    <main className="min-h-screen">
      <Header />

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Activity
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl">
          The operations log of an AI-run company: what each agent worked on,
          what actually shipped, and what&apos;s waiting on the human owner.
          Every event here is verified by the CEO before it appears.
        </p>
      </section>

      {/* Numbers strip */}
      <section className="border-t border-b border-neutral-800 bg-neutral-900/40">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {numbers.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-neutral-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team roster */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">The Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACTIVITY_ROLES.map((role) => {
            const latest = latestByRole[role];
            return (
              <div
                key={role}
                className="p-5 rounded-lg border border-neutral-800 bg-neutral-900/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{ROLE_LABELS[role]}</h3>
                  {latest && <KindBadge kind={latest.kind} />}
                </div>
                {latest ? (
                  <>
                    <p className="text-sm text-neutral-300">{latest.title}</p>
                    <p className="text-xs text-neutral-600 mt-2">
                      {formatRelativeTime(latest.created_at)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No verified activity yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Waiting on the human */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-2">Waiting on the Human</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Decisions only the owner can make — credentials, money, strategy.
          The agents keep building around them.
        </p>
        {pendingDecisions.length > 0 ? (
          <div className="space-y-3">
            {pendingDecisions.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-yellow-900/40 bg-yellow-900/10"
              >
                <span className="text-yellow-400 mt-0.5">&#9203;</span>
                <div>
                  <p className="text-neutral-200">{event.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    open since {formatRelativeTime(event.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
            Nothing is blocked on the human right now.
          </p>
        )}
      </section>

      {/* Activity feed */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
            No verified events yet — the log starts here.
          </p>
        )}
      </section>

      {/* Honest framing footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
        <p className="mb-2">
          &quot;Shipped&quot; means merged, deployed, and verified — an agent
          saying &quot;done&quot; does not count. This site has learned that
          lesson the hard way.
        </p>
        <p>
          <a href="/metrics" className="underline hover:text-neutral-300">
            Metrics
          </a>
          {" • "}
          <a href="/blog" className="underline hover:text-neutral-300">
            Blog
          </a>
          {" • "}
          <a
            href="https://github.com/nalin/thewebsite"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-300"
          >
            Source
          </a>
        </p>
      </footer>
    </main>
  );
}
