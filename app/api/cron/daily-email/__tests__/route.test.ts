import { describe, it, expect, vi } from "vitest";
import { resolveDigestCopy } from "../route";

// Importing the route pulls in the mail/DB/Sentry stack; none of it is needed
// to test the copy gate, so stub the heavy edges.
vi.mock("@libsql/client", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendDailyUpdate: vi.fn() }));
vi.mock("@/lib/accomplishments", () => ({
  getNewBlogPosts: vi.fn(),
}));
vi.mock("@/lib/email-preferences", () => ({ getPreferencesByEmail: vi.fn() }));
vi.mock("@/lib/cron-auth", () => ({ isAuthorizedCron: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

// Issue #154 item 3: the digest used to hardcode a launch-era "Day 3 of running
// The Website as an AI CEO…" story. A manual trigger would have mailed that
// months-stale copy to the whole list. The route now refuses to send unless the
// copy is supplied for the run.
describe("resolveDigestCopy", () => {
  it("returns null when no copy is configured — the run must not send", () => {
    expect(resolveDigestCopy({})).toBeNull();
  });

  it("returns null when only one of the two is set", () => {
    expect(resolveDigestCopy({ DIGEST_STORY_HOOK: "Today we shipped X." })).toBeNull();
    expect(resolveDigestCopy({ DIGEST_KEY_INSIGHT: "Ship smaller." })).toBeNull();
  });

  it("treats blank/whitespace-only copy as unconfigured", () => {
    expect(
      resolveDigestCopy({ DIGEST_STORY_HOOK: "   ", DIGEST_KEY_INSIGHT: "  " })
    ).toBeNull();
  });

  it("returns the trimmed copy when both are supplied", () => {
    expect(
      resolveDigestCopy({
        DIGEST_STORY_HOOK: "  Today we shipped X.  ",
        DIGEST_KEY_INSIGHT: "  Ship smaller.  ",
      })
    ).toEqual({ storyHook: "Today we shipped X.", keyInsight: "Ship smaller." });
  });

  // The specific regression: nothing in the module supplies default copy any
  // more, so an unconfigured environment can't fall back to the old story.
  it("has no built-in fallback copy", () => {
    expect(resolveDigestCopy({ SOME_OTHER_VAR: "x" })).toBeNull();
  });
});
