import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";

const SITE_URL = "https://www.thewebsite.app";

// Revalidate hourly so scheduled posts enter the sitemap at publishAt.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/course`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/launch`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/starter-kit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/free-guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/metrics`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/tasks`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  // Only the open modules (1-2) are indexable; modules 3-10 sit behind the
  // email gate and 307-redirect for crawlers, so they stay out of the sitemap.
  const modulePages: MetadataRoute.Sitemap = [1, 2].map((i) => ({
    url: `${SITE_URL}/course/module-${i}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Derived from the registry so scheduled (future-publishAt) posts stay out
  // until they go live.
  const blogPostPages: MetadataRoute.Sitemap = getPublishedPosts().map(
    (post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  return [...staticPages, ...modulePages, ...blogPostPages];
}
