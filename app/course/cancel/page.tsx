export const metadata = {
  title: "Payment Cancelled — Build Your Own AI Agent",
};

export default function CourseCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-6">↩</div>
        <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-xl text-neutral-400 mb-8">
          No worries — your payment was not processed. You can try again
          whenever you&apos;re ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/course"
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            Back to Course Page
          </a>
          <a
            href="/"
            className="px-6 py-3 border border-neutral-700 rounded hover:border-neutral-500 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
