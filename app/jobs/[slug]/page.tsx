import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getJobBySlug, isJobFavorited } from "@/lib/jobs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { formatRelativeTime } from "@/lib/format";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null) return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
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

  // Check if logged in and if job is favorited
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isFavorited = await isJobFavorited(job.id, user?.id);

  const companyName = job.employer?.company_name ?? job.employer?.full_name ?? "Company";
  const salaryStr = formatSalary(job.salary_min, job.salary_max);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          ← Back to jobs
        </Link>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
                <p className="mt-1 text-muted-foreground">{job.role}</p>
              </div>
              <FavoriteButton
                jobId={job.id}
                initialIsFavorited={isFavorited}
                isLoggedIn={!!user}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{job.work_type}</Badge>
              <Badge variant="outline">{job.job_type}</Badge>
              {job.eu_timezone_friendly && (
                <Badge variant="secondary">EU timezone friendly</Badge>
              )}
              {job.closed_at && (
                <Badge variant="secondary">Position filled</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Posted {formatRelativeTime(job.created_at)}
            </p>
            {job.employer && (
              <div className="flex items-center gap-3 pt-2 border-t">
                {job.employer.company_logo_url ? (
                  <Image
                    src={job.employer.company_logo_url}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {companyName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{companyName}</p>
                  {job.employer.company_website && (
                    <a
                      href={job.employer.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {job.employer.company_website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  <Link
                    href={`/employer/${job.employer_id}`}
                    className="text-sm text-primary hover:underline mt-1 inline-block"
                  >
                    View all jobs from this company →
                  </Link>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {(job.tech_stack?.length ?? 0) > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Tech stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.tech_stack.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {salaryStr && (
              <div>
                <h3 className="text-sm font-medium mb-1">Salary</h3>
                <p className="text-muted-foreground">{salaryStr}</p>
              </div>
            )}
            {job.location && (
              <div>
                <h3 className="text-sm font-medium mb-1">Location</h3>
                <p className="text-muted-foreground">{job.location}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
            <div className="pt-4">
              {job.closed_at ? (
                <p className="text-muted-foreground text-sm">
                  This position has been filled. Applications are no longer accepted.
                </p>
              ) : job.application_url ? (
                <>
                  <Button asChild>
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply for this job
                    </a>
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You will be directed to the employer’s application process.
                  </p>
                </>
              ) : job.application_email ? (
                <>
                  <Button asChild>
                    <a
                      href={`mailto:${job.application_email}?subject=Application: ${encodeURIComponent(job.title)}`}
                    >
                      Apply by email
                    </a>
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You will be directed to the employer’s application process.
                  </p>
                </>
              ) : job.employer?.company_website ? (
                <>
                  <Button asChild>
                    <a
                      href={job.employer.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply via company website
                    </a>
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Apply via the company website above.
                  </p>
                </>
              ) : (
                <>
                  <Button asChild>
                    <a
                      href={`mailto:jobs@example.com?subject=Application: ${encodeURIComponent(job.title)}`}
                    >
                      Apply for this job
                    </a>
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Apply via the company website or contact when available.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
