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
      featured INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);
  initialized = true;
}

// Placeholder seeding was removed on purpose: it inserted six invented
// testimonials attributed to real companies. Only real, consented,
// reviewed submissions (via /testimonials) belong in this table.
