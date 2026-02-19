import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { getJobBySlug, isJobFavorited } from "@/lib/jobs";
import { getJobApplyProps } from "@/lib/job-apply";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import { JobApplyCard } from "./job-apply-card";
import { ScrollToTopOnMount } from "./scroll-to-top-on-mount";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { formatRelativeTime } from "@/lib/format";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null)
    return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

/** Render text as paragraph or bullet list (newline-separated lines → list). */
function SectionContent({ text }: { text: string }) {
  const lines = text
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  if (lines.length === 1) {
    return (
      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
        {lines[0]}
      </p>
    );
  }
  return (
    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };
  const company =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";
  const title = `${job.title} at ${company}`;
  const description =
    job.description.slice(0, 160).replace(/\s+/g, " ").trim() +
    (job.description.length > 160 ? "…" : "");
  const canonical = `${getSiteUrl()}/jobs/${slug}`;
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

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isFavorited = await isJobFavorited(job.id, user?.id);

  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";
  const salaryStr = formatSalary(job.salary_min, job.salary_max);
  const applyProps = getJobApplyProps(job, slug);
  const siteUrl = getSiteUrl();
  const shareUrl = `${siteUrl}/jobs/${slug}`;

  return (
    <main className="min-h-screen bg-white">
      <ScrollToTopOnMount />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:py-10">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to jobs
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
          {/* Main content - grows to fill container up to 1200px total */}
          <article className="min-w-0 flex-1 space-y-5">
            {/* Hero card: title, position, company, job type & meta */}
            <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-base font-semibold tracking-tight text-[#004225]">
                      {job.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">{job.role}</p>
                    <p className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Posted {formatRelativeTime(job.created_at)}
                    </p>
                    <p className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="capitalize">
                        {job.location || job.work_type}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{job.job_type}</span>
                    </p>
                  </div>
                  <FavoriteButton
                    jobId={job.id}
                    initialIsFavorited={isFavorited}
                    isLoggedIn={!!user}
                    variant="icon"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border/80 flex flex-wrap items-center gap-2">
                  {salaryStr && (
                    <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                      {salaryStr}
                    </span>
                  )}
                  {job.closed_at && (
                    <span className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
                      Position filled
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technologies we use - own card above Summary */}
            {(job.tech_stack?.length ?? 0) > 0 && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-3">
                    Technologies we use
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tech_stack.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Structured section cards */}
            {job.summary?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    Summary
                  </h3>
                  <SectionContent text={job.summary} />
                </CardContent>
              </Card>
            )}
            {job.responsibilities?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    Responsibilities
                  </h3>
                  <SectionContent text={job.responsibilities} />
                </CardContent>
              </Card>
            )}
            {job.requirements?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    Requirements
                  </h3>
                  <SectionContent text={job.requirements} />
                </CardContent>
              </Card>
            )}
            {job.what_we_offer?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    What we offer
                  </h3>
                  <SectionContent text={job.what_we_offer} />
                </CardContent>
              </Card>
            )}
            {job.good_to_have?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    Good to have
                  </h3>
                  <SectionContent text={job.good_to_have} />
                </CardContent>
              </Card>
            )}
            {job.benefits?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    Benefits
                  </h3>
                  <SectionContent text={job.benefits} />
                </CardContent>
              </Card>
            )}

            {/* Optional description */}
            {job.description?.trim() && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-[#004225] mb-2">
                    Description
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                    {job.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Apply CTA at bottom of main column */}
            {applyProps && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-6">
                  {applyProps.isClosed ? (
                    <p className="text-sm text-muted-foreground">
                      This position has been filled. Applications are no longer
                      accepted.
                    </p>
                  ) : (
                    <>
                      {applyProps.applyHref && (
                        <Button asChild size="lg" className="w-full rounded-lg">
                          <Link
                            href={applyProps.applyHref}
                            {...(applyProps.applyHref.startsWith("http")
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer" as const,
                                }
                              : {})}
                          >
                            {applyProps.applyLabel}
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </article>

          {/* Sidebar: company + apply (sidebar sticks so apply card stays visible) */}
          <aside className="w-full shrink-0 space-y-6 lg:w-72 lg:sticky lg:top-6 lg:self-start">
            {job.employer && (
              <Card className="overflow-hidden rounded-xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    {job.employer.company_logo_url ? (
                      <Image
                        src={job.employer.company_logo_url}
                        alt=""
                        width={65}
                        height={65}
                        className="max-h-[65px] max-w-[65px] h-auto w-auto shrink-0 rounded-lg object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-[65px] w-[65px] shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                        {companyName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold truncate">
                        {companyName}
                      </p>
                      {job.employer.company_website && (
                        <a
                          href={job.employer.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline truncate block"
                        >
                          {job.employer.company_website.replace(
                            /^https?:\/\//,
                            "",
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full rounded-lg"
                  >
                    <Link href={`/employer/${job.employer_id}`}>
                      About the company
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {applyProps && (
              <JobApplyCard
                isClosed={applyProps.isClosed}
                applyHref={applyProps.applyHref}
                applyLabel={applyProps.applyLabel}
                applyNote={applyProps.applyNote}
                shareUrl={shareUrl}
                jobTitle={job.title}
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
