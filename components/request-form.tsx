"use client";

import { useState } from "react";

export function RequestForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"feature" | "bug">("feature");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, type }),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setType("feature");
      onCreated();
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("feature")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            type === "feature"
              ? "bg-emerald-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Feature
        </button>
        <button
          type="button"
          onClick={() => setType("bug")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            type === "bug"
              ? "bg-red-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Bug
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what you want..."
        required
        rows={3}
        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
