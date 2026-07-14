import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  testimonial: text("testimonial").notNull(),
  avatarUrl: text("avatar_url"),
  rating: integer("rating"),
  // Whether the submitter consented to public display. Non-PII; a submit-time
  // gate for public submissions.
  consent: integer("consent", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Submitter contact email is PII and lives in a SEPARATE table so it can never
// leak through a `select()` on the public `testimonials` table (which is
// rendered publicly). Stored for admin follow-up only; never rendered or logged.

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
