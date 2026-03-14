import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  testimonial: text("testimonial").notNull(),
  avatarUrl: text("avatar_url"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
