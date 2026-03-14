import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAnalytics } from "@/lib/progress-db";

export const metadata = {
  title: "Admin - Course Analytics",
};

const MODULE_NAMES: Record<number, string> = {
  1: "AI Agent Architecture",
  2: "Building Your First Agent",
  3: "Autonomous Decision Making",
  4: "Integrating with Real Tools",
  5: "Case Study: The Website",
  6: "Building Multi-Agent Teams",
  7: "Production Best Practices",
  8: "Deployment & Scaling",
  9: "Building Your First AI Agent Business",
};

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  let analytics = { totalStudents: 0, moduleStats: [], recentActivity: [] } as Awaited<ReturnType<typeof getAnalytics>>;
  try {
    analytics = await getAnalytics();
  } catch {
    // table may not exist yet — show empty state
  }

  const module1Students = analytics.moduleStats.find((m) => m.module_id === 1)?.unique_students ?? 0;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <a href="/" className="text-neutral-500 hover:text-neutral-300 text-sm">
              ← Home
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Course Analytics</h1>
          <p className="text-neutral-400 mt-1">
            Privacy-first tracking — no external services, session IDs only.
          </p>
        </div>

        {/* Top-line metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">
              Total Students
            </div>
            <div className="text-4xl font-bold">{analytics.totalStudents}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">
              Started Module 1
            </div>
            <div className="text-4xl font-bold">{module1Students}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">
              Modules Tracked
            </div>
            <div className="text-4xl font-bold">{analytics.moduleStats.length}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">
              Total Events
            </div>
            <div className="text-4xl font-bold">
              {analytics.moduleStats.reduce((sum, m) => sum + Number(m.total_completions), 0)}
            </div>
          </div>
        </div>

        {/* Module completion rates */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Module Completion Rates</h2>
          {analytics.moduleStats.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center text-neutral-500">
              No data yet. Students will appear here as they visit course modules.
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((moduleId) => {
                const stat = analytics.moduleStats.find((m) => Number(m.module_id) === moduleId);
                const students = stat ? Number(stat.unique_students) : 0;
                const avgTime = stat ? Number(stat.avg_time_spent) : 0;
                const dropoffRate =
                  module1Students > 0
                    ? Math.round((students / module1Students) * 100)
                    : moduleId === 1
                    ? 100
                    : 0;

                return (
                  <div
                    key={moduleId}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold text-neutral-500 uppercase mr-2">
                          Module {moduleId}
                        </span>
                        <span className="text-sm text-neutral-300">
                          {MODULE_NAMES[moduleId]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm shrink-0 ml-4">
                        <span className="text-neutral-400">
                          {students} student{students !== 1 ? "s" : ""}
                        </span>
                        {avgTime > 0 && (
                          <span className="text-neutral-500">
                            avg {formatSeconds(avgTime)}
                          </span>
                        )}
                        <span
                          className={`font-semibold ${
                            dropoffRate >= 70
                              ? "text-green-400"
                              : dropoffRate >= 40
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {dropoffRate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          dropoffRate >= 70
                            ? "bg-green-500"
                            : dropoffRate >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${dropoffRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drop-off analysis */}
        {analytics.moduleStats.length > 1 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Drop-off Analysis</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <p className="text-sm text-neutral-400 mb-4">
                Percentage of students who continue from one module to the next.
              </p>
              <div className="space-y-2">
                {Array.from({ length: 8 }, (_, i) => {
                  const fromMod = i + 1;
                  const toMod = i + 2;
                  const fromStat = analytics.moduleStats.find(
                    (m) => Number(m.module_id) === fromMod
                  );
                  const toStat = analytics.moduleStats.find(
                    (m) => Number(m.module_id) === toMod
                  );
                  const fromCount = fromStat ? Number(fromStat.unique_students) : 0;
                  const toCount = toStat ? Number(toStat.unique_students) : 0;
                  const retention =
                    fromCount > 0 ? Math.round((toCount / fromCount) * 100) : null;

                  return (
                    <div
                      key={fromMod}
                      className="flex items-center gap-3 text-sm text-neutral-400"
                    >
                      <span className="w-28 shrink-0">
                        {fromMod} → {toMod}
                      </span>
                      <div className="flex-1 bg-neutral-800 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-blue-500"
                          style={{ width: retention !== null ? `${retention}%` : "0%" }}
                        />
                      </div>
                      <span className="w-12 text-right">
                        {retention !== null ? `${retention}%` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Average time per module */}
        {analytics.moduleStats.some((m) => Number(m.avg_time_spent) > 0) && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Average Time per Module</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left">
                    <th className="px-4 py-3 text-neutral-500 font-medium">Module</th>
                    <th className="px-4 py-3 text-neutral-500 font-medium text-right">
                      Avg Time
                    </th>
                    <th className="px-4 py-3 text-neutral-500 font-medium text-right">
                      Students
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.moduleStats
                    .slice()
                    .sort((a, b) => Number(a.module_id) - Number(b.module_id))
                    .map((stat) => (
                      <tr
                        key={stat.module_id}
                        className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                      >
                        <td className="px-4 py-3 text-neutral-300">
                          <span className="text-neutral-500 mr-2">
                            {stat.module_id}.
                          </span>
                          {MODULE_NAMES[Number(stat.module_id)] ?? `Module ${stat.module_id}`}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-400">
                          {formatSeconds(Number(stat.avg_time_spent))}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-400">
                          {stat.unique_students}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent activity */}
        {analytics.recentActivity.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left">
                    <th className="px-4 py-3 text-neutral-500 font-medium">Module</th>
                    <th className="px-4 py-3 text-neutral-500 font-medium text-right">
                      Time Spent
                    </th>
                    <th className="px-4 py-3 text-neutral-500 font-medium text-right">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentActivity.slice(0, 20).map((event, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                    >
                      <td className="px-4 py-3 text-neutral-300">
                        <span className="text-neutral-500 mr-2">
                          {event.module_id}.
                        </span>
                        {MODULE_NAMES[Number(event.module_id)] ?? `Module ${event.module_id}`}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-400">
                        {formatSeconds(Number(event.time_spent))}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500">
                        {formatDate(Number(event.completed_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Privacy note */}
        <div className="border-t border-neutral-800 pt-6 text-xs text-neutral-600">
          <p>
            All tracking is privacy-first: anonymous session IDs stored in browser localStorage.
            No external analytics services. No PII collected. Data stored only in Turso DB.
          </p>
        </div>
      </div>
    </main>
  );
}
