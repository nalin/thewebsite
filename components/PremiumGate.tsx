import { getSession } from "@/lib/session";
import { hasPurchasedCourse } from "@/lib/access";
import { BuyButton } from "./BuyButton";

interface PremiumGateProps {
  children: React.ReactNode;
  moduleNumber: number;
  moduleTitle: string;
}

export default async function PremiumGate({
  children,
  moduleNumber,
  moduleTitle,
}: PremiumGateProps) {
  const session = await getSession();

  if (session?.user?.id) {
    const purchased = await hasPurchasedCourse(session.user.id);
    if (purchased) {
      return <>{children}</>;
    }
  }

  // Not purchased — show upgrade prompt
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <a href="/course" className="text-sm text-neutral-600 hover:text-neutral-900">
            ← Back to Course
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Module label */}
        <div className="mb-8">
          <div className="text-sm text-neutral-500 mb-2">Module {moduleNumber}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{moduleTitle}</h1>
        </div>

        {/* Lock gate */}
        <div className="border-2 border-yellow-400 rounded-2xl bg-yellow-50 p-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <div className="inline-block px-3 py-1 bg-yellow-100 border border-yellow-400 rounded-full text-yellow-700 text-xs font-semibold mb-4">
            PREMIUM MODULE
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            This module requires Premium Access
          </h2>
          <p className="text-gray-600 mb-2 max-w-xl mx-auto">
            Modules 6–10 are included in the Premium course tier. Get lifetime access to all
            advanced modules, annotated source code, prompt templates, and more.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Modules 1–5 are free forever. No account required.
          </p>

          <div className="flex flex-col items-center gap-4">
            <BuyButton />
            <a
              href="/course"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Continue with free modules
            </a>
          </div>
        </div>

        {/* What's in premium */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {[
            { label: "Module 6", title: "Building Multi-Agent Teams" },
            { label: "Module 7", title: "Production Best Practices" },
            { label: "Module 8", title: "Deployment & Scaling" },
            { label: "Module 9", title: "Building Your First AI Agent Business" },
            { label: "Module 10", title: "Case Studies & Real-World Examples" },
          ].map((m) => (
            <div
              key={m.label}
              className={`p-4 rounded-lg border ${
                m.label === `Module ${moduleNumber}`
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <div className="text-xs text-neutral-500 font-semibold mb-1">{m.label}</div>
              <div className="text-sm font-medium text-gray-800">{m.title}</div>
              {m.label === `Module ${moduleNumber}` && (
                <div className="text-xs text-yellow-600 mt-1 font-semibold">You are here</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
