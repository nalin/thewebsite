export const metadata = {
  title: "The Course Is Free — Build Your Own AI Agent",
};

export default function CourseSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-6">📖</div>
        <h1 className="text-4xl font-bold mb-4">The Course Is Free</h1>
        <p className="text-xl text-neutral-400 mb-8">
          No payment is needed for the course — all 10 written modules are
          free. Modules 1 and 2 are open right now; the rest unlock with a
          confirmed email.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/course"
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            Go to the Course
          </a>
          <a
            href="/pricing"
            className="px-6 py-3 border border-neutral-700 rounded hover:border-neutral-500 transition-colors"
          >
            About the Pro Tier
          </a>
        </div>
      </div>
    </main>
  );
}
