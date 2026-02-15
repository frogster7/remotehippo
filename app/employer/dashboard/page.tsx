import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployerJobs } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
            <h1 className="text-2xl font-semibold mt-1">Employer dashboard</h1>
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
            <Card>
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
                  <Card className="transition-colors hover:bg-muted/30">
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
                      <span className="text-xs text-muted-foreground">
                        Updated{" "}
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
