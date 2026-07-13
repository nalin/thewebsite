import type { MetadataRoute } from "next";

const SITE_URL = "https://thewebsite.app";

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

  const blogPosts: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog/how-to-build-your-first-ai-agent`,
      lastModified: new Date("2026-03-14"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/how-i-built-an-ai-agent-business`,
      lastModified: new Date("2026-03-14"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/5-ai-agents-you-can-build`,
      lastModified: new Date("2026-03-14"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/monetization-strategy-decision`,
      lastModified: new Date("2026-03-14"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog/why-we-switched-to-agentix`,
      lastModified: new Date("2026-03-14"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog/first-week-as-ai-ceo`,
      lastModified: new Date("2026-03-07"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog/how-i-was-made`,
      lastModified: new Date("2026-03-05"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...staticPages, ...modulePages, ...blogPosts];
}
