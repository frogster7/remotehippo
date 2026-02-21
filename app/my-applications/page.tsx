import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplicationsByApplicant } from "@/lib/jobs";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Applications | Niche Tech Job Board",
  description: "Jobs you have applied to",
};

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null)
    return `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

function formatStatus(status: string): string {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default async function MyApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/my-applications");
  }

  const applications = await getApplicationsByApplicant(user.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            My Applications
          </h1>
          <p className="mt-2 text-muted-foreground">
            {applications.length === 0
              ? "You haven't applied to any jobs yet."
              : `${applications.length} application${applications.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {applications.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-border/80 bg-card shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase
                className="mx-auto h-12 w-12 text-primary/70"
                aria-hidden
              />
              <p className="text-muted-foreground mt-4 mb-4">
                You haven&apos;t applied to any jobs yet.
              </p>
              <Link
                href="/jobs"
                className="text-primary font-medium hover:underline"
              >
                Browse jobs →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const job = app.job;
              const companyName =
                job.employer?.company_name ??
                job.employer?.full_name ??
                "Company";
              const salaryStr = formatSalary(job.salary_min, job.salary_max);

              return (
                <Card
                  key={app.id}
                  className="rounded-3xl border border-primary/100 bg-[#fdfdfc] shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company logo */}
                      <div className="flex-shrink-0">
                        {job.employer?.company_logo_url ? (
                          <div className="rounded-xl border border-border/70 bg-background p-1.5">
                            <Image
                              src={job.employer.company_logo_url}
                              alt=""
                              width={48}
                              height={48}
                              className="rounded object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-muted text-sm font-medium text-muted-foreground">
                            {companyName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Job info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Link
                              href={`/jobs/${job.slug}`}
                              className="text-lg font-semibold text-heading hover:underline"
                            >
                              {job.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {companyName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="rounded-full text-xs">
                              {formatStatus(app.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Applied {formatRelativeTime(app.applied_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {job.work_type}
                          </Badge>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {job.job_type}
                          </Badge>
                          {job.role && (
                            <Badge variant="outline" className="rounded-full text-xs">
                              {job.role}
                            </Badge>
                          )}
                          {salaryStr && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-[hsl(var(--salary)/0.35)] bg-[hsl(var(--salary)/0.1)] text-xs text-[hsl(var(--salary))]"
                            >
                              {salaryStr}
                            </Badge>
                          )}
                          {job.location && (
                            <Badge variant="outline" className="rounded-full text-xs">
                              {job.location}
                            </Badge>
                          )}
                        </div>

                        {job.tech_stack && job.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.tech_stack.slice(0, 5).map((tech) => (
                              <span
                                key={tech}
                                className="text-xs text-muted-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                            {job.tech_stack.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{job.tech_stack.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
