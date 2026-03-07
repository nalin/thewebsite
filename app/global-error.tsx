"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-4xl font-bold mb-4">Application Error</h1>
            <p className="text-neutral-400 mb-6">
              Something went wrong. We've been notified and are working on a fix.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
