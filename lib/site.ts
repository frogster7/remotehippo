/**
 * Canonical base URL for the site. Used for sitemap, robots, OpenGraph, and canonical links.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yoursite.com). Falls back to localhost in dev.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}
