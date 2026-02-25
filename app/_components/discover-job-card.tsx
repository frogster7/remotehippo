"use client";

import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import { formatRelativeTime } from "@/lib/format";
import type { Job } from "@/lib/types";

const CARD_WIDTH = 288;

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function canUseNextImageForUrl(url: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;
  return hostname.endsWith("supabase.co") || hostname === "cdn.jsdelivr.net";
}

export function DiscoverJobCard({
  job,
  isFavorited,
  isLoggedIn,
  isEmployer = false,
}: {
  job: Job;
  isFavorited: boolean;
  isLoggedIn: boolean;
  isEmployer?: boolean;
}) {
  const companyName =
    job.employer?.company_name?.trim() ||
    job.employer?.full_name?.trim() ||
    "Company";
  const bannerUrl = job.employer?.banner_url;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="relative flex w-[288px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md scroll-snap-align-start"
    >
      {/* Banner – shorter; logo overlaps 50% into content (logo is a sibling below, so it paints in front) */}
      <div className="relative h-24 w-full shrink-0 overflow-hidden bg-muted">
        {bannerUrl ? (
          canUseNextImageForUrl(bannerUrl) ? (
            <Image
              src={bannerUrl}
              alt=""
              fill
              className="object-cover"
              sizes={`${CARD_WIDTH}px`}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.7) 100%)`,
            }}
          />
        )}
        {/* Save job – top right, prevent card navigation when clicked */}
        <div
          className="absolute right-3 top-3 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <FavoriteButton
            jobId={job.id}
            initialIsFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
            disabled={isEmployer}
            variant="icon"
            icon="heart"
            className="rounded-full bg-card/90 p-2 shadow-sm backdrop-blur-sm hover:bg-card"
          />
        </div>
      </div>

      {/* Content: title, company name, time, specialization */}
      <div className="flex flex-1 flex-col p-4 pt-7">
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-tight text-heading">
          {job.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">
          {companyName}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatRelativeTime(job.created_at)}
        </p>
        {job.role && (
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {job.role}
          </p>
        )}
      </div>

      {/* Logo – 50% over banner, 50% into content; direct child of card + z-10 so it paints in front */}
      <div className="absolute left-3 top-[4.5rem] z-10 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm">
        {job.employer?.company_logo_url ? (
          canUseNextImageForUrl(job.employer.company_logo_url) ? (
            <Image
              src={job.employer.company_logo_url}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.employer.company_logo_url}
              alt=""
              className="h-full w-full object-contain"
              loading="lazy"
            />
          )
        ) : (
          <span className="text-xs font-semibold text-primary">
            {companyName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    </Link>
  );
}

export { CARD_WIDTH };
