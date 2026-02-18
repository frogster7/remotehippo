"use client";

import Link from "next/link";
import Image from "next/image";
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

const companyName = (job: Job) =>
  job.employer?.company_name ?? job.employer?.full_name ?? "Company";

export function JobCard({
  job,
  postedAt,
  isFavorited,
  isLoggedIn,
}: JobCardProps) {
  const name = companyName(job);
  return (
    <Card className="rounded-2xl border border-primary/100 shadow-sm transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {/* Company logo – top left */}
          <Link
            href={`/jobs/${job.slug}`}
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/30 bg-muted"
          >
            {job.employer?.company_logo_url ? (
              <Image
                src={job.employer.company_logo_url}
                alt=""
                width={48}
                height={48}
                className="object-contain p-1"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/jobs/${job.slug}`} className="min-w-0 flex-1">
                <h2 className="font-heading text-[1.3rem] font-semibold leading-tight text-heading hover:underline">
                  {job.title}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {job.role}
                </p>
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={`/jobs/${job.slug}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 pl-16">
            <div className="flex flex-wrap items-center gap-2">
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
              {(job.salary_min != null || job.salary_max != null) && (
                <span className="text-xs font-semibold text-primary">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              )}
              {job.location && (
                <span className="text-xs text-muted-foreground">
                  {job.location}
                </span>
              )}
            </div>
            {postedAt && (
              <span className="shrink-0 text-xs text-muted-foreground">
                Posted {postedAt}
              </span>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
