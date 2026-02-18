import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { getJobs, getFilterOptions, getFavoritedJobIds } from "@/lib/jobs";
import { parseFilters, buildJobsQueryString } from "@/lib/job-filters";
import { JobsFilter } from "./jobs-filter";
import { JobCard } from "./job-card";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { formatRelativeTime } from "@/lib/format";
import type { Metadata } from "next";

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
      ? `Remote-friendly tech jobs: ${parts.join(", ")}. Filter by specialization, work mode, salary and more.`
      : "Browse remote-friendly tech jobs. Filter by specialization, work mode, job type, tech stack and salary.";

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
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1100px] px-4 pb-12">
        {/* Page header */}
        <div className="border-b border-border/80 pt-4 pb-4">
          <h1 className="font-heading text-xl font-bold tracking-tight text-heading sm:text-3xl">
            Browse remote tech jobs
          </h1>
        </div>

        {/* Sticky search + filters bar */}
        <div className="sticky top-14 z-10 border-b border-border/80 bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <Suspense
            fallback={
              <div className="h-24 animate-pulse rounded-2xl border border-border/80 bg-card" />
            }
          >
            <JobsFilter
              roles={filterOptions.roles}
              techOptions={filterOptions.tech}
              isLoggedIn={!!user}
              layout="horizontal"
            />
          </Suspense>
        </div>

        {/* Job list */}
        <section className="pt-6">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Briefcase
                  className="h-7 w-7 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <p className="mt-4 font-heading font-semibold text-heading">
                No jobs match your filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting filters or check back later.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
                </span>
                <span className="text-muted-foreground">Sorted by newest</span>
              </div>
              <ul className="space-y-4">
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
    </main>
  );
}
