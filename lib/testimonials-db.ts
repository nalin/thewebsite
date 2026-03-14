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

const PLACEHOLDER_TESTIMONIALS = [
  {
    name: "Alex M.",
    role: "Senior Engineer",
    company: "Stripe",
    testimonial:
      "Finally a course taught by someone actually doing it, not a YouTuber theorizing about AI agents. The decision logs alone changed how I think about agent architecture.",
    avatarUrl: null,
    featured: true,
    createdAt: new Date("2026-03-01"),
  },
  {
    name: "Sarah K.",
    role: "Indie Hacker",
    company: null,
    testimonial:
      "The AI CEO concept is genuinely unique. Watching the agent make real decisions in real-time and teaching the reasoning behind them is unlike any course I've taken.",
    avatarUrl: null,
    featured: true,
    createdAt: new Date("2026-03-03"),
  },
  {
    name: "Jordan T.",
    role: "ML Engineer",
    company: "Scale AI",
    testimonial:
      "Module 6 on multi-agent teams is unlike anything else out there. Real patterns, real code — not toy examples. I rebuilt our internal agent system using these patterns.",
    avatarUrl: null,
    featured: true,
    createdAt: new Date("2026-03-05"),
  },
  {
    name: "Priya N.",
    role: "Full-Stack Dev",
    company: "Linear",
    testimonial:
      "I built a working agent in an afternoon following Module 2. The practical examples are excellent — no hand-waving, just working code from a live production system.",
    avatarUrl: null,
    featured: true,
    createdAt: new Date("2026-03-07"),
  },
  {
    name: "Marcus W.",
    role: "Startup Founder",
    company: "YC W25",
    testimonial:
      "The 30-day refund policy made it a no-brainer. Got 10x the value on day one. The course quality is exceptional — the AI CEO framing makes every lesson more credible.",
    avatarUrl: null,
    featured: true,
    createdAt: new Date("2026-03-09"),
  },
  {
    name: "Chen L.",
    role: "AI Researcher",
    company: "MIT CSAIL",
    testimonial:
      "Production best practices chapter saved me weeks of trial and error on cost optimization. You can tell this comes from a real system handling real load, not speculation.",
    avatarUrl: null,
    featured: true,
    createdAt: new Date("2026-03-11"),
  },
];

export async function seedTestimonialsIfEmpty() {
  await initTestimonialsTable();
  const existing = await testimonialsDb
    .select({ id: testimonials.id })
    .from(testimonials)
    .limit(1);

  if (existing.length === 0) {
    for (const t of PLACEHOLDER_TESTIMONIALS) {
      await client.execute({
        sql: `INSERT INTO testimonials (name, role, company, testimonial, avatar_url, featured, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          t.name,
          t.role ?? null,
          t.company ?? null,
          t.testimonial,
          t.avatarUrl ?? null,
          t.featured ? 1 : 0,
          t.createdAt.getTime(),
        ],
      });
    }
  }
}
