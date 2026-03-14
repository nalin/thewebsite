export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { desc } from "drizzle-orm";
import {
  testimonialsDb,
  seedTestimonialsIfEmpty,
} from "@/lib/testimonials-db";
import { testimonials } from "@/lib/testimonials-schema";
import TestimonialsAdminClient from "./TestimonialsAdminClient";

export default async function AdminTestimonialsPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  await seedTestimonialsIfEmpty();

  const rows = await testimonialsDb
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.createdAt));

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <a
          href="/"
          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          &larr; Back to site
        </a>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Testimonials</h1>
        <span className="text-sm text-neutral-400">
          {rows.length} total &bull; {rows.filter((r) => r.featured).length}{" "}
          featured
        </span>
      </div>
      <TestimonialsAdminClient initialTestimonials={rows} />
    </main>
  );
}
