import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import {
  getActiveJobSlugs,
  getEmployerIdsWithActiveJobs,
} from "@/lib/jobs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [slugs, employerIds] = await Promise.all([
    getActiveJobSlugs(),
    getEmployerIdsWithActiveJobs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const jobPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/jobs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const employerPages: MetadataRoute.Sitemap = employerIds.map((id) => ({
    url: `${base}/employer/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...jobPages, ...employerPages];
}
