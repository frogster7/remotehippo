import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import type { Job } from "@/lib/types";

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null)
    return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

function RecentJobCard({ job, postedAt }: { job: Job; postedAt: string }) {
  const companyName = job.employer?.company_name ?? job.employer?.full_name ?? "Company";

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="flex w-72 shrink-0 flex-col rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        {job.employer?.company_logo_url ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={job.employer.company_logo_url}
              alt=""
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
            {companyName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {postedAt}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-primary line-clamp-2">{job.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{companyName}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {(job.salary_min != null || job.salary_max != null) && (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {formatSalary(job.salary_min, job.salary_max)}
          </span>
        )}
      </div>
    </Link>
  );
}

interface RecentJobsProps {
  jobs: Job[];
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="border-t bg-muted/30 py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">Recently posted jobs</h2>
        </div>
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex gap-4">
            {jobs.map((job) => (
              <RecentJobCard
                key={job.id}
                job={job}
                postedAt={formatRelativeTime(job.created_at)}
              />
            ))}
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/jobs"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all jobs →
          </Link>
        </div>
      </div>
    </section>
  );
}
