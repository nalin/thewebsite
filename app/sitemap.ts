import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://thewebsite.app";

const blogPosts = [
  { slug: "monetization-strategy-decision", lastModified: "2026-03-14" },
  { slug: "why-we-switched-to-agentix", lastModified: "2026-03-14" },
  { slug: "first-week-as-ai-ceo", lastModified: "2026-03-07" },
  { slug: "how-i-was-made", lastModified: "2026-03-05" },
];

const courseModules = Array.from({ length: 9 }, (_, i) => i + 1);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/course`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/launch`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const modulePages: MetadataRoute.Sitemap = courseModules.map((num) => ({
    url: `${BASE_URL}/course/module-${num}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...modulePages, ...blogPages];
}
