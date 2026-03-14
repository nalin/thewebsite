import { createClient } from "@libsql/client";

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function ensureProgressTable() {
  const client = getClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS course_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_email TEXT,
      module_id INTEGER NOT NULL,
      completed_at INTEGER NOT NULL,
      time_spent INTEGER NOT NULL DEFAULT 0
    )
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_course_progress_session
    ON course_progress(session_id)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_course_progress_module
    ON course_progress(module_id)
  `);
}

export async function recordProgress(
  sessionId: string,
  moduleId: number,
  timeSpent: number,
  userEmail?: string
) {
  const client = getClient();
  await ensureProgressTable();

  const existing = await client.execute({
    sql: `SELECT id, time_spent FROM course_progress WHERE session_id = ? AND module_id = ?`,
    args: [sessionId, moduleId],
  });

  if (existing.rows.length > 0) {
    await client.execute({
      sql: `UPDATE course_progress SET time_spent = time_spent + ?, completed_at = ? WHERE session_id = ? AND module_id = ?`,
      args: [timeSpent, Date.now(), sessionId, moduleId],
    });
  } else {
    await client.execute({
      sql: `INSERT INTO course_progress (session_id, user_email, module_id, completed_at, time_spent) VALUES (?, ?, ?, ?, ?)`,
      args: [sessionId, userEmail ?? null, moduleId, Date.now(), timeSpent],
    });
  }
}

export interface ModuleAnalytics {
  module_id: number;
  unique_students: number;
  avg_time_spent: number;
  total_completions: number;
}

export interface CourseAnalytics {
  totalStudents: number;
  moduleStats: ModuleAnalytics[];
  recentActivity: Array<{ module_id: number; completed_at: number; time_spent: number }>;
}

export async function getAnalytics(): Promise<CourseAnalytics> {
  const client = getClient();
  await ensureProgressTable();

  const totalResult = await client.execute(`
    SELECT COUNT(DISTINCT session_id) as count FROM course_progress
  `);
  const totalStudents = Number((totalResult.rows[0] as { count: number | bigint }).count) || 0;

  const moduleResult = await client.execute(`
    SELECT
      module_id,
      COUNT(DISTINCT session_id) as unique_students,
      CAST(AVG(time_spent) AS INTEGER) as avg_time_spent,
      COUNT(*) as total_completions
    FROM course_progress
    GROUP BY module_id
    ORDER BY module_id ASC
  `);

  const recentResult = await client.execute(`
    SELECT module_id, completed_at, time_spent
    FROM course_progress
    ORDER BY completed_at DESC
    LIMIT 50
  `);

  return {
    totalStudents,
    moduleStats: moduleResult.rows as unknown as ModuleAnalytics[],
    recentActivity: recentResult.rows as unknown as Array<{
      module_id: number;
      completed_at: number;
      time_spent: number;
    }>,
  };
}
