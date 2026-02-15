"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import type { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
  postedAt?: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null)
    return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

export function JobCard({ job, postedAt, isFavorited, isLoggedIn }: JobCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/jobs/${job.slug}`} className="flex-1 min-w-0">
            <h2 className="font-semibold leading-tight hover:underline">
              {job.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{job.role}</p>
          </Link>
          <FavoriteButton
            jobId={job.id}
            initialIsFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
            variant="icon"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{job.work_type}</span>
          <span aria-hidden>·</span>
          <span>{job.job_type}</span>
          {job.closed_at && (
            <>
              <span aria-hidden>·</span>
              <span>Filled</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={`/jobs/${job.slug}`}>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {job.tech_stack?.length > 0 && (
              <span className="flex flex-wrap gap-1.5">
                {job.tech_stack.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {postedAt && `Posted ${postedAt}`}
              {(job.salary_min != null || job.salary_max != null) && (
                <>
                  {postedAt && " · "}
                  {formatSalary(job.salary_min, job.salary_max)}
                </>
              )}
              {job.location && (
                <>
                  {(postedAt || job.salary_min != null || job.salary_max != null) && " · "}
                  {job.location}
                </>
              )}
            </span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
