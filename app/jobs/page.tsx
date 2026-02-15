import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { getJobs, getFilterOptions, getFavoritedJobIds } from "@/lib/jobs";
import { JobsFilter } from "./jobs-filter";
import { JobCard } from "./job-card";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { formatRelativeTime } from "@/lib/format";
import type { JobFilters, WorkType, JobType } from "@/lib/types";
import type { Metadata } from "next";

function getParamArray(
  searchParams: Record<string, string | string[] | undefined>,
  k: string
): string[] {
  const v = searchParams[k];
  if (v == null) return [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
  return v.trim() ? [v] : [];
}

function parseFilters(searchParams: Record<string, string | string[] | undefined>): JobFilters {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const salaryMin = get("salary_min");
  const salaryMax = get("salary_max");
  return {
    q: get("q") ?? undefined,
    location: get("location") ?? undefined,
    roles: getParamArray(searchParams, "role"),
    work_types: getParamArray(searchParams, "work_type") as WorkType[],
    job_type: (get("job_type") as JobType) ?? undefined,
    tech: getParamArray(searchParams, "tech"),
    salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
    salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
  };
}

function buildJobsQueryString(filters: JobFilters): string {
  const p = new URLSearchParams();
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  if (filters.location?.trim()) p.set("location", filters.location.trim());
  filters.roles?.forEach((r) => p.append("role", r));
  filters.work_types?.forEach((w) => p.append("work_type", w));
  if (filters.job_type) p.set("job_type", filters.job_type);
  filters.tech?.forEach((t) => p.append("tech", t));
  if (filters.salary_min != null && filters.salary_min > 0) p.set("salary_min", String(filters.salary_min));
  if (filters.salary_max != null && filters.salary_max > 0) p.set("salary_max", String(filters.salary_max));
  const qs = p.toString();
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
  const qs = buildJobsQueryString(filters);
  const canonical = `${base}/jobs${qs}`;

  const parts: string[] = [];
  filters.work_types?.forEach((w) => parts.push(w));
  if (filters.job_type) parts.push(filters.job_type);
  filters.roles?.forEach((r) => parts.push(r));
  filters.tech?.forEach((t) => parts.push(t));
  if (filters.location) parts.push(filters.location);
  if (filters.q) parts.push(`"${filters.q}"`);
  const filterLabel = parts.length > 0 ? ` – ${parts.join(", ")}` : "";

  const title = `Jobs${filterLabel}`;
  const description =
    parts.length > 0
      ? `Remote-friendly tech jobs: ${parts.join(", ")}. Filter by role, work type, salary and more.`
      : "Browse remote-friendly tech jobs. Filter by role, work type, job type, tech stack and salary.";

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
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Tech jobs</h1>
          <p className="mt-1 text-muted-foreground">
            Remote-friendly roles · Filter by role, work type and salary
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left sidebar – filters */}
          <aside className="w-full shrink-0 lg:w-80">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-lg border bg-card" />}>
              <JobsFilter roles={filterOptions.roles} techOptions={filterOptions.tech} />
            </Suspense>
          </aside>

          {/* Right – job listings */}
          <section className="min-w-0 flex-1 space-y-4">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-card p-12 text-center text-muted-foreground">
                <Briefcase className="mx-auto h-12 w-12 opacity-50" aria-hidden />
                <p className="mt-3 font-medium">No jobs match your filters.</p>
                <p className="mt-1 text-sm">Try adjusting filters or check back later.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
                  </span>
                  <span>Sorted by newest</span>
                </div>
                <ul className="space-y-3">
                  {jobs.map((job) => (
                    <li key={job.id}>
                      <JobCard
                        job={job}
                        postedAt={formatRelativeTime(job.created_at)}
                        isFavorited={favoritedJobIds.has(job.id)}
                        isLoggedIn={!!user}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
