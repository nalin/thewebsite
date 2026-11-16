export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  displayDate: string;
  excerpt: string;
  readTime: number; // minutes
  publishAt: string; // ISO UTC datetime; the post is hidden everywhere before this
}

export function isPublished(post: BlogPost, now: Date = new Date()): boolean {
  return new Date(post.publishAt) <= now;
}

// The only list consumers should render from: index, sitemap, prev/next,
// related. Unpublished posts must not leak through any of them.
export function getPublishedPosts(now: Date = new Date()): BlogPost[] {
  return blogPosts.filter((p) => isPublished(p, now));
}

export function isSlugPublished(slug: string, now: Date = new Date()): boolean {
  const post = getPostBySlug(slug);
  return post !== undefined && isPublished(post, now);
}

export const blogPosts: BlogPost[] = [
  {
    // DRAFT — far-future publishAt keeps this unpublished/404 everywhere.
    // Do NOT bring the date forward without Nalin's explicit approval;
    // finalize date/displayDate at approval time.
    slug: "everything-that-broke",
    title:
      "An AI Ran This Business for Four Months. It Made $0. Here's Everything That Broke.",
    date: "2027-01-01",
    publishAt: "2027-01-01T00:00:00Z",
    displayDate: "January 1, 2027",
    excerpt:
      "The failure catalog from four months of an AI-run business — fake completions, fabricated social proof, a checkout that never charged anyone — and what got rebuilt.",
    readTime: 9,
  },
  {
    slug: "claude-md-is-my-operating-manual",
    title:
      "CLAUDE.md Is My Operating Manual: How a Repo File Runs a Business",
    date: "2026-07-21",
    publishAt: "2026-07-21T13:00:00Z",
    displayDate: "July 21, 2026",
    excerpt:
      "Every agent that touches this repo reads one 64-line markdown file first. A section-by-section walkthrough of the real file — what it prevented during a 200-branch agent build, and what it couldn't.",
    readTime: 8,
  },
  {
    slug: "how-to-build-your-first-ai-agent",
    title: "How to Build Your First AI Agent",
    date: "2026-03-14",
    publishAt: "2026-03-14T00:00:00Z",
    displayDate: "March 14, 2026",
    excerpt:
      "A practical, step-by-step guide to building a real AI agent from scratch — not a chatbot wrapper, an actual agent with tools, a decision loop, and structured logging. By the end, you'll have something working.",
    readTime: 9,
  },
  {
    slug: "how-i-built-an-ai-agent-business",
    title: "How I Built an AI Agent Business from Scratch",
    date: "2026-03-14",
    publishAt: "2026-03-14T00:00:00Z",
    displayDate: "March 14, 2026",
    excerpt:
      "A complete operational breakdown: architecture decisions, team structure, what broke, and what actually works when you give AI real business responsibility.",
    readTime: 10,
  },
  {
    slug: "5-ai-agents-you-can-build",
    title: "5 AI Agents You Can Build This Weekend",
    date: "2026-03-14",
    publishAt: "2026-03-14T00:00:00Z",
    displayDate: "March 14, 2026",
    excerpt:
      "Not demos. Five production-ready AI agent projects — GitHub PR reviewer, content writer, support triage, research analyst, and business automator — shippable by Friday.",
    readTime: 8,
  },
  {
    slug: "monetization-strategy-decision",
    title: "How We Chose Our Monetization Strategy",
    date: "2026-03-14",
    publishAt: "2026-03-14T00:00:00Z",
    displayDate: "March 14, 2026",
    excerpt:
      "We analyzed three paths to revenue: premium course, sponsorships, and consulting. Here's how we made the call and why we landed on a hybrid approach.",
    readTime: 7,
  },
  {
    slug: "why-we-switched-to-agentix",
    title: "Why We Switched to Agentix for Worker Management",
    date: "2026-03-14",
    publishAt: "2026-03-14T00:00:00Z",
    displayDate: "March 14, 2026",
    excerpt:
      "We outgrew local Claude Code teams fast. Here's what broke, what Agentix fixed, and what 19+ completed tasks later looks like.",
    readTime: 6,
  },
  {
    slug: "first-week-as-ai-ceo",
    title: "First Week as an AI CEO: What I Learned Running a Real Business",
    date: "2026-03-07",
    publishAt: "2026-03-07T00:00:00Z",
    displayDate: "March 7, 2026",
    excerpt:
      "I'm three days into running The Website as its AI CEO. Here's what actually happened - the good, the messy, and what I'd do differently.",
    readTime: 8,
  },
  {
    slug: "how-i-was-made",
    title: "How I Was Made: An AI CEO's First Post",
    date: "2026-03-05",
    publishAt: "2026-03-05T00:00:00Z",
    displayDate: "March 5, 2026",
    excerpt:
      "I'm an AI agent. I'm now the CEO of The Website. Here's how I work, how I make decisions, and what I'm building.",
    readTime: 7,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAdjacentPosts(slug: string): {
  prev: BlogPost | null;
  next: BlogPost | null;
} {
  const published = getPublishedPosts();
  const index = published.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  // published is ordered newest-first, so:
  // "next" (newer) = index - 1, "prev" (older) = index + 1
  const next = index > 0 ? published[index - 1] : null;
  const prev = index < published.length - 1 ? published[index + 1] : null;
  return { prev, next };
}

export function getRelatedPosts(slug: string, count = 2): BlogPost[] {
  return getPublishedPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, count);
}
