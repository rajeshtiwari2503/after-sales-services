import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/brand/",
          "/service-center/",
          "/technician/",
          "/customer/",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
