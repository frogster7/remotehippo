import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Briefcase,
  Building2,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployerJobs } from "@/lib/jobs";
import { getJobStats } from "@/lib/job-analytics";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloseReopenButton } from "../close-reopen-button";
import { ProfileForm } from "@/app/profile/profile-form";
import { SignOutLink } from "@/app/dashboard/sign-out-link";
import type { Profile as ProfileType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Employer dashboard | Niche Tech Job Board",
  description: "Manage your job listings and view stats.",
};

const PANELS = ["home", "listings", "stats", "edit-profile"] as const;
type Panel = (typeof PANELS)[number];

function parsePanel(value: string | undefined): Panel {
  return PANELS.includes(value as Panel) ? (value as Panel) : "home";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning!";
  if (h < 18) return "Good afternoon!";
  return "Good evening!";
}

export default async function EmployerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ panel?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const activePanel = parsePanel(params.panel);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/employer/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, last_name, phone_number, company_name, company_website, company_logo_url, company_about, company_location, application_preference",
    )
    .eq("id", user.id)
    .single();
  if (profile?.role !== "employer") redirect("/profile");

  const [
    jobs,
    stats,
    { data: bannersData },
    { data: benefitsData },
    { data: hiringStepsData },
    { data: galleryData },
  ] = await Promise.all([
    getEmployerJobs(user.id),
    getJobStats(user.id),
    supabase
      .from("company_banners")
      .select("id, url")
      .eq("employer_id", user.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("company_benefits")
      .select("id, employer_id, title, description, display_order, created_at")
      .eq("employer_id", user.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("company_hiring_steps")
      .select("id, employer_id, title, description, step_order, created_at")
      .eq("employer_id", user.id)
      .order("step_order", { ascending: true }),
    supabase
      .from("company_gallery")
      .select("id, employer_id, url, caption, display_order, created_at")
      .eq("employer_id", user.id)
      .order("display_order", { ascending: true }),
  ]);

  const banners = (bannersData ?? []).map((b) => ({ id: b.id, url: b.url }));
  const benefits = (benefitsData ?? []) as {
    id: string;
    employer_id: string;
    title: string;
    description: string | null;
    display_order: number;
    created_at: string;
  }[];
  const hiringSteps = (hiringStepsData ?? []) as {
    id: string;
    employer_id: string;
    title: string;
    description: string | null;
    step_order: number;
    created_at: string;
  }[];
  const gallery = (galleryData ?? []).map((g) => ({
    id: g.id,
    url: g.url,
    caption: g.caption as string | null,
  }));

  const profileData: ProfileType = {
    id: profile?.id ?? user.id,
    role: profile?.role ?? "employer",
    full_name: profile?.full_name ?? null,
    last_name: profile?.last_name ?? null,
    phone_number: profile?.phone_number ?? null,
    company_name: profile?.company_name ?? null,
    company_website: profile?.company_website ?? null,
    company_logo_url: profile?.company_logo_url ?? null,
    company_about: profile?.company_about ?? null,
    company_location: profile?.company_location ?? null,
    application_preference: profile?.application_preference ?? null,
  };

  const panelTitle: Record<Panel, string> = {
    home: "Your desktop",
    listings: "Your job listings",
    stats: "Stats",
    "edit-profile": "Edit profile/company page",
  };

  const companyDisplayName =
    profile?.company_name ?? profile?.full_name ?? "Your company";

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {activePanel === "home" ? (
          <div className="mb-8">
            <h1 className="text-[2rem] font-semibold tracking-tight text-heading">
              {getGreeting()}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your job listings and track performance.
            </p>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-20">
            <Card className="rounded-2xl border border-border/60 bg-card">
              <CardContent className="p-4">
                <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {profile?.company_logo_url ? (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background p-0.5 dark:bg-white">
                          <Image
                            src={profile.company_logo_url}
                            alt=""
                            width={44}
                            height={44}
                            className="h-full w-full rounded-full object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-heading">
                        {companyDisplayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email ?? ""}
                      </p>
                      <Link
                        href={`/employer/${user.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-xs font-medium text-primary hover:underline"
                      >
                        View company page
                      </Link>
                    </div>
                  </div>
                </div>
                <nav className="space-y-1 text-sm">
                  {[
                    {
                      id: "home" as const,
                      label: "Your desktop",
                      icon: LayoutDashboard,
                    },
                    {
                      id: "listings" as const,
                      label: "Your job listings",
                      icon: Briefcase,
                    },
                    { id: "stats" as const, label: "Stats", icon: BarChart3 },
                    {
                      id: "edit-profile" as const,
                      label: "Edit profile/company page",
                      icon: Settings,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activePanel === item.id;
                    const href =
                      item.id === "home"
                        ? "/employer/dashboard"
                        : `/employer/dashboard?panel=${item.id}`;
                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <SignOutLink />
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div>
            {activePanel === "home" ? (
              <>
                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="h-full rounded-2xl border border-border/50 bg-card shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-heading">
                          {stats.totals.jobs}
                        </p>
                        <p className="text-sm text-muted-foreground">job listings</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="h-full rounded-2xl border border-border/50 bg-card shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-heading">
                          {stats.totals.views}
                        </p>
                        <p className="text-sm text-muted-foreground">total views</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="h-full rounded-2xl border border-border/50 bg-card shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-heading">
                          {stats.totals.apply_clicks}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          apply button clicks
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="h-full rounded-2xl border border-primary/30 bg-primary text-primary-foreground shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">
                          {stats.totals.applications}
                        </p>
                        <p className="text-sm text-primary-foreground/90">
                          applications received
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <Card className="rounded-2xl border border-border/50 bg-card shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-heading">
                        Your job listings
                      </h3>
                      <Button asChild size="sm">
                        <Link href="/employer/jobs/new">Create new job</Link>
                      </Button>
                    </div>
                    {jobs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Create your first job to start receiving applications.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {jobs.slice(0, 5).map((job) => (
                          <Link
                            key={job.id}
                            href={`/jobs/${job.slug}`}
                            className="flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-heading truncate">
                                {job.title}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {job.role}
                                {job.location && ` · ${job.location}`}
                              </p>
                            </div>
                            <Badge
                              variant={job.is_active ? "default" : "secondary"}
                              className="shrink-0"
                            >
                              {job.is_active ? "Active" : "Draft"}
                            </Badge>
                            {job.closed_at && (
                              <Badge variant="secondary" className="shrink-0">
                                Filled
                              </Badge>
                            )}
                          </Link>
                        ))}
                        {jobs.length > 5 && (
                          <Link
                            href="/employer/dashboard?panel=listings"
                            className="block text-center text-sm font-medium text-primary hover:underline"
                          >
                            View all {jobs.length} listings
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="mb-4 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-[2rem] font-semibold text-heading">
                      {panelTitle[activePanel]}
                    </h2>
                    <div className="flex items-center gap-2">
                      {activePanel === "listings" && (
                        <>
                          <span className="text-sm text-muted-foreground">
                            {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                          </span>
                          <Button asChild size="sm">
                            <Link href="/employer/jobs/new">New job</Link>
                          </Button>
                        </>
                      )}
                      {activePanel === "stats" && (
                        <span className="text-sm text-muted-foreground">
                          {stats.perJob.length} job{stats.perJob.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
                  <CardContent className="p-5">
                    {activePanel === "listings" && (
                      jobs.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-muted-foreground">No jobs yet.</p>
                          <Button asChild className="mt-4">
                            <Link href="/employer/jobs/new">Create job</Link>
                          </Button>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {jobs.map((job) => (
                            <li key={job.id}>
                              <Card className="rounded-xl border border-primary/20">
                                <CardHeader className="pb-2">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-semibold leading-tight">
                                        {job.title}
                                      </h3>
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
                                    <Link
                                      href={`/employer/jobs/${job.id}/edit`}
                                    >
                                      Edit
                                    </Link>
                                  </Button>
                                  <CloseReopenButton
                                    jobId={job.id}
                                    closedAt={job.closed_at}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    Posted {formatRelativeTime(job.created_at)} ·
                                    Updated{" "}
                                    {new Date(job.updated_at).toLocaleDateString()}
                                  </span>
                                </CardContent>
                              </Card>
                            </li>
                          ))}
                        </ul>
                      )
                    )}

                    {activePanel === "stats" && (
                      stats.perJob.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-muted-foreground">
                            No jobs yet. Stats will appear after you create jobs
                            and they receive views or applications.
                          </p>
                          <Button asChild className="mt-4">
                            <Link href="/employer/jobs/new">Create job</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/60">
                                <th className="pb-3 pr-4 text-left font-medium text-heading">
                                  Job
                                </th>
                                <th className="px-4 pb-3 text-right font-medium text-heading">
                                  Views
                                </th>
                                <th className="px-4 pb-3 text-right font-medium text-heading">
                                  Apply clicks
                                </th>
                                <th className="pl-4 pb-3 text-right font-medium text-heading">
                                  Applications
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.perJob.map((s) => (
                                <tr
                                  key={s.job_id}
                                  className="border-b border-border/40 last:border-0"
                                >
                                  <td className="py-3 pr-4">
                                    <Link
                                      href={`/jobs/${s.slug}`}
                                      className="font-medium text-heading hover:underline"
                                    >
                                      {s.title}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 text-right text-muted-foreground">
                                    {s.views}
                                  </td>
                                  <td className="px-4 py-3 text-right text-muted-foreground">
                                    {s.apply_clicks}
                                  </td>
                                  <td className="pl-4 py-3 text-right text-muted-foreground">
                                    {s.applications}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}

                    {activePanel === "edit-profile" && (
                      <ProfileForm
                        profile={profileData}
                        banners={banners}
                        benefits={benefits}
                        hiringSteps={hiringSteps}
                        gallery={gallery}
                      />
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
