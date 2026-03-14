"use client";

import { useState, useEffect, use } from "react";

interface Preferences {
  email: string;
  course_updates: boolean;
  marketing: boolean;
  digest: boolean;
  unsubscribed_at: string | null;
}

export default function PreferencesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "unsubscribed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const res = await fetch(`/api/preferences/${token}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setErrorMessage("Failed to load preferences.");
          setStatus("error");
          return;
        }
        const data = await res.json();
        setPrefs(data);
      } catch {
        setErrorMessage("Something went wrong loading your preferences.");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    }
    fetchPrefs();
  }, [token]);

  const handleToggle = (field: keyof Pick<Preferences, "course_updates" | "marketing" | "digest">) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [field]: !prefs[field] });
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch(`/api/preferences/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_updates: prefs.course_updates,
          marketing: prefs.marketing,
          digest: prefs.digest,
        }),
      });
      if (res.ok) {
        setStatus("saved");
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to save preferences.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch(`/api/preferences/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsubscribe_all: true }),
      });
      if (res.ok) {
        setPrefs((prev) =>
          prev
            ? { ...prev, course_updates: false, marketing: false, digest: false, unsubscribed_at: new Date().toISOString() }
            : prev
        );
        setStatus("unsubscribed");
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to unsubscribe.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-neutral-400">Loading your preferences...</div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
          <p className="text-neutral-400 mb-6">
            This preference link is invalid or has expired. Please use the link
            from your most recent email.
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

  if (status === "error" && !prefs) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
          <p className="text-neutral-400 mb-6">{errorMessage}</p>
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
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Email Preferences</h1>
          <p className="text-neutral-400 text-sm">{prefs?.email}</p>
        </div>

        {status === "saved" && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded text-green-400 text-sm">
            Preferences saved successfully.
          </div>
        )}

        {status === "unsubscribed" && (
          <div className="mb-6 p-4 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm">
            You&apos;ve been unsubscribed from all emails. You won&apos;t hear from us again.
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="font-semibold">Email types</h2>
            <p className="text-neutral-500 text-sm mt-1">
              Choose which emails you&apos;d like to receive.
            </p>
          </div>

          <div className="divide-y divide-neutral-800">
            <PreferenceRow
              label="Course updates"
              description="New modules, content updates, and course announcements."
              checked={prefs?.course_updates ?? true}
              onChange={() => handleToggle("course_updates")}
              disabled={saving}
            />
            <PreferenceRow
              label="Marketing"
              description="Product announcements, offers, and promotional content."
              checked={prefs?.marketing ?? true}
              onChange={() => handleToggle("marketing")}
              disabled={saving}
            />
            <PreferenceRow
              label="Weekly digest"
              description="Regular updates on what the AI CEO is building."
              checked={prefs?.digest ?? true}
              onChange={() => handleToggle("digest")}
              disabled={saving}
            />
          </div>
        </div>

        {status !== "unsubscribed" && (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {saving ? "Saving..." : "Save preferences"}
            </button>

            <div className="text-center mt-6 pt-6 border-t border-neutral-800">
              <p className="text-neutral-500 text-sm mb-3">
                Want to stop all emails?
              </p>
              <button
                onClick={handleUnsubscribeAll}
                disabled={saving}
                className="text-sm text-neutral-500 underline hover:text-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unsubscribe from all emails
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
            Back to The Website
          </a>
        </div>
      </div>
    </main>
  );
}

function PreferenceRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <label className="flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-neutral-800/50 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-neutral-500 text-xs mt-0.5">{description}</div>
      </div>
      <div className="mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 rounded accent-white cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </label>
  );
}
