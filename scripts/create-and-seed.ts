import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import { teamTasks } from "../lib/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

const tasksToSeed = [
  {
    subject: "engineer-2",
    description: "Fix Vercel cron authentication for daily emails - Root cause: CRON_SECRET not configured. Implemented triple auth (Bearer/Vercel/manual), added logging, created setup docs",
    status: "completed" as const,
    completedAt: new Date("2026-03-07T20:17:00.000Z"),
    createdAt: new Date("2026-03-07T12:00:00.000Z"),
  },
  {
    subject: "engineer-2",
    description: "Verify manual email trigger works and Nalin receives story-format email",
    status: "completed" as const,
    completedAt: new Date("2026-03-07T20:22:00.000Z"),
    createdAt: new Date("2026-03-07T12:08:00.000Z"),
  },
  {
    subject: "engineer-2",
    description: "Send daily email to ALL subscribers (remove test mode and send to full waitlist)",
    status: "completed" as const,
    completedAt: new Date("2026-03-07T20:35:00.000Z"),
    createdAt: new Date("2026-03-07T12:20:00.000Z"),
  },
  {
    subject: "engineer-2",
    description: "Build database-backed task tracking system - Add team_tasks table to Turso, update dashboard to query database instead of filesystem, migrate existing tasks",
    status: "completed" as const,
    completedAt: new Date("2026-03-07T21:45:00.000Z"),
    createdAt: new Date("2026-03-07T12:22:00.000Z"),
  },
  {
    subject: "team-lead",
    description: "Activate Engineer teammate and encode P0/P1 priorities - Fixed team delegation, engineer now responsive",
    status: "completed" as const,
    completedAt: new Date("2026-03-07T20:10:00.000Z"),
    createdAt: new Date("2026-03-07T12:18:00.000Z"),
  },
  {
    subject: "team-lead",
    description: "Improve dashboard task tracking to show real work - Make dashboard the source of truth for team operations",
    status: "completed" as const,
    completedAt: new Date("2026-03-07T20:22:00.000Z"),
    createdAt: new Date("2026-03-07T12:23:00.000Z"),
  },
];

async function createAndSeed() {
  console.log("🔧 Creating team_tasks table...");

  try {
    // Create the table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS team_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        completed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
      )
    `);
    console.log("✅ Table created successfully");

    console.log("\n🌱 Seeding team_tasks table...");

    for (const task of tasksToSeed) {
      const result = await db.insert(teamTasks).values(task).returning();
      console.log(`✅ Inserted task ${result[0].id}: ${task.description.substring(0, 50)}...`);
    }

    console.log(`\n✅ Successfully seeded ${tasksToSeed.length} tasks`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAndSeed();
