import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();

  const publicRoutes = [
    { url: "", changeFrequency: "weekly" as const, priority: 1 },
    { url: "/privacy", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/cookies", changeFrequency: "monthly" as const, priority: 0.4 },
    { url: "/login", changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/register", changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/forgot-password", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return publicRoutes.map((route) => ({
    url: `${base}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
