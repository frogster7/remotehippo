"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight, X, AlarmClock } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { HydrationSafeDiv } from "@/components/hydration-safe-div";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import type { Job } from "@/lib/types";

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null)
    return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

function RecentJobCard({
  job,
  postedAt,
  isFavorited,
  isLoggedIn,
  isEmployer,
  showSuperOffer,
}: {
  job: Job;
  postedAt: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
  isEmployer: boolean;
  showSuperOffer: boolean;
}) {
  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <HydrationSafeDiv
      className="relative flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-primary/100 bg-[#fdfdfc] shadow-md scroll-snap-align-start"
      style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}
    >
      {/* Top patterned area */}
      <div
        className="relative h-20 shrink-0"
        aria-hidden
        style={{
          background: `linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.6) 100%)`,
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--muted)) 0%, transparent 50%),
            linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)`,
        }}
      >
        {/* Subtle line pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              hsl(var(--foreground) / 0.08) 8px,
              hsl(var(--foreground) / 0.08) 9px
            )`,
          }}
        />
        {/* Logo - top left */}
        <Link
          href={`/jobs/${job.slug}`}
          className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
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
            <span className="text-sm font-semibold text-primary">
              {companyName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </Link>
        {/* Top right: Super offer badge, then X + Star */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {showSuperOffer && (
            <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950 shadow-sm">
              Super offer
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setDismissed(true);
              }}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <FavoriteButton
              jobId={job.id}
              initialIsFavorited={isFavorited}
              isLoggedIn={isLoggedIn}
              disabled={isEmployer}
              variant="icon"
              icon="star"
              className="rounded-full p-1.5"
            />
          </div>
        </div>
      </div>
      {/* Content */}
      <Link href={`/jobs/${job.slug}`} className="flex flex-1 flex-col p-5 pt-4">
        <h3 className="font-heading text-base font-bold leading-tight text-heading line-clamp-2">
          {job.title}
        </h3>
        {(job.salary_min != null || job.salary_max != null) && (
          <p
            className="mt-1.5 text-sm font-semibold"
            style={{ color: "hsl(var(--salary))" }}
          >
            {formatSalary(job.salary_min, job.salary_max)}
          </p>
        )}
        <p className="mt-1.5 text-sm font-medium text-muted-foreground line-clamp-1">
          {companyName}
        </p>
        {job.location && (
          <span className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {job.location}
          </span>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{postedAt}</p>
      </Link>
    </HydrationSafeDiv>
  );
}

interface RecentJobsProps {
  jobs: Job[];
  favoritedJobIds: Set<string>;
  isLoggedIn: boolean;
  isEmployer?: boolean;
}

const CARD_WIDTH = 288;
const GAP = 16;

export function RecentJobs({
  jobs,
  favoritedJobIds,
  isLoggedIn,
  isEmployer = false,
}: RecentJobsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <section className="rounded-t-3xl border-t border-border/80 bg-card py-12 md:py-16">
      <HydrationSafeDiv className="container mx-auto px-4">
        <HydrationSafeDiv className="flex items-center gap-3">
          <HydrationSafeDiv className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlarmClock className="h-5 w-5 text-destructive" aria-hidden />
          </HydrationSafeDiv>
          <h2 className="font-heading text-xl font-bold tracking-tight text-heading md:text-2xl">
            Latest recommendations
          </h2>
        </HydrationSafeDiv>
        <HydrationSafeDiv className="relative mt-6">
          <HydrationSafeDiv
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide [scroll-snap-type:x_mandatory] pb-2"
            style={{ cursor: "default" }}
          >
            {jobs.map((job, index) => (
              <RecentJobCard
                key={job.id}
                job={job}
                postedAt={formatRelativeTime(job.created_at)}
                isFavorited={favoritedJobIds.has(job.id)}
                isLoggedIn={isLoggedIn}
                isEmployer={isEmployer}
                showSuperOffer={
                  (job.salary_max != null && job.salary_max >= 15000) ||
                  index % 2 === 0
                }
              />
            ))}
          </HydrationSafeDiv>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
            aria-label="Scroll to next jobs"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </HydrationSafeDiv>
      </HydrationSafeDiv>
    </section>
  );
}
