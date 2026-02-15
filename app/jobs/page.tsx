import { Suspense } from "react";
import { getJobs, getFilterOptions, getFavoritedJobIds } from "@/lib/jobs";
import { JobsFilter } from "./jobs-filter";
import { JobCard } from "./job-card";
import { createClient } from "@/lib/supabase/server";
import type { JobFilters, WorkType, JobType } from "@/lib/types";

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

export const metadata = {
  title: "Jobs | Niche Tech Job Board",
  description:
    "Browse remote-friendly tech jobs. Filter by role, work type, job type, tech stack and salary.",
};

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
              <p className="font-medium">No jobs match your filters.</p>
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
