"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/testimonials-schema";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const EMPTY_FORM = {
  name: "",
  role: "",
  company: "",
  testimonial: "",
  avatarUrl: "",
  featured: true,
};

export default function TestimonialsAdminClient({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const [list, setList] = useState<Testimonial[]>(initialTestimonials);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        role: form.role || null,
        company: form.company || null,
        testimonial: form.testimonial,
        avatarUrl: form.avatarUrl || null,
        featured: form.featured,
      };

      if (editingId !== null) {
        const res = await fetch(`/api/testimonials/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const updated: Testimonial = await res.json();
        setList((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
        setEditingId(null);
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const created: Testimonial = await res.json();
        setList((prev) => [created, ...prev]);
      }

      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(t: Testimonial) {
    setForm({
      name: t.name,
      role: t.role ?? "",
      company: t.company ?? "",
      testimonial: t.testimonial,
      avatarUrl: t.avatarUrl ?? "",
      featured: t.featured,
    });
    setEditingId(t.id);
    setShowForm(true);
    setError(null);
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function toggleFeatured(t: Testimonial) {
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !t.featured }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: Testimonial = await res.json();
      setList((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      setList((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="space-y-8">
      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors text-sm"
        >
          + Add Testimonial
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl border border-neutral-700 bg-neutral-900/60 space-y-4"
        >
          <h2 className="text-lg font-semibold mb-2">
            {editingId !== null ? "Edit Testimonial" : "New Testimonial"}
          </h2>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:border-neutral-500 text-sm"
                placeholder="Alex M."
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Role
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:border-neutral-500 text-sm"
                placeholder="Senior Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Company
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:border-neutral-500 text-sm"
                placeholder="Stripe"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, avatarUrl: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:border-neutral-500 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Testimonial *
            </label>
            <textarea
              required
              rows={3}
              value={form.testimonial}
              onChange={(e) =>
                setForm((f) => ({ ...f, testimonial: e.target.value }))
              }
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:border-neutral-500 text-sm resize-none"
              placeholder="The course quality is exceptional..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-neutral-300">
              Featured (shown on homepage & launch page)
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId !== null ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="px-5 py-2 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {list.length === 0 && (
          <p className="text-neutral-500 text-sm">No testimonials yet.</p>
        )}
        {list.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/30"
          >
            {t.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.avatarUrl}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {getInitials(t.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm">{t.name}</span>
                {t.role && (
                  <span className="text-xs text-neutral-500">{t.role}</span>
                )}
                {t.company && (
                  <span className="text-xs text-neutral-500">@ {t.company}</span>
                )}
                {t.featured && (
                  <span className="px-2 py-0.5 bg-green-900/40 border border-green-800/60 rounded text-green-400 text-xs">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400 line-clamp-2">
                {t.testimonial}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleFeatured(t)}
                className="text-xs px-2 py-1 border border-neutral-700 rounded hover:border-neutral-500 transition-colors"
                title={t.featured ? "Remove from featured" : "Mark as featured"}
              >
                {t.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => startEdit(t)}
                className="text-xs px-2 py-1 border border-neutral-700 rounded hover:border-neutral-500 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-xs px-2 py-1 border border-red-900/50 rounded text-red-400 hover:border-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
