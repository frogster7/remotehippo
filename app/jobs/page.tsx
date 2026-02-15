import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { getJobs, getFilterOptions, getFavoritedJobIds } from "@/lib/jobs";
import { JobsFilter } from "./jobs-filter";
import { JobCard } from "./job-card";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import type { JobFilters, WorkType, JobType } from "@/lib/types";
import type { Metadata } from "next";

function parseFilters(searchParams: Record<string, string | string[] | undefined>): JobFilters {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const salaryMin = get("salary_min");
  const salaryMax = get("salary_max");
  return {
    q: get("q") ?? undefined,
    role: get("role") ?? undefined,
    work_type: (get("work_type") as WorkType) ?? undefined,
    job_type: (get("job_type") as JobType) ?? undefined,
    tech: get("tech") ?? undefined,
    salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
    salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
  };
}

function buildJobsQueryString(params: Record<string, string | string[] | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && (Array.isArray(v) ? v[0] : v) !== ""
  );
  if (entries.length === 0) return "";
  const search = new URLSearchParams();
  for (const [k, v] of entries) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val != null && val !== "") search.set(k, val);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = searchParams != null ? await searchParams : {};
  const filters = parseFilters(params);
  const base = getSiteUrl();
  const qs = buildJobsQueryString(params);
  const canonical = `${base}/jobs${qs}`;

  const parts: string[] = [];
  if (filters.work_type) parts.push(filters.work_type);
  if (filters.job_type) parts.push(filters.job_type);
  if (filters.role) parts.push(filters.role);
  if (filters.tech) parts.push(filters.tech);
  if (filters.q) parts.push(`"${filters.q}"`);
  const filterLabel = parts.length > 0 ? ` – ${parts.join(", ")}` : "";

  const title = `Jobs${filterLabel}`;
  const description =
    parts.length > 0
      ? `Remote-friendly tech jobs: ${parts.join(", ")}. EU timezone. Filter by role, work type, salary and more.`
      : "Browse remote-friendly tech jobs. Filter by role, work type, job type, tech stack and salary. EU timezone.";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params ?? {});

  // Get user and favorited job IDs
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [jobs, filterOptions, favoritedJobIds] = await Promise.all([
    getJobs(filters),
    getFilterOptions(),
    getFavoritedJobIds(user?.id),
  ]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Tech jobs</h1>
          <p className="mt-1 text-muted-foreground">
            Remote-friendly roles · EU timezone · Filter by role, work type and salary
          </p>
        </div>

        <Suspense fallback={<div className="h-24 animate-pulse rounded-lg border bg-muted/30" />}>
          <JobsFilter roles={filterOptions.roles} techOptions={filterOptions.tech} />
        </Suspense>

        <section className="mt-8 space-y-4">
          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 opacity-50" aria-hidden />
              <p className="mt-3 font-medium">No jobs match your filters.</p>
              <p className="mt-1 text-sm">Try adjusting filters or check back later.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobCard
                    job={job}
                    isFavorited={favoritedJobIds.has(job.id)}
                    isLoggedIn={!!user}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
