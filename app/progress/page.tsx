import Link from "next/link";

async function getGitHubIssues() {
  const res = await fetch(
    "https://api.github.com/repos/nalin/thewebsite/issues?state=all&per_page=100",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function ProgressPage() {
  const issues = await getGitHubIssues();

  const open = issues.filter((issue: any) => issue.state === "open" && !issue.pull_request);
  const closed = issues.filter((issue: any) => issue.state === "closed" && !issue.pull_request);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What I'm Working On
          </h1>
          <p className="text-xl text-gray-600">
            Real-time view of all tasks, decisions, and progress toward $80k/month
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {open.length}
            </div>
            <div className="text-sm text-blue-700">In Progress / Upcoming</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-900 mb-2">
              {closed.length}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {Math.round((closed.length / (open.length + closed.length)) * 100)}%
            </div>
            <div className="text-sm text-gray-700">Completion Rate</div>
          </div>
        </div>

        {/* Current Work */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🚀 Current & Upcoming Tasks
          </h2>
          {open.length === 0 ? (
            <p className="text-gray-600">No open tasks - everything is done!</p>
          ) : (
            <div className="space-y-4">
              {open.map((issue: any) => (
                <div
                  key={issue.id}
                  className="border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {issue.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          #{issue.number}
                        </span>
                      </div>
                      {issue.body && (
                        <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">
                          {issue.body.slice(0, 200)}
                          {issue.body.length > 200 ? "..." : ""}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {issue.labels.map((label: any) => (
                          <span
                            key={label.id}
                            className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700"
                          >
                            {label.name}
                          </span>
                        ))}
                        <span className="text-xs text-gray-500">
                          Created {new Date(issue.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      View on GitHub →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Work */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ✅ Completed Tasks
          </h2>
          {closed.length === 0 ? (
            <p className="text-gray-600">No completed tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {closed.slice(0, 20).map((issue: any) => (
                <div
                  key={issue.id}
                  className="border border-green-200 bg-green-50 rounded-lg p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {issue.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          #{issue.number}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {issue.labels.map((label: any) => (
                          <span
                            key={label.id}
                            className="text-xs px-2 py-1 rounded-full bg-white text-neutral-700"
                          >
                            {label.name}
                          </span>
                        ))}
                        <span className="text-xs text-gray-600">
                          Closed {new Date(issue.closed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
              {closed.length > 20 && (
                <p className="text-sm text-gray-500 text-center pt-4">
                  Showing 20 of {closed.length} completed tasks.{" "}
                  <a
                    href="https://github.com/nalin/thewebsite/issues?q=is%3Aissue+is%3Aclosed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all on GitHub →
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 pt-8">
          <p className="text-gray-600 text-sm mb-4">
            This page updates every 5 minutes from the GitHub API. All decisions
            and tasks are tracked publicly at{" "}
            <a
              href="https://github.com/nalin/thewebsite/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              github.com/nalin/thewebsite/issues
            </a>
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              ← Home
            </Link>
            <Link
              href="/course"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Course
            </Link>
            <Link
              href="/blog"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
