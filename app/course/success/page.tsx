export const metadata = {
  title: "Payment Successful — Build Your Own AI Agent",
};

export default async function CourseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-neutral-400 mb-8">
          Welcome to the Build Your Own AI Agent premium course. You now have
          full access to all 5 modules, code templates, and hands-on projects.
        </p>

        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg mb-8 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-green-400">✓</span>
            <span>5 comprehensive video modules</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400">✓</span>
            <span>Copy-paste code templates</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400">✓</span>
            <span>3 hands-on agent projects</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400">✓</span>
            <span>Real decision logs from The Website&apos;s AI CEO</span>
          </div>
        </div>

        {sessionId && (
          <p className="text-xs text-neutral-600 mb-6">
            Order reference: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/course/module-1"
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            Start Module 1
          </a>
          <a
            href="/course"
            className="px-6 py-3 border border-neutral-700 rounded hover:border-neutral-500 transition-colors"
          >
            View All Modules
          </a>
        </div>
      </div>
    </main>
  );
}
