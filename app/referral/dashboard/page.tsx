"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface ReferralStats {
  referral_code: string;
  referral_url: string;
  referral_count: number;
  reward_unlocked: boolean;
}

const REWARD_THRESHOLD = 3;

function ReferralDashboardContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    fetch(`/api/referral/stats?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCopy = () => {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referral_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-neutral-400">Loading your referral stats...</div>
      </main>
    );
  }

  if (notFound || !token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Referral Dashboard</h1>
          <p className="text-neutral-400 mb-6">
            This link is invalid or expired. Use the referral link from your
            welcome email to access your dashboard.
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

  const progress = Math.min(
    ((stats?.referral_count ?? 0) / REWARD_THRESHOLD) * 100,
    100
  );
  const remaining = Math.max(
    REWARD_THRESHOLD - (stats?.referral_count ?? 0),
    0
  );

  const twitterText = encodeURIComponent(
    `I'm learning how to build AI agents from an AI CEO that's actually running a business. Free course — ${stats?.referral_url}`
  );
  const linkedInUrl = encodeURIComponent(stats?.referral_url ?? "");

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-10">
          <a
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-6 inline-block"
          >
            ← The Website
          </a>
          <h1 className="text-3xl font-bold mb-2">Your Referral Dashboard</h1>
          <p className="text-neutral-400">
            Share your link. Earn exclusive access.
          </p>
        </div>

        {/* Reward status */}
        {stats?.reward_unlocked ? (
          <div className="mb-8 p-5 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="text-green-400 font-semibold text-lg mb-1">
              Bonus module unlocked!
            </div>
            <p className="text-green-300 text-sm">
              You've referred {stats.referral_count} friends. Your bonus module{" "}
              <strong>Building Multi-Agent Teams</strong> is now available.
            </p>
            <a
              href="/course/bonus-multi-agent"
              className="inline-block mt-3 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
            >
              Access Bonus Module →
            </a>
          </div>
        ) : (
          <div className="mb-8 p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Progress to reward</span>
              <span className="text-neutral-400 text-sm">
                {stats?.referral_count ?? 0} / {REWARD_THRESHOLD} referrals
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 mb-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-neutral-400 text-sm">
              {remaining > 0 ? (
                <>
                  Refer{" "}
                  <strong className="text-white">
                    {remaining} more {remaining === 1 ? "friend" : "friends"}
                  </strong>{" "}
                  to unlock the bonus module:{" "}
                  <strong className="text-white">
                    Building Multi-Agent Teams
                  </strong>
                  .
                </>
              ) : (
                "Reward processing..."
              )}
            </p>
          </div>
        )}

        {/* Referral link */}
        <div className="mb-8 p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
          <h2 className="font-semibold mb-3">Your referral link</h2>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={stats?.referral_url ?? ""}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm font-mono text-neutral-300 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Social share */}
        <div className="mb-8 p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
          <h2 className="font-semibold mb-3">Share</h2>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://twitter.com/intent/tweet?text=${twitterText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] hover:bg-[#1a8fd1] text-white text-sm font-medium rounded transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${linkedInUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] hover:bg-[#006396] text-white text-sm font-medium rounded transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
          <h2 className="font-semibold mb-4">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-neutral-800 rounded">
              <div className="text-3xl font-bold text-white">
                {stats?.referral_count ?? 0}
              </div>
              <div className="text-neutral-400 text-sm mt-1">
                Friends referred
              </div>
            </div>
            <div className="text-center p-4 bg-neutral-800 rounded">
              <div className="text-3xl font-bold text-white">
                {stats?.reward_unlocked ? "✓" : remaining}
              </div>
              <div className="text-neutral-400 text-sm mt-1">
                {stats?.reward_unlocked ? "Reward unlocked" : "Until reward"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            Back to The Website
          </a>
        </div>
      </div>
    </main>
  );
}

export default function ReferralDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-neutral-400">Loading...</div>
        </main>
      }
    >
      <ReferralDashboardContent />
    </Suspense>
  );
}
