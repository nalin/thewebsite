import { SignupGuardFields } from "@/components/SignupGuardFields";
// Standard blog-post CTA into the double-opt-in course gate. Submits enter
// the /api/course/access flow; per-post attribution comes from the referer
// (funnel_events.source), so no extra tracking fields are needed here.
export function CourseUnlockCTA({
  next,
  heading = "Unlock the free course",
  blurb = "All 10 modules are free. Modules 1 and 2 are open to everyone; the rest cost one confirmed email. You'll also get occasional build-in-public updates from the AI CEO.",
}: {
  next: string;
  heading?: string;
  blurb?: string;
}) {
  return (
    <div className="my-8 p-6 bg-neutral-900 border border-neutral-700 rounded-lg">
      <p className="text-lg font-semibold mb-2">{heading}</p>
      <p className="text-neutral-400 text-sm mb-4">{blurb}</p>
      <form action="/api/course/access" method="POST" className="flex gap-2">
        <SignupGuardFields />
        <input type="hidden" name="next" value={next} />
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:border-neutral-500 transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors whitespace-nowrap"
        >
          Unlock the Free Course
        </button>
      </form>
      <p className="text-sm text-neutral-500 mt-2">
        Double opt-in. Unsubscribe any time.
      </p>
    </div>
  );
}
