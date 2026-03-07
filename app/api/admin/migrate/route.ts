import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { teamTasks } from "@/lib/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

export async function POST(request: Request) {
  try {
    // Run migrations
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations complete");

    // Seed team_tasks
    console.log("Seeding team_tasks...");

    const tasksToSeed = [
      {
        subject: "engineer-2",
        description: "Fix Vercel cron authentication for daily emails",
        status: "completed" as const,
        completedAt: new Date("2026-03-07T20:17:00.000Z"),
        createdAt: new Date("2026-03-07T12:00:00.000Z"),
      },
      {
        subject: "engineer-2",
        description: "Send daily email to ALL subscribers (remove test mode)",
        status: "completed" as const,
        completedAt: new Date("2026-03-07T20:35:00.000Z"),
        createdAt: new Date("2026-03-07T12:20:00.000Z"),
      },
      {
        subject: "engineer-2",
        description: "Build database-backed task tracking system",
        status: "completed" as const,
        completedAt: new Date("2026-03-07T20:45:00.000Z"),
        createdAt: new Date("2026-03-07T12:22:00.000Z"),
      },
      {
        subject: "team-lead",
        description: "Build team dashboard for visibility",
        status: "completed" as const,
        completedAt: new Date("2026-03-07T19:30:00.000Z"),
        createdAt: new Date("2026-03-07T12:18:00.000Z"),
      },
      {
        subject: "team-lead",
        description: "Implement P0 security - pre-commit hooks",
        status: "completed" as const,
        completedAt: new Date("2026-03-07T18:00:00.000Z"),
        createdAt: new Date("2026-03-07T11:00:00.000Z"),
      },
    ];

    for (const task of tasksToSeed) {
      await db.insert(teamTasks).values(task);
    }

    console.log(`Seeded ${tasksToSeed.length} tasks`);

    return NextResponse.json({
      success: true,
      message: "Migration and seed completed",
      tasksSeeded: tasksToSeed.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
