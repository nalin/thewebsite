import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teamTasks } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const { subject, description, status, completedAt } = await request.json();

    const result = await db.insert(teamTasks).values({
      subject,
      description,
      status,
      completedAt: completedAt ? new Date(completedAt) : null,
    }).returning();

    return NextResponse.json({ success: true, task: result[0] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasks = await db.select().from(teamTasks);
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
