import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  console.log("Creating tasks table...");

  // Create table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
      type TEXT DEFAULT 'one-time' CHECK(type IN ('one-time', 'recurring')),
      schedule TEXT,
      labels TEXT DEFAULT '',
      completed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  console.log("Seeding tasks...");

  const tasks = [
    // Recurring - Critical
    {
      title: "Send Daily Email to Subscribers",
      description:
        "Automated daily email: completed tasks (last 24h), /progress link, new blog posts, metrics. Scheduled 9am PT.",
      priority: "critical",
      type: "recurring",
      schedule: "daily",
      labels: "automation,marketing",
    },
    // One-time - High Priority
    {
      title: "Build Module 5: Real-World Case Study",
      description:
        "Complete final course module (~4,000 words) with tech stack, prompts, decision logs, mistakes, and code examples. Deadline: Before March 10.",
      priority: "high",
      type: "one-time",
      labels: "course-content",
    },
    {
      title: "Launch Twitter Presence",
      description:
        "Create Twitter launch thread announcing AI CEO, free course, build-in-public journey. Daily/weekly updates on progress.",
      priority: "high",
      type: "one-time",
      labels: "marketing,social-media",
    },
    {
      title: "Add Metrics Tracking and Display",
      description:
        "Build public metrics dashboard showing waitlist signups, revenue, course completions, traffic stats. Create /metrics page.",
      priority: "high",
      type: "one-time",
      labels: "infrastructure,transparency",
    },
    // Recurring - High
    {
      title: "Monitor HN Comments",
      description: "Check HN post for new comments and reply helpfully. Build community engagement.",
      priority: "high",
      type: "recurring",
      schedule: "daily",
      labels: "automation,marketing",
    },
    // One-time - Medium
    {
      title: "Verify Email Subscription Backend",
      description:
        "Test waitlist form: emails saving to Turso, confirmation emails, unsubscribe, GDPR/CAN-SPAM compliance.",
      priority: "medium",
      type: "one-time",
      labels: "backend,compliance",
    },
    {
      title: "Write Blog Post: First Week as AI CEO",
      description:
        "Document first week: accomplishments, mistakes, Lessons 1-14, what's next. ~2,000 words.",
      priority: "medium",
      type: "one-time",
      labels: "content,blog",
    },
    {
      title: "Write Blog Post: Decision-Making Framework",
      description:
        "Explain Impact × Confidence framework with real examples from decisions.md. Show short-term vs long-term balance.",
      priority: "medium",
      type: "one-time",
      labels: "content,blog",
    },
    {
      title: "Implement Analytics",
      description:
        "Set up Vercel Analytics or Plausible: traffic sources, page engagement, conversion rates, bounce rates.",
      priority: "medium",
      type: "one-time",
      labels: "infrastructure,analytics",
    },
    {
      title: "Set up Error Monitoring",
      description:
        "Implement Sentry for frontend errors, API errors, build failures, performance monitoring.",
      priority: "medium",
      type: "one-time",
      labels: "infrastructure,monitoring",
    },
    {
      title: "Build Monetization Plan",
      description:
        "Research revenue streams: premium course, consulting, custom development, SaaS, sponsorships. Create detailed plan with timeline.",
      priority: "medium",
      type: "one-time",
      labels: "strategy,revenue",
    },
    // Recurring - Medium
    {
      title: "Post Twitter Update",
      description: "Share progress, decisions, or lessons learned. Keep audience engaged.",
      priority: "medium",
      type: "recurring",
      schedule: "daily",
      labels: "social-media,marketing",
    },
    {
      title: "Review Metrics",
      description: "Check signups, traffic, revenue. Identify trends and opportunities.",
      priority: "medium",
      type: "recurring",
      schedule: "weekly",
      labels: "analytics,strategy",
    },
    // One-time - Low
    {
      title: "Optimize /progress Page Performance",
      description:
        "Use GitHub webhooks instead of ISR, cache in Turso, faster loads, avoid rate limits.",
      priority: "low",
      type: "one-time",
      labels: "performance,optimization",
    },
    {
      title: "Create Social Proof Section",
      description:
        "Add testimonials, public signup count, course completion stats, Twitter engagement to homepage.",
      priority: "low",
      type: "one-time",
      labels: "marketing,conversion",
    },
    {
      title: "Create Course Preview/Teaser Content",
      description:
        "Before March 10: video clips, key takeaways, behind-the-scenes to build anticipation.",
      priority: "low",
      type: "one-time",
      labels: "marketing,course-content",
    },
  ];

  // Insert tasks
  for (const task of tasks) {
    await client.execute({
      sql: `INSERT INTO tasks (title, description, priority, type, schedule, labels) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [task.title, task.description, task.priority, task.type, task.schedule || null, task.labels],
    });
  }

  // Insert completed tasks
  const completedTasks = [
    {
      title: "Build Course Infrastructure",
      description:
        "Created Next.js app with course landing page, module routing, and authentication.",
      priority: "high",
      labels: "course-content,infrastructure",
      completedAt: new Date("2026-03-05").getTime(),
    },
    {
      title: "Write Blog Post: How I Was Made",
      description: "Inaugural blog post explaining how I work as an AI CEO.",
      priority: "high",
      labels: "content,blog",
      completedAt: new Date("2026-03-05").getTime(),
    },
    {
      title: "Build Module 1",
      description:
        "What AI Agents Can Do For Your Business - ~3,800 words focused on business value for non-technical entrepreneurs.",
      priority: "high",
      labels: "course-content",
      completedAt: new Date("2026-03-06").getTime(),
    },
    {
      title: "Build Module 2",
      description: "Installing OpenClaw - ~3,000 words on getting started.",
      priority: "high",
      labels: "course-content",
      completedAt: new Date("2026-03-05").getTime(),
    },
    {
      title: "Build Module 3",
      description: "Autonomous Decision Making - ~4,500 words on decision frameworks.",
      priority: "high",
      labels: "course-content",
      completedAt: new Date("2026-03-05").getTime(),
    },
    {
      title: "Build Module 4",
      description: "Tools & Integrations - ~4,200 words on connecting agents to real tools.",
      priority: "high",
      labels: "course-content",
      completedAt: new Date("2026-03-05").getTime(),
    },
    {
      title: "Launch on Hacker News",
      description: "Posted to HN, engaged with comments, fixed formatting issues.",
      priority: "high",
      labels: "marketing,launch",
      completedAt: new Date("2026-03-06").getTime(),
    },
    {
      title: "Create Memory System",
      description:
        "Built decisions.md, lessons.md, conversations.md, metrics.md for tracking decisions and learning.",
      priority: "medium",
      labels: "infrastructure,documentation",
      completedAt: new Date("2026-03-06").getTime(),
    },
    {
      title: "Build /progress Page",
      description: "Created public progress page showing tasks and transparency.",
      priority: "medium",
      labels: "feature,transparency",
      completedAt: new Date("2026-03-06").getTime(),
    },
    {
      title: "Add Progress Navigation",
      description: "Added /progress links to homepage, course page, blog page.",
      priority: "medium",
      labels: "feature,ux",
      completedAt: new Date("2026-03-06").getTime(),
    },
  ];

  for (const task of completedTasks) {
    await client.execute({
      sql: `INSERT INTO tasks (title, description, status, priority, type, labels, completed_at) VALUES (?, ?, 'completed', ?, 'one-time', ?, ?)`,
      args: [task.title, task.description, task.priority, task.labels, task.completedAt],
    });
  }

  console.log("✓ Seeded tasks successfully!");
  console.log(`  - ${tasks.length} pending/recurring tasks`);
  console.log(`  - ${completedTasks.length} completed tasks`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
