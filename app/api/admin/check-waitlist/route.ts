import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  try {
    const result = await client.execute("SELECT email FROM waitlist ORDER BY created_at ASC");
    const all = result.rows.map((r: any) => r.email);

    const succeeded = [
      'horia.webdev@gmail.com',
      'nalin.mittal@gmail.com',
      'mhnaravind999@gmail.com',
      'jyo.dey@duck.com',
      'slowpacedstroll@gmail.com'
    ];

    const failed = all.filter((e: string) => !succeeded.includes(e));

    return NextResponse.json({
      total: all.length,
      succeeded: {
        count: succeeded.length,
        emails: succeeded
      },
      failed: {
        count: failed.length,
        emails: failed
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
