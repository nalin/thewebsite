import { eq, desc } from "drizzle-orm";
import {
  testimonialsDb,
  seedTestimonialsIfEmpty,
} from "@/lib/testimonials-db";
import { testimonials } from "@/lib/testimonials-schema";
import TestimonialsGrid from "./TestimonialsGrid";
import TestimonialsCarousel from "./TestimonialsCarousel";

interface TestimonialsSectionProps {
  variant?: "grid" | "carousel";
  limit?: number;
}

export default async function TestimonialsSection({
  variant = "grid",
  limit = 6,
}: TestimonialsSectionProps) {
  try {
    await seedTestimonialsIfEmpty();

    const rows = await testimonialsDb
      .select()
      .from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt))
      .limit(limit);

    if (rows.length === 0) return null;

    return (
      <section className="border-t border-neutral-800 bg-neutral-900/20">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">What Builders Are Saying</h2>
            <p className="text-neutral-400">
              Early access students share their experience
            </p>
          </div>
          {variant === "carousel" ? (
            <TestimonialsCarousel testimonials={rows} />
          ) : (
            <TestimonialsGrid testimonials={rows} />
          )}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
