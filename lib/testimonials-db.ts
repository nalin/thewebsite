import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { testimonials } from "./testimonials-schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const testimonialsDb = drizzle(client, { schema: { testimonials } });

let initialized = false;

export async function initTestimonialsTable() {
  if (initialized) return;
  await client.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      company TEXT,
      testimonial TEXT NOT NULL,
      avatar_url TEXT,
      rating INTEGER,
      consent INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);
  // Existing prod tables predate rating/consent; add them if missing. SQLite
  // throws on a duplicate column — expected after the first run, so swallow.
  for (const alter of [
    "ALTER TABLE testimonials ADD COLUMN rating INTEGER",
    "ALTER TABLE testimonials ADD COLUMN consent INTEGER NOT NULL DEFAULT 0",
  ]) {
    try {
      await client.execute(alter);
    } catch {
      // column already present
    }
  }
  // PII is isolated here so it can never leak through a select() on the public
  // testimonials table. Email is stored for admin follow-up; never rendered.
  await client.execute(`
    CREATE TABLE IF NOT EXISTS testimonial_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      testimonial_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  initialized = true;
}

// Record a submitter's contact email in the PII-isolated table. No-op for a
// blank email. Never logs the address.
export async function recordSubmitterEmail(
  testimonialId: number,
  email: string
): Promise<void> {
  const clean = email.trim().toLowerCase().slice(0, 254);
  if (!clean || !clean.includes("@")) return;
  await client.execute({
    sql: "INSERT INTO testimonial_contacts (testimonial_id, email, created_at) VALUES (?, ?, ?)",
    args: [testimonialId, clean, Date.now()],
  });
}

// Placeholder seeding was removed on purpose: it inserted six invented
// testimonials attributed to real companies. Only real, consented,
// reviewed submissions (via /testimonials) belong in this table.
