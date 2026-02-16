"use client";

import { useRef } from "react";
import Link from "next/link";
import { useDragScroll } from "@/lib/use-drag-scroll";
import Image from "next/image";
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { HydrationSafeDiv } from "@/components/hydration-safe-div";
import type { Job } from "@/lib/types";

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null)
    return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

function RecentJobCard({ job, postedAt }: { job: Job; postedAt: string }) {
  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="flex w-72 shrink-0 flex-col rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:shadow-md scroll-snap-align-start"
    >
      <HydrationSafeDiv className="flex items-start justify-between gap-2">
        {job.employer?.company_logo_url ? (
          <HydrationSafeDiv className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={job.employer.company_logo_url}
              alt=""
              fill
              className="object-contain"
              sizes="40px"
            />
          </HydrationSafeDiv>
        ) : (
          <HydrationSafeDiv className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
            {companyName.slice(0, 2).toUpperCase()}
          </HydrationSafeDiv>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {postedAt}
        </span>
      </HydrationSafeDiv>
      <h3 className="mt-3 font-semibold text-primary line-clamp-2">
        {job.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{companyName}</p>
      <HydrationSafeDiv className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
      </HydrationSafeDiv>
    </Link>
  );
}

interface RecentJobsProps {
  jobs: Job[];
}

const CARD_WIDTH = 288; // w-72 = 18rem = 288px
const GAP = 16;

export function RecentJobs({ jobs }: RecentJobsProps) {
  const { ref: scrollRef, handlers: dragHandlers } =
    useDragScroll<HTMLDivElement>();

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = CARD_WIDTH + GAP;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  if (jobs.length === 0) return null;

  return (
    <section className="border-t bg-muted/30 py-10 md:py-14">
      <HydrationSafeDiv className="container mx-auto px-4">
        <HydrationSafeDiv className="flex items-center justify-between gap-4">
          <HydrationSafeDiv className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold tracking-tight">
              Recently posted jobs
            </h2>
          </HydrationSafeDiv>
          <HydrationSafeDiv className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </HydrationSafeDiv>
        </HydrationSafeDiv>
        <HydrationSafeDiv
          ref={scrollRef}
          {...dragHandlers}
          className="mt-6 flex cursor-grab gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide [scroll-snap-type:x_mandatory] active:cursor-grabbing"
        >
          {jobs.map((job) => (
            <RecentJobCard
              key={job.id}
              job={job}
              postedAt={formatRelativeTime(job.created_at)}
            />
          ))}
        </HydrationSafeDiv>
        <HydrationSafeDiv className="mt-6 text-center">
          <Link
            href="/jobs"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all jobs →
          </Link>
        </HydrationSafeDiv>
      </HydrationSafeDiv>
    </section>
  );
}
