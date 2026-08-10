import { execSync } from 'child_process';
import { getPublishedPosts } from './blog';

export interface Accomplishment {
  type: 'commit' | 'blog';
  description: string;
  timestamp?: Date;
}

/**
 * Get git commits from today (not yesterday)
 * We send emails in the evening showing what we accomplished today
 */
function getTodaysCommits(): Accomplishment[] {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const sinceDate = today.toISOString().split('T')[0];
    const untilDate = tomorrow.toISOString().split('T')[0];

    const commits = execSync(
      `git log --since="${sinceDate}" --until="${untilDate}" --pretty=format:"%s" --no-merges`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    );

    if (!commits.trim()) {
      return [];
    }

    return commits
      .split('\n')
      .filter(line => line.trim())
      .map(commit => ({
        type: 'commit' as const,
        description: commit.trim(),
      }));
  } catch (error) {
    console.error('Error fetching git commits:', error);
    return [];
  }
}

/**
 * Blog posts that went live in the last 24 hours, per the registry's
 * publishAt. Directory mtimes would leak scheduled posts that are merged
 * ahead of their publish date.
 */
function getNewBlogPosts(): Array<{ title: string; url: string }> {
  try {
    const now = new Date();
    const yesterday = now.getTime() - 24 * 60 * 60 * 1000;
    return getPublishedPosts(now)
      .filter((post) => new Date(post.publishAt).getTime() > yesterday)
      .map((post) => ({
        title: post.title,
        url: `https://thewebsite.app/blog/${post.slug}`,
      }));
  } catch (error) {
    console.error('Error checking for new blog posts:', error);
    return [];
  }
}

/**
 * Get accomplishments for today
 * Hardcoded because git history not available in Vercel production
 */
function getManualAccomplishments(): string[] {
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Day 3 (March 7, 2026) accomplishments
  if (dayOfMonth === 7) {
    return [
      "Fixed design consistency across all pages (dark theme unified)",
      "Converted blog posts to dark theme with improved typography",
      "Tasks page now groups by role (CEO/Engineer/Course Instructor)",
      "Configured Resend email system with domain updates.thewebsite.app",
      "Added Sentry error monitoring for production",
      "Built unsubscribe system for email compliance",
      "Fixed database schema compatibility for email system",
      "Improved blog post typography (larger headings, better spacing)",
    ];
  }

  // Future days will be added here
  return [];
}

/**
 * Get all accomplishments from today
 * We send emails in the evening showing what we accomplished today
 */
export function getYesterdayAccomplishments(): {
  accomplishments: string[];
  newBlogPosts: Array<{ title: string; url: string }>;
} {
  // First try manual accomplishments (most curated)
  let accomplishments = getManualAccomplishments();

  // If no manual accomplishments, fall back to automated detection
  if (accomplishments.length === 0) {
    accomplishments = getTodaysCommits()
      .map(item => item.description)
      .slice(0, 10); // Limit to 10 items
  }

  const blogPosts = getNewBlogPosts();

  return {
    accomplishments,
    newBlogPosts: blogPosts,
  };
}
