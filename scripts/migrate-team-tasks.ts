import { createClient } from "@libsql/client";

// This script creates the team_tasks table and seeds it with completed tasks from today

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log("Creating team_tasks table...");

  // Create team_tasks table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS team_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
      completed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
    )
  `);

  console.log("✓ Table created");
  console.log("Seeding completed tasks from today...");

  const completedTasks = [
    {
      subject: "engineer-2",
      description: "Fix Vercel cron authentication for daily emails",
      status: "completed",
      completedAt: new Date("2026-03-07T20:17:00.000Z").getTime(),
    },
    {
      subject: "engineer-2",
      description: "Send email to all waitlist subscribers",
      status: "completed",
      completedAt: new Date("2026-03-07T20:35:00.000Z").getTime(),
    },
    {
      subject: "team-lead",
      description: "Build team dashboard for visibility",
      status: "completed",
      completedAt: new Date("2026-03-07T19:30:00.000Z").getTime(),
    },
    {
      subject: "team-lead",
      description: "Implement P0 security - pre-commit hooks",
      status: "completed",
      completedAt: new Date("2026-03-07T18:00:00.000Z").getTime(),
    },
    {
      subject: "engineer-2",
      description: "Build database-backed task tracking system",
      status: "in_progress",
      completedAt: null,
    },
  ];

  for (const task of completedTasks) {
    await client.execute({
      sql: `INSERT INTO team_tasks (subject, description, status, completed_at) VALUES (?, ?, ?, ?)`,
      args: [task.subject, task.description, task.status, task.completedAt],
    });
  }

  console.log(`✓ Seeded ${completedTasks.length} tasks`);
  console.log("\nDone! Dashboard should now show task data in production.");

  process.exit(0);
}

migrate().catch((err) => {
  console.error("Error running migration:", err);
  process.exit(1);
});
