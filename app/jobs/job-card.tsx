"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import { getJobApplyProps } from "@/lib/job-apply";
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

/** Render text as paragraph or bullet list (newline-separated lines → list). */
function SectionContent({ text }: { text: string }) {
  const lines = text
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  if (lines.length === 1) {
    return <p className="text-sm text-muted-foreground">{lines[0]}</p>;
  }
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export function JobCard({
  job,
  postedAt,
  isFavorited,
  isLoggedIn,
}: JobCardProps) {
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const applyProps = getJobApplyProps(job, job.slug);
  const hasQuickLookContent = Boolean(
    job.summary?.trim() ||
    job.responsibilities?.trim() ||
    job.requirements?.trim() ||
    job.what_we_offer?.trim(),
  );

  const applyHref = applyProps.applyHref;
  const applyIsExternal = applyHref?.startsWith("http") ?? false;
  const applyIsMailto = applyHref?.startsWith("mailto:") ?? false;
  const showApply = !applyProps.isClosed && !!applyHref;

  return (
    <Card className="rounded-2xl border border-primary/100 bg-[#fdfdfc] shadow-sm transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Company logo – top left */}
          {job.employer?.company_logo_url ? (
            <Link
              href={`/jobs/${job.slug}`}
              className="relative shrink-0  overflow-hidden rounded-xl"
            >
              {canUseNextImageForUrl(job.employer.company_logo_url) ? (
                <Image
                  src={job.employer.company_logo_url}
                  alt=""
                  width={220}
                  height={220}
                  className="h-auto max-h-[70px] w-auto max-w-[70px] object-contain pt-[1px]"
                />
              ) : (
                // Use a plain <img> for unknown hosts to avoid next/image remote host errors.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.employer.company_logo_url}
                  alt=""
                  className="h-auto max-h-[70px] w-auto max-w-[70px] object-contain pt-[5px]"
                  loading="lazy"
                />
              )}
            </Link>
          ) : (
            <div className="h-[70px] w-[70px] shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/jobs/${job.slug}`} className="min-w-0 flex-1">
                <h2 className="font-heading text-[1.3rem] font-semibold leading-tight text-heading hover:underline">
                  {job.title}
                </h2>
                {(job.employer?.company_name ?? job.employer?.full_name) && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {job.employer?.company_name ?? job.employer?.full_name}
                  </p>
                )}
              </Link>
              <FavoriteButton
                jobId={job.id}
                initialIsFavorited={isFavorited}
                isLoggedIn={isLoggedIn}
                variant="icon"
                className=" hover:bg-muted/30 [&_svg]:h-5 [&_svg]:w-5"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {job.role && (
                <>
                  <span>{job.role}</span>
                  <span aria-hidden>·</span>
                </>
              )}
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
            {/* Tech pills | Quick look (center) | Posted + salary/location (right) */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              {job.tech_stack?.length > 0 ? (
                <Link
                  href={`/jobs/${job.slug}`}
                  className="relative z-10 flex min-w-0 flex-1 flex-wrap gap-1.5"
                >
                  {job.tech_stack.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </Link>
              ) : (
                <div className="min-w-0 flex-1" aria-hidden />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto shrink-0 gap-1 p-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80 hover:underline focus-visible:ring-0"
                onClick={() => setQuickLookOpen((o) => !o)}
                aria-expanded={quickLookOpen}
              >
                <Zap className="h-3.5 w-3.5" aria-hidden />
                <span>Quick look</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    quickLookOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </Button>
              <Link
                href={`/jobs/${job.slug}`}
                className="relative z-10 flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 text-right"
              >
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
                {postedAt && (
                  <span className="text-xs text-muted-foreground">
                    Posted {postedAt}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          quickLookOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <CardContent className="rounded-b-2xl border-t border-border/60 bg-[#fdfdfc] pl-[110px] pr-[3rem] pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-x-[4rem] gap-y-6 md:grid-cols-2 md:grid-rows-2 md:items-start">
                {job.summary?.trim() && (
                  <div>
                    <p className="text-base font-semibold text-heading">
                      Summary
                    </p>
                    <div className="mt-1.5">
                      <SectionContent text={job.summary} />
                    </div>
                  </div>
                )}
                {job.responsibilities?.trim() && (
                  <div>
                    <p className="text-base font-semibold text-heading">
                      Responsibilities
                    </p>
                    <div className="mt-1.5">
                      <SectionContent text={job.responsibilities} />
                    </div>
                  </div>
                )}
                {job.requirements?.trim() && (
                  <div>
                    <p className="text-base font-semibold text-heading">
                      Requirements
                    </p>
                    <div className="mt-1.5">
                      <SectionContent text={job.requirements} />
                    </div>
                  </div>
                )}
                {job.what_we_offer?.trim() && (
                  <div>
                    <p className="text-base font-semibold text-heading">
                      What we offer
                    </p>
                    <div className="mt-1.5">
                      <SectionContent text={job.what_we_offer} />
                    </div>
                  </div>
                )}
              </div>

              {!hasQuickLookContent && (
                <p className="text-sm text-muted-foreground">
                  No additional details provided for this listing.
                </p>
              )}

              <div className="border-t border-border/60 pt-4">
                {applyProps.isClosed ? (
                  <p className="text-sm text-muted-foreground">
                    This position has been filled. Applications are no longer
                    accepted.
                  </p>
                ) : (
                  <>
                    {showApply && (
                      <Button asChild size="lg" className="w-full rounded-lg">
                        {applyIsExternal || applyIsMailto ? (
                          <a
                            href={applyHref}
                            {...(applyIsExternal
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                          >
                            {applyProps.applyLabel}
                          </a>
                        ) : (
                          <Link href={applyHref}>{applyProps.applyLabel}</Link>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
