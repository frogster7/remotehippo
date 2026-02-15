import Link from "next/link";
import { Suspense } from "react";
import { getJobs, getFilterOptions } from "@/lib/jobs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobsFilter } from "./jobs-filter";
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

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null) return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
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
  const [jobs, filterOptions] = await Promise.all([getJobs(filters), getFilterOptions()]);

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
                  <Link href={`/jobs/${job.slug}`} className="block">
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h2 className="font-semibold leading-tight">{job.title}</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">{job.role}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary">{job.work_type}</Badge>
                            <Badge variant="outline">{job.job_type}</Badge>
                            {job.eu_timezone_friendly && (
                              <Badge variant="secondary">EU-friendly</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {job.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {job.tech_stack?.length > 0 && (
                            <span className="flex flex-wrap gap-1">
                              {job.tech_stack.slice(0, 5).map((t) => (
                                <Badge key={t} variant="outline" className="text-xs font-normal">
                                  {t}
                                </Badge>
                              ))}
                            </span>
                          )}
                          {(job.salary_min != null || job.salary_max != null) && (
                            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                          )}
                          {job.location && <span>{job.location}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
