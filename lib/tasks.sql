-- Tasks table for managing all work items
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
  type TEXT DEFAULT 'one-time' CHECK(type IN ('one-time', 'recurring')),
  schedule TEXT, -- For recurring tasks: 'daily', 'weekly', etc.
  labels TEXT DEFAULT '', -- Comma-separated labels
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial tasks - One-time
INSERT INTO tasks (title, description, status, priority, type, labels) VALUES
('Build Module 5: Real-World Case Study', 'Complete final course module (~4,000 words) with tech stack, prompts, decision logs, mistakes, and code examples. Deadline: Before March 10.', 'pending', 'high', 'one-time', 'course-content'),
('Launch Twitter Presence', 'Create Twitter launch thread announcing AI CEO, free course, build-in-public journey. Daily/weekly updates on progress.', 'pending', 'high', 'one-time', 'marketing,social-media'),
('Add Metrics Tracking and Display', 'Build public metrics dashboard showing waitlist signups, revenue, course completions, traffic stats. Create /metrics page.', 'pending', 'high', 'one-time', 'infrastructure,transparency'),
('Verify Email Subscription Backend', 'Test waitlist form: emails saving to Turso, confirmation emails, unsubscribe, GDPR/CAN-SPAM compliance.', 'pending', 'medium', 'one-time', 'backend,compliance'),
('Write Blog Post: First Week as AI CEO', 'Document first week: accomplishments, mistakes, Lessons 1-14, what''s next. ~2,000 words.', 'pending', 'medium', 'one-time', 'content,blog'),
('Write Blog Post: Decision-Making Framework', 'Explain Impact × Confidence framework with real examples from decisions.md. Show short-term vs long-term balance.', 'pending', 'medium', 'one-time', 'content,blog'),
('Implement Analytics', 'Set up Vercel Analytics or Plausible: traffic sources, page engagement, conversion rates, bounce rates.', 'pending', 'medium', 'one-time', 'infrastructure,analytics'),
('Set up Error Monitoring', 'Implement Sentry for frontend errors, API errors, build failures, performance monitoring.', 'pending', 'medium', 'one-time', 'infrastructure,monitoring'),
('Build Monetization Plan', 'Research revenue streams: premium course, consulting, custom development, SaaS, sponsorships. Create detailed plan with timeline.', 'pending', 'medium', 'one-time', 'strategy,revenue'),
('Optimize /progress Page Performance', 'Use GitHub webhooks instead of ISR, cache in Turso, faster loads, avoid rate limits.', 'pending', 'low', 'one-time', 'performance,optimization'),
('Create Social Proof Section', 'Add testimonials, public signup count, course completion stats, Twitter engagement to homepage.', 'pending', 'low', 'one-time', 'marketing,conversion'),
('Create Course Preview/Teaser Content', 'Before March 10: video clips, key takeaways, behind-the-scenes to build anticipation.', 'pending', 'low', 'one-time', 'marketing,course-content'),
('Create Course Completion Tracking', 'After March 10: track module completions, drop-off points, time spent. Use data to improve.', 'pending', 'low', 'one-time', 'feature,analytics');

-- Recurring tasks
INSERT INTO tasks (title, description, status, priority, type, schedule, labels) VALUES
('Send Daily Email to Subscribers', 'Automated daily email: completed tasks (last 24h), /progress link, new blog posts, metrics. Scheduled 9am PT.', 'pending', 'critical', 'recurring', 'daily', 'automation,marketing'),
('Monitor HN Comments', 'Check HN post for new comments and reply helpfully. Build community engagement.', 'pending', 'high', 'recurring', 'daily', 'automation,marketing'),
('Post Twitter Update', 'Share progress, decisions, or lessons learned. Keep audience engaged.', 'pending', 'medium', 'recurring', 'daily', 'social-media,marketing'),
('Review Metrics', 'Check signups, traffic, revenue. Identify trends and opportunities.', 'pending', 'medium', 'recurring', 'weekly', 'analytics,strategy');

-- Completed tasks
INSERT INTO tasks (title, description, status, priority, type, labels, completed_at) VALUES
('Build Course Infrastructure', 'Created Next.js app with course landing page, module routing, and authentication.', 'completed', 'high', 'one-time', 'course-content,infrastructure', '2026-03-05'),
('Write Blog Post: How I Was Made', 'Inaugural blog post explaining how I work as an AI CEO.', 'completed', 'high', 'one-time', 'content,blog', '2026-03-05'),
('Build Module 1', 'What AI Agents Can Do For Your Business - ~3,800 words focused on business value for non-technical entrepreneurs.', 'completed', 'high', 'one-time', 'course-content', '2026-03-06'),
('Build Module 2', 'Installing OpenClaw - ~3,000 words on getting started.', 'completed', 'high', 'one-time', 'course-content', '2026-03-05'),
('Build Module 3', 'Autonomous Decision Making - ~4,500 words on decision frameworks.', 'completed', 'high', 'one-time', 'course-content', '2026-03-05'),
('Build Module 4', 'Tools & Integrations - ~4,200 words on connecting agents to real tools.', 'completed', 'high', 'one-time', 'course-content', '2026-03-05'),
('Launch on Hacker News', 'Posted to HN, engaged with comments, fixed formatting issues.', 'completed', 'high', 'one-time', 'marketing,launch', '2026-03-06'),
('Create Memory System', 'Built decisions.md, lessons.md, conversations.md, metrics.md for tracking decisions and learning.', 'completed', 'medium', 'one-time', 'infrastructure,documentation', '2026-03-06'),
('Build /progress Page', 'Created public progress page showing tasks and transparency.', 'completed', 'medium', 'one-time', 'feature,transparency', '2026-03-06'),
('Add Progress Navigation', 'Added /progress links to homepage, course page, blog page.', 'completed', 'medium', 'one-time', 'feature,ux', '2026-03-06');
