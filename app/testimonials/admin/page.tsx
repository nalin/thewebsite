export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { testimonials, ensureTestimonialsTable } from "@/lib/testimonials-schema";
import { desc } from "drizzle-orm";
import { AdminTestimonialActions } from "./AdminTestimonialActions";

export default async function AdminTestimonialsPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  await ensureTestimonialsTable();

  const allTestimonials = await db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.createdAt))
    .all();

  const pending = allTestimonials.filter((t) => t.status === "pending");
  const approved = allTestimonials.filter((t) => t.status === "approved");
  const published = allTestimonials.filter((t) => t.status === "published");
  const rejected = allTestimonials.filter((t) => t.status === "rejected");

  const statusCounts = {
    pending: pending.length,
    approved: approved.length,
    published: published.length,
    rejected: rejected.length,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <a href="/" className="text-xl font-bold tracking-tight">The Website</a>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400">Testimonials Admin</span>
        </div>
        <a href="/testimonials" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
          View submission form →
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Testimonials Moderation</h1>
          <div className="flex gap-6 text-sm text-neutral-400">
            <span><span className="text-yellow-400 font-bold">{statusCounts.pending}</span> pending</span>
            <span><span className="text-blue-400 font-bold">{statusCounts.approved}</span> approved</span>
            <span><span className="text-green-400 font-bold">{statusCounts.published}</span> published</span>
            <span><span className="text-red-400 font-bold">{statusCounts.rejected}</span> rejected</span>
          </div>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">Pending Review ({pending.length})</h2>
            <div className="space-y-4">
              {pending.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </section>
        )}

        {/* Approved (ready to publish) */}
        {approved.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Approved — Ready to Publish ({approved.length})</h2>
            <div className="space-y-4">
              {approved.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </section>
        )}

        {/* Published */}
        {published.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-green-400 mb-4">Published ({published.length})</h2>
            <div className="space-y-4">
              {published.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </section>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-red-400 mb-4">Rejected ({rejected.length})</h2>
            <div className="space-y-4">
              {rejected.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </section>
        )}

        {allTestimonials.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            No testimonials yet.
          </div>
        )}
      </div>
    </div>
  );
}

type Testimonial = {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  testimonialText: string;
  rating: number;
  consentPublic: boolean | null;
  status: string;
  submitterEmail: string | null;
  createdAt: Date | null;
  reviewedAt: Date | null;
};

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-900/30 border-yellow-800",
    approved: "bg-blue-900/30 border-blue-800",
    published: "bg-green-900/30 border-green-800",
    rejected: "bg-red-900/20 border-red-900",
  };

  const stars = "★".repeat(t.rating) + "☆".repeat(5 - t.rating);

  return (
    <div className={`border rounded-lg p-6 ${statusColors[t.status] || "border-neutral-800 bg-neutral-900/50"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-white">{t.name}</div>
          {(t.role || t.company) && (
            <div className="text-sm text-neutral-400">
              {[t.role, t.company].filter(Boolean).join(" at ")}
            </div>
          )}
          {t.submitterEmail && (
            <div className="text-xs text-neutral-500 mt-0.5">{t.submitterEmail}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 text-sm">{stars}</span>
          <span className="text-xs text-neutral-500">
            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
          </span>
        </div>
      </div>

      <p className="text-neutral-300 text-sm leading-relaxed mb-4">{t.testimonialText}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${t.consentPublic ? "bg-green-900/30 text-green-400" : "bg-neutral-800 text-neutral-500"}`}>
          {t.consentPublic ? "Consented to publish" : "No consent"}
        </span>
        <AdminTestimonialActions id={t.id} currentStatus={t.status} />
      </div>
    </div>
  );
}
