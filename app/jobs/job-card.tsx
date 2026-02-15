"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex items-start justify-between gap-2">
          <Link href={`/jobs/${job.slug}`} className="flex-1 min-w-0">
            <h2 className="font-semibold leading-tight hover:underline">
              {job.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{job.role}</p>
          </Link>
          <div className="flex items-start gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{job.work_type}</Badge>
              <Badge variant="outline">{job.job_type}</Badge>
              {job.eu_timezone_friendly && (
                <Badge variant="secondary">EU-friendly</Badge>
              )}
              {job.closed_at && (
                <Badge variant="secondary">Filled</Badge>
              )}
            </div>
            <FavoriteButton
              jobId={job.id}
              initialIsFavorited={isFavorited}
              isLoggedIn={isLoggedIn}
              variant="icon"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={`/jobs/${job.slug}`}>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {postedAt && <span>Posted {postedAt}</span>}
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
        </Link>
      </CardContent>
    </Card>
  );
}
