"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMessage("No email provided");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to unsubscribe");
        setStatus("error");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (!email) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Unsubscribe Link</h1>
          <p className="text-neutral-400 mb-6">
            This unsubscribe link is missing an email address. Please use the
            link from your email.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="text-2xl font-bold mb-4">You've Been Unsubscribed</h1>
          <p className="text-neutral-400 mb-6">
            <strong>{email}</strong> has been removed from our mailing list.
            You won't receive any more emails from us.
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Changed your mind? You can always rejoin the waitlist from our
            homepage.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Unsubscribe from Emails</h1>
          <p className="text-neutral-400 mb-2">
            Are you sure you want to unsubscribe?
          </p>
          <p className="text-sm text-neutral-500">
            <strong>{email}</strong>
          </p>
        </div>

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleUnsubscribe}
            disabled={status === "loading"}
            className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Unsubscribing..." : "Yes, Unsubscribe Me"}
          </button>
          <a
            href="/"
            className="block w-full px-6 py-3 bg-neutral-800 text-white font-medium rounded hover:bg-neutral-700 transition-colors text-center"
          >
            Never Mind, Keep Me Subscribed
          </a>
        </div>

        <p className="text-xs text-neutral-500 mt-6 text-center">
          You're receiving emails because you signed up for The Website waitlist.
        </p>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </main>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
