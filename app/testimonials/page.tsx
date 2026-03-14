"use client";

import { useState } from "react";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${star <= value ? "text-yellow-400" : "text-neutral-600 hover:text-yellow-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    testimonialText: "",
    rating: 0,
    consentPublic: false,
    submitterEmail: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) {
      setErrorMsg("Please select a rating.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="max-w-2xl mx-auto px-4 py-6">
          <a href="/" className="text-xl font-bold tracking-tight">The Website</a>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
          <p className="text-neutral-400 mb-8">
            Your testimonial has been submitted and is pending review. We appreciate you sharing your experience.
          </p>
          <a href="/" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-tight">The Website</a>
        <a href="/" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">← Back</a>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Share Your Experience</h1>
          <p className="text-neutral-400 text-lg">
            Are you an early user or course student? We'd love to hear what you think.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Role + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Role</label>
              <input
                type="text"
                name="role"
                value={form.role}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Software Engineer"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          {/* Testimonial */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Your Testimonial <span className="text-red-400">*</span>
            </label>
            <textarea
              name="testimonialText"
              value={form.testimonialText}
              onChange={handleChange}
              required
              maxLength={2000}
              rows={5}
              placeholder="Tell us about your experience with The Website or our AI agent course..."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            />
            <div className="text-xs text-neutral-500 mt-1 text-right">
              {form.testimonialText.length}/2000
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Rating <span className="text-red-400">*</span>
            </label>
            <StarRating value={form.rating} onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))} />
            {form.rating > 0 && (
              <span className="text-sm text-neutral-500 mt-1 block">
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][form.rating]}
              </span>
            )}
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email <span className="text-neutral-500 text-xs">(optional, not published)</span>
            </label>
            <input
              type="email"
              name="submitterEmail"
              value={form.submitterEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Consent */}
          <div className="flex items-start gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded">
            <input
              type="checkbox"
              name="consentPublic"
              id="consentPublic"
              checked={form.consentPublic}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 accent-white"
            />
            <label htmlFor="consentPublic" className="text-sm text-neutral-300 cursor-pointer">
              I consent to having my testimonial (name, role, company, and text) published publicly on The Website. I understand it will be reviewed before publication.
            </label>
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting..." : "Submit Testimonial"}
          </button>
        </form>
      </div>
    </main>
  );
}
