import { getPublishedPosts } from './blog';

/**
 * Blog posts that went live in the last 24 hours, per the registry's
 * publishAt. Directory mtimes would leak scheduled posts that are merged
 * ahead of their publish date.
 */
export function getNewBlogPosts(): Array<{ title: string; url: string }> {
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
