import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getJobBySlug, isJobFavorited } from "@/lib/jobs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import { JobApplyCard } from "./job-apply-card";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { formatRelativeTime } from "@/lib/format";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null) return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
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

function getApplyProps(
  job: Awaited<ReturnType<typeof getJobBySlug>>,
  slug: string
) {
  if (!job) return null;
  if (job.closed_at) {
    return {
      isClosed: true as const,
      applyHref: null as string | null,
      applyLabel: "",
      applyNote: "",
    };
  }
  if (job.application_url) {
    return {
      isClosed: false as const,
      applyHref: job.application_url,
      applyLabel: "Apply for this job",
      applyNote: "You will be directed to the employer's application process.",
    };
  }
  if (
    job.application_email &&
    job.employer?.application_preference === "email"
  ) {
    return {
      isClosed: false as const,
      applyHref: `/jobs/${slug}/apply`,
      applyLabel: "Apply for this job",
      applyNote: "Submit your application on our site. We'll send it to the employer.",
    };
  }
  if (job.application_email) {
    return {
      isClosed: false as const,
      applyHref: `mailto:${job.application_email}?subject=Application: ${encodeURIComponent(job.title)}`,
      applyLabel: "Apply by email",
      applyNote: "You will be directed to the employer's application process.",
    };
  }
  if (job.employer?.company_website) {
    return {
      isClosed: false as const,
      applyHref: job.employer.company_website,
      applyLabel: "Apply via company website",
      applyNote: "Apply via the company website above.",
    };
  }
  return {
    isClosed: false as const,
    applyHref: `mailto:jobs@example.com?subject=Application: ${encodeURIComponent(job.title)}`,
    applyLabel: "Apply for this job",
    applyNote: "Apply via the company website or contact when available.",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };
  const company = job.employer?.company_name ?? job.employer?.full_name ?? "Company";
  const title = `${job.title} at ${company}`;
  const description =
    job.description.slice(0, 160).replace(/\s+/g, " ").trim() + (job.description.length > 160 ? "…" : "");
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

  const companyName = job.employer?.company_name ?? job.employer?.full_name ?? "Company";
  const salaryStr = formatSalary(job.salary_min, job.salary_max);
  const applyProps = getApplyProps(job, slug);
  const siteUrl = getSiteUrl();
  const shareUrl = `${siteUrl}/jobs/${slug}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/50 to-muted/30">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:py-10">
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
            <Card className="overflow-hidden rounded-xl border bg-card shadow-md ring-1 ring-black/5">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-heading md:text-2xl">
                      {job.title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">{job.role}</p>
                    {job.employer && (
                      <Link
                        href={`/employer/${job.employer_id}`}
                        className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        {companyName}
                      </Link>
                    )}
                  </div>
                  <FavoriteButton
                    jobId={job.id}
                    initialIsFavorited={isFavorited}
                    isLoggedIn={!!user}
                    variant="ghost"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border/80 flex flex-wrap items-center gap-2">
                  {salaryStr && (
                    <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                      {salaryStr}
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm capitalize",
                      "border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {job.work_type}
                  </span>
                  <span
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm",
                      "border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {job.job_type}
                  </span>
                  {job.location && (
                    <span
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm",
                        "border-border bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {job.location}
                    </span>
                  )}
                  {job.closed_at && (
                    <span className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
                      Position filled
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Posted {formatRelativeTime(job.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Technologies we use - own card above Summary */}
            {(job.tech_stack?.length ?? 0) > 0 && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/40">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-3">Technologies we use</h3>
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
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/40">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">Summary</h3>
                  <SectionContent text={job.summary} />
                </CardContent>
              </Card>
            )}
            {job.responsibilities?.trim() && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">Responsibilities</h3>
                  <SectionContent text={job.responsibilities} />
                </CardContent>
              </Card>
            )}
            {job.requirements?.trim() && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">Requirements</h3>
                  <SectionContent text={job.requirements} />
                </CardContent>
              </Card>
            )}
            {job.what_we_offer?.trim() && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">What we offer</h3>
                  <SectionContent text={job.what_we_offer} />
                </CardContent>
              </Card>
            )}
            {job.good_to_have?.trim() && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">Good to have</h3>
                  <SectionContent text={job.good_to_have} />
                </CardContent>
              </Card>
            )}
            {job.benefits?.trim() && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">Benefits</h3>
                  <SectionContent text={job.benefits} />
                </CardContent>
              </Card>
            )}

            {/* Optional description */}
            {job.description?.trim() && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-heading mb-2">Description</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                    {job.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Apply CTA at bottom of main column */}
            {applyProps && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <CardContent className="p-6">
                  {applyProps.isClosed ? (
                    <p className="text-sm text-muted-foreground">
                      This position has been filled. Applications are no longer accepted.
                    </p>
                  ) : (
                    <>
                      {applyProps.applyHref && (
                        <Button asChild size="lg" className="w-full rounded-lg">
                          <Link
                            href={applyProps.applyHref}
                            {...(applyProps.applyHref.startsWith("http")
                              ? { target: "_blank", rel: "noopener noreferrer" as const }
                              : {})}
                          >
                            {applyProps.applyLabel}
                          </Link>
                        </Button>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {applyProps.applyNote}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </article>

          {/* Sidebar: company + apply */}
          <aside className="w-full shrink-0 space-y-6 lg:w-72 lg:sticky lg:top-6">
            {job.employer && (
              <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    {job.employer.company_logo_url ? (
                      <Image
                        src={job.employer.company_logo_url}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                        {companyName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{companyName}</p>
                      {job.employer.company_website && (
                        <a
                          href={job.employer.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline truncate block"
                        >
                          {job.employer.company_website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-lg">
                    <Link href={`/employer/${job.employer_id}`}>
                      View all jobs from this company
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
