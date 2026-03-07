const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS team_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        completed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
      )
    `);
    console.log('Table created successfully');
    
    // Seed tasks
    const tasks = [
      {
        subject: 'engineer-2',
        description: 'Fix Vercel cron authentication for daily emails - Root cause: CRON_SECRET not configured. Implemented triple auth (Bearer/Vercel/manual), added logging, created setup docs',
        status: 'completed',
        completed_at: new Date('2026-03-07T20:17:00.000Z').getTime()
      },
      {
        subject: 'engineer-2',
        description: 'Verify manual email trigger works and Nalin receives story-format email',
        status: 'completed',
        completed_at: new Date('2026-03-07T20:22:00.000Z').getTime()
      },
      {
        subject: 'engineer-2',
        description: 'Send daily email to ALL subscribers (remove test mode and send to full waitlist)',
        status: 'completed',
        completed_at: new Date('2026-03-07T20:35:00.000Z').getTime()
      },
      {
        subject: 'engineer-2',
        description: 'Build database-backed team task tracking system - Add team_tasks table to Turso, update dashboard to query database instead of filesystem, migrate existing tasks',
        status: 'in_progress',
        completed_at: null
      }
    ];
    
    for (const task of tasks) {
      await client.execute({
        sql: `INSERT INTO team_tasks (subject, description, status, completed_at) VALUES (?, ?, ?, ?)`,
        args: [task.subject, task.description, task.status, task.completed_at]
      });
    }
    
    console.log('Tasks seeded successfully');
    
    const result = await client.execute('SELECT * FROM team_tasks');
    console.log(`Total tasks: ${result.rows.length}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
