import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import {
  getJobs,
  getFilterOptions,
  getFavoritedJobIds,
  getActiveJobCount,
} from "@/lib/jobs";
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

  const [jobs, filterOptions, favoritedJobIds, jobCount] = await Promise.all([
    getJobs(filters),
    getFilterOptions(),
    getFavoritedJobIds(user?.id),
    getActiveJobCount(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-[1140px] px-4 pb-14 pt-6 sm:pt-8">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-7 shadow-sm sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]"
            aria-hidden
          />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Curated tech roles
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-heading sm:text-3xl md:text-4xl">
              Find your next role.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Discover hand-picked opportunities from teams hiring for remote
              and hybrid engineering work.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full border border-border/80 bg-background px-3 py-1.5 font-medium text-foreground">
                {jobCount.toLocaleString()} {jobCount === 1 ? "job" : "jobs"}
              </span>
              <span className="inline-flex items-center rounded-full border border-border/80 bg-background px-3 py-1.5 text-muted-foreground">
                Updated daily
              </span>
            </div>
          </div>
        </section>

        <div className="sticky top-0 z-20 mt-4 bg-background/90 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/75">
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

        <section className="pt-7">
          {jobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Briefcase className="h-7 w-7 text-primary" aria-hidden />
              </div>
              <p className="mt-4 font-heading text-lg font-semibold text-heading">
                No jobs match your filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting filters or check back later.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
                </span>
                <span className="rounded-full border border-border/80 bg-card px-3 py-1 text-xs text-muted-foreground">
                  Sorted by newest
                </span>
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
