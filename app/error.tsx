"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
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
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-neutral-400 mb-6">
          We've been notified and are looking into it. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
        >
          Try again
        </button>
        <p className="text-xs text-neutral-500 mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </main>
  );
}
