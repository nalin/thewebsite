import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { teamTasks } from "@/lib/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

export async function POST() {
  try {
    await db.update(teamTasks)
      .set({
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(teamTasks.id, 6));

    return NextResponse.json({
      success: true,
      message: "Task #6 marked as completed"
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
