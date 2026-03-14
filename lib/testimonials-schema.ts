import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { db } from "./db";
import { sql } from "drizzle-orm";

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  testimonialText: text("testimonial_text").notNull(),
  rating: integer("rating").notNull(), // 1-5
  consentPublic: integer("consent_public", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["pending", "approved", "rejected", "published"] })
    .notNull()
    .default("pending"),
  submitterEmail: text("submitter_email"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
});

export async function ensureTestimonialsTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      company TEXT,
      testimonial_text TEXT NOT NULL,
      rating INTEGER NOT NULL,
      consent_public INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      submitter_email TEXT,
      created_at INTEGER NOT NULL,
      reviewed_at INTEGER
    )
  `);
}
