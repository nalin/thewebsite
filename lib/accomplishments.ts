import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface Accomplishment {
  type: 'commit' | 'roadmap' | 'blog';
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
 * Check ROADMAP.md for recently completed tasks
 */
function getRecentRoadmapUpdates(): Accomplishment[] {
  try {
    const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');

    if (!fs.existsSync(roadmapPath)) {
      return [];
    }

    const content = fs.readFileSync(roadmapPath, 'utf-8');

    // Extract completed section
    const completedMatch = content.match(/## ✅ Completed\s+([\s\S]*?)(?=\n##|$)/);
    if (!completedMatch) {
      return [];
    }

    const completedSection = completedMatch[1];

    // Extract completed items (lines starting with ✅ or -)
    const items = completedSection
      .split('\n')
      .filter(line => line.trim().match(/^[-✅]/))
      .map(line => line.replace(/^[-✅]\s*/, '').trim())
      .filter(line => line.length > 0);

    return items.map(item => ({
      type: 'roadmap' as const,
      description: item,
    }));
  } catch (error) {
    console.error('Error reading ROADMAP.md:', error);
    return [];
  }
}

/**
 * Check for new blog posts in the last 24 hours
 */
function getNewBlogPosts(): Array<{ title: string; url: string }> {
  try {
    const blogDir = path.join(process.cwd(), 'app', 'blog');

    if (!fs.existsSync(blogDir)) {
      return [];
    }

    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const newPosts: Array<{ title: string; url: string }> = [];

    const entries = fs.readdirSync(blogDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'posts') {
        const postPath = path.join(blogDir, entry.name);
        const stats = fs.statSync(postPath);

        // Check if directory was created in the last 24 hours
        if (stats.ctimeMs > yesterday) {
          // Try to extract title from page.tsx or use directory name
          let title = entry.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          newPosts.push({
            title,
            url: `https://thewebsite.app/blog/${entry.name}`,
          });
        }
      }
    }

    return newPosts;
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
    const commits = getTodaysCommits();
    const roadmapItems = getRecentRoadmapUpdates();

    // Combine and deduplicate accomplishments
    const allAccomplishments = [...commits, ...roadmapItems];

    // Format accomplishments
    accomplishments = allAccomplishments
      .map(item => {
        if (item.type === 'commit') {
          return item.description;
        }
        return item.description;
      })
      .slice(0, 10); // Limit to 10 items
  }

  const blogPosts = getNewBlogPosts();

  return {
    accomplishments,
    newBlogPosts: blogPosts,
  };
}
