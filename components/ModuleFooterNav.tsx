import Link from "next/link";

interface ModuleFooterNavProps {
  /** Href of the previous module. Omit on module 1. */
  prevHref?: string;
  /** Label of the previous module, e.g. "Module 1: Automation vs. Autonomy". */
  prevLabel?: string;
  /** Href of the next module. Omit on the last module (pass isLast instead). */
  nextHref?: string;
  /** Label of the next module. */
  nextLabel?: string;
  /** Last module (10): the primary CTA becomes the certificate link. */
  isLast?: boolean;
}

// Standardized end-of-module navigation. Forward navigation is the PRIMARY
// action (prominent bg-black button, matching module 1's reference CTA);
// "Previous" and "Back to Course" are clearly secondary. Shared so this
// can't drift per-module again. Server component (no client hooks).
export default function ModuleFooterNav({
  prevHref,
  prevLabel,
  nextHref,
  nextLabel,
  isLast = false,
}: ModuleFooterNavProps) {
  return (
    <nav className="border-t border-neutral-200 mt-12 pt-8">
      <div className="flex items-center justify-between gap-4">
        {/* LEFT — secondary "Previous" (muted, small); omitted on module 1 */}
        {prevHref ? (
          <Link
            href={prevHref}
            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            ← Previous: {prevLabel}
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}

        {/* RIGHT — PRIMARY forward CTA */}
        {isLast ? (
          <Link
            href="/course/certificate"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Get your certificate →
          </Link>
        ) : nextHref ? (
          <Link
            href={nextHref}
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Continue to {nextLabel} →
          </Link>
        ) : null}
      </div>

      {/* Secondary, unobtrusive "Back to Course" — never the primary action */}
      <div className="mt-6">
        <Link
          href="/course"
          className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          Back to Course
        </Link>
      </div>
    </nav>
  );
}
