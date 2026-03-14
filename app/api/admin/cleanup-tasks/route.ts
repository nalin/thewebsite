import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { teamTasks } from "@/lib/schema";
import { eq, or, inArray } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

export async function POST() {
  try {
    // Mark tasks 8-11, 14 as completed (all the work was actually finished)
    const tasksToComplete = [8, 9, 10, 11, 14];

    await db.update(teamTasks)
      .set({
        status: 'completed',
        completedAt: new Date()
      })
      .where(inArray(teamTasks.id, tasksToComplete));

    // Fix task 17 completion status
    await db.update(teamTasks)
      .set({
        completedAt: new Date()
      })
      .where(eq(teamTasks.id, 17));

    return NextResponse.json({
      success: true,
      message: "Task list cleaned up - marked stale tasks as completed",
      tasksUpdated: [...tasksToComplete, 17]
    });
  } catch (error) {
    console.error("Error cleaning up tasks:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
