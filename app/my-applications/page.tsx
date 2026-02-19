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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase
                className="mx-auto h-12 w-12 text-muted-foreground/60"
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
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company logo */}
                      <div className="flex-shrink-0">
                        {job.employer?.company_logo_url ? (
                          <Image
                            src={job.employer.company_logo_url}
                            alt=""
                            width={48}
                            height={48}
                            className="rounded object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
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
                              className="text-lg font-semibold hover:underline"
                            >
                              {job.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {companyName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              {formatStatus(app.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Applied {formatRelativeTime(app.applied_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {job.work_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {job.job_type}
                          </Badge>
                          {job.role && (
                            <Badge variant="outline" className="text-xs">
                              {job.role}
                            </Badge>
                          )}
                          {salaryStr && (
                            <Badge variant="outline" className="text-xs">
                              {salaryStr}
                            </Badge>
                          )}
                          {job.location && (
                            <Badge variant="outline" className="text-xs">
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
