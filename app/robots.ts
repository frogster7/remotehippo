import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/employer/dashboard",
        "/employer/jobs",
        "/dashboard",
        "/profile",
        "/saved-jobs",
        "/my-applications",
        "/saved-searches",
        "/login",
        "/register",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
