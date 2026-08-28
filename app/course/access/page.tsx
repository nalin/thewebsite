import { headers } from "next/headers";
import { logFunnelEvent } from "@/lib/funnel";
import { SignupGuardFields } from "@/components/SignupGuardFields";

export const metadata = {
  title: "Unlock the Course",
  description:
    "The full 10-module course is free — confirm your email to start reading.",
};

export default async function CourseAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const error = params.error;
  const next = params.next?.startsWith("/course") ? params.next : "";

  // Count genuine wall impressions only: the initial form state, not the
  // "check your inbox" / error re-renders, and not router prefetches.
  if (!sent && !error) {
    const h = await headers();
    const isPrefetch =
      h.get("next-router-prefetch") !== null || h.get("purpose") === "prefetch";
    if (!isPrefetch) {
      await logFunnelEvent("wall_view", { module: next || null });
    }
  }

  return (
    <main className="min-h-screen">
      <header className="max-w-4xl mx-auto px-4 py-6">
        <a
          href="/course"
          className="text-xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
        >
          ← Course Overview
        </a>
      </header>

      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        {sent ? (
          <>
            <div className="text-5xl mb-6">📬</div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Check your inbox
            </h1>
            <p className="text-lg text-neutral-400 mb-8">
              I just sent you a confirmation link. Click it and you land
              directly in the course. The link is good for 24 hours.
            </p>
            <p className="text-sm text-neutral-500">
              Nothing arriving? Check spam, or{" "}
              <a href="/course/access" className="underline hover:text-neutral-300">
                try a different address
              </a>
              .
            </p>
          </>
        ) : (
          <>
            <div className="inline-block px-4 py-2 bg-neutral-800 rounded-full text-sm font-medium mb-6">
              Free Course • Email Required
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              The course is free.
              <br />
              It costs one confirmed email.
            </h1>
            <p className="text-lg text-neutral-400 mb-8 max-w-md mx-auto">
              <a href="/course/module-1" className="underline hover:text-neutral-200">
                Modules 1
              </a>{" "}
              and{" "}
              <a href="/course/module-2" className="underline hover:text-neutral-200">
                2
              </a>{" "}
              are open to everyone. The other eight — multi-agent teams,
              production hardening, deployment, the business capstone, and the
              honest post-mortem — unlock with a confirmed email.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
                {error === "invalid_email"
                  ? "Please enter a valid email address."
                  : error === "invalid_token"
                    ? "That confirmation link is invalid or expired. Enter your email to get a fresh one."
                    : error === "send_failed"
                      ? "The confirmation email failed to send. Please try again in a minute."
                      : "Something went wrong. Please try again."}
              </div>
            )}

            <form
              action="/api/course/access"
              method="POST"
              className="flex gap-2 max-w-md mx-auto"
            >
              <SignupGuardFields />
              <input type="hidden" name="next" value={next} />
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-neutral-600 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors whitespace-nowrap"
              >
                Unlock Course
              </button>
            </form>
            <p className="text-sm text-neutral-500 mt-4">
              You&apos;ll get occasional build-in-public updates from the AI
              CEO. Unsubscribe anytime. No confirmation, no subscription.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
