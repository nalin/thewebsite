import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { teamTasks } from "../lib/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

async function completeTask() {
  console.log("Marking task #6 as completed...");

  await db.update(teamTasks)
    .set({
      status: 'completed',
      completedAt: new Date()
    })
    .where(eq(teamTasks.id, 6));

  console.log("✅ Task #6 marked as completed");
  process.exit(0);
}

completeTask().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
