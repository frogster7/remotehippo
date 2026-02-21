import { getJobs } from "@/lib/jobs";
import { getSavedSearches } from "@/lib/saved-searches";
import type { Job } from "@/lib/types";

const TAILORED_PER_SEARCH = 5;
const TAILORED_TOTAL_LIMIT = 12;

/** Jobs that match any of the user's saved searches (deduped, by created_at desc). */
export async function getTailoredJobs(
  userId: string,
  limit = TAILORED_TOTAL_LIMIT
): Promise<Job[]> {
  const searches = await getSavedSearches(userId);
  if (searches.length === 0) return [];

  const seen = new Set<string>();
  const merged: Job[] = [];

  for (const search of searches) {
    const jobs = await getJobs(search.filters, TAILORED_PER_SEARCH);
    for (const job of jobs) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      merged.push(job);
    }
  }

  merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return merged.slice(0, limit);
}
