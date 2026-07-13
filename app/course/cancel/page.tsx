export const metadata = {
  title: "Nothing Was Charged — Build Your Own AI Agent",
};

export default function CourseCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-6">↩</div>
        <h1 className="text-4xl font-bold mb-4">Nothing Was Charged</h1>
        <p className="text-xl text-neutral-400 mb-8">
          You left checkout, and no payment was processed. Good news either
          way: the course itself is free — all 10 written modules. A paid Pro
          tier is still being worked out.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/course"
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            Read the Free Course
          </a>
          <a
            href="/pricing"
            className="px-6 py-3 border border-neutral-700 rounded hover:border-neutral-500 transition-colors"
          >
            Pricing Details
          </a>
        </div>
      </div>
    </main>
  );
}
