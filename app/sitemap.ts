import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://akluxnails.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
