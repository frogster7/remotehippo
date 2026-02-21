import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployerJobs } from "@/lib/jobs";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloseReopenButton } from "../close-reopen-button";

export const metadata: Metadata = {
  title: "Employer dashboard | Niche Tech Job Board",
  description: "Manage your job listings.",
};

export default async function EmployerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/employer/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "employer") redirect("/profile");

  const jobs = await getEmployerJobs(user.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to home
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-heading">
              Employer dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your job listings. Only active jobs appear on the public
              board.
            </p>
          </div>
          <Button asChild>
            <Link href="/employer/jobs/new">New job</Link>
          </Button>
        </div>

        <section className="space-y-4">
          {jobs.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-border/80 bg-card shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="font-medium">No jobs yet</p>
                <p className="mt-1 text-sm">
                  Create your first job listing to appear on the board.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/employer/jobs/new">Create job</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Card className="rounded-3xl border border-primary/100 bg-[#fdfdfc] shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-semibold leading-tight">
                            {job.title}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {job.role}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {job.closed_at && (
                            <Badge variant="secondary">Filled</Badge>
                          )}
                          <Badge variant="outline">{job.work_type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${job.slug}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/employer/jobs/${job.id}/edit`}>Edit</Link>
                      </Button>
                      <CloseReopenButton jobId={job.id} closedAt={job.closed_at} />
                      <span className="text-xs text-muted-foreground">
                        Posted {formatRelativeTime(job.created_at)} · Updated{" "}
                        {new Date(job.updated_at).toLocaleDateString()}
                      </span>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
