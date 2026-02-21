import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Briefcase,
  FileBadge2,
  FileText,
  Heart,
  LayoutDashboard,
  Search,
  Send,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createSignedCvUrl } from "@/lib/storage";
import { getCvFileName } from "@/lib/utils";
import { getApplicationsByApplicant, getFavoritedJobs, getRecentJobs } from "@/lib/jobs";
import { getSavedSearches } from "@/lib/saved-searches";
import { getTailoredJobs } from "@/lib/dashboard";
import { getNotifications } from "@/lib/notifications";
import { buildJobsQueryString, formatFiltersSummary } from "@/lib/job-filters";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/app/favorites/favorite-button";
import { DeleteSearchButton } from "@/app/saved-searches/delete-search-button";
import { ProfileForm } from "@/app/profile/profile-form";
import { DocumentsPanel } from "@/app/dashboard/documents-panel";
import { SignOutLink } from "@/app/dashboard/sign-out-link";
import type { Profile as ProfileType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard | Niche Tech Job Board",
  description: "Your applications, saved jobs, documents, and tailored offers",
};

const PANELS = [
  "home",
  "offers",
  "applications",
  "saved-jobs",
  "saved-searches",
  "documents",
  "notifications",
  "edit-profile",
] as const;
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

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return "";
  if (min != null && max != null) return `${(min / 1000).toFixed(0)}k-${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${(min / 1000).toFixed(0)}k`;
  return `Up to ${(max! / 1000).toFixed(0)}k`;
}

function formatStatus(status: string): string {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default async function DashboardPage({
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
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, last_name, phone_number, company_name, company_website, company_logo_url, company_about, company_location, application_preference",
    )
    .eq("id", user.id)
    .single();
  if (profile?.role === "employer") redirect("/employer/dashboard");

  const [applications, savedJobs, savedSearches, tailoredJobs, notifications, lastChanceJobs, cvsRows, coverLettersRows] =
    await Promise.all([
      getApplicationsByApplicant(user.id),
      getFavoritedJobs(user.id),
      getSavedSearches(user.id),
      getTailoredJobs(user.id, 12),
      getNotifications(user.id, 30),
      getRecentJobs(3),
      supabase
        .from("user_cvs")
        .select("id, storage_path, display_name, created_at, is_default")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true }),
      supabase
        .from("user_cover_letters")
        .select("id, storage_path, display_name, created_at, is_default")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true }),
    ]);

  const cvs =
    cvsRows.data?.map(async (row) => {
      const { url } = await createSignedCvUrl(supabase, row.storage_path, 3600);
      return {
        id: row.id,
        storage_path: row.storage_path,
        display_name: row.display_name ?? null,
        fileName: getCvFileName(row.storage_path),
        downloadUrl: url ?? null,
        created_at: row.created_at,
        is_default: (row as { is_default?: boolean }).is_default ?? false,
      };
    }) ?? [];
  const cvsWithUrls = await Promise.all(cvs);

  const coverLetters =
    coverLettersRows.data?.map(async (row) => {
      const { url } = await createSignedCvUrl(supabase, row.storage_path, 3600);
      return {
        id: row.id,
        storage_path: row.storage_path,
        display_name: row.display_name ?? null,
        fileName: getCvFileName(row.storage_path),
        downloadUrl: url ?? null,
        created_at: row.created_at,
        is_default: (row as { is_default?: boolean }).is_default ?? false,
      };
    }) ?? [];
  const coverLettersWithUrls = await Promise.all(coverLetters);

  const profileData: ProfileType = {
    id: profile?.id ?? user.id,
    role: profile?.role ?? "job_seeker",
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
    home: "Your dashboard",
    offers: "Offers tailored to you",
    applications: "My applications",
    "saved-jobs": "Saved jobs",
    "saved-searches": "Saved searches",
    documents: "Documents",
    notifications: "Notifications",
    "edit-profile": "Edit profile",
  };

  const jobsInSavedSearches = tailoredJobs.length;

  return (
    <main className="min-h-screen bg-[#f4f5fb]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {activePanel === "home" ? (
          <div className="mb-8">
            <h1 className="text-[2rem] font-semibold tracking-tight text-[#202557]">
              {getGreeting()}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Check out what we have prepared for you today.
            </p>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-20">
            <Card className="rounded-2xl border border-border/60 bg-white">
              <CardContent className="p-4">
                <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-heading">
                        {profileData.full_name ?? "Your profile"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="space-y-1 text-sm">
                  {[
                    { id: "home", label: "Your desktop", icon: LayoutDashboard },
                    { id: "offers", label: "Offers tailored to you", icon: Sparkles },
                    { id: "applications", label: "My applications", icon: Briefcase },
                    { id: "saved-jobs", label: "Saved jobs", icon: Heart },
                    { id: "saved-searches", label: "Saved searches", icon: Search },
                    { id: "documents", label: "Documents", icon: FileText },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "edit-profile", label: "Edit profile", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activePanel === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.id === "home" ? "/dashboard" : `/dashboard?panel=${item.id}`}
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
                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Link href="/dashboard?panel=saved-searches">
                    <Card className="h-full rounded-2xl border border-border/50 bg-white shadow-sm transition-colors hover:bg-muted/30">
                      <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Search className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-heading">
                            {jobsInSavedSearches} job offer{jobsInSavedSearches !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">in saved searches</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/dashboard?panel=saved-jobs">
                    <Card className="h-full rounded-2xl border border-border/50 bg-white shadow-sm transition-colors hover:bg-muted/30">
                      <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Heart className="h-6 w-6 text-primary fill-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-heading">
                            {savedJobs.length} active offer{savedJobs.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">saved by you</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/dashboard?panel=documents">
                    <Card className="h-full rounded-2xl border border-primary/30 bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:col-span-2 xl:col-span-1">
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0">
                          <p className="font-semibold">Add your CV or cover letter</p>
                          <p className="mt-1 text-sm text-primary-foreground/90">
                            {cvsWithUrls.length} CV{cvsWithUrls.length !== 1 ? "s" : ""} uploaded
                          </p>
                        </div>
                        <FileBadge2 className="h-12 w-12 shrink-0 opacity-80" />
                      </CardContent>
                    </Card>
                  </Link>
                </section>

                <section className="mb-6 grid gap-6 lg:grid-cols-2">
                  <Card className="rounded-2xl border border-border/50 bg-white shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold text-heading">
                        Last chance to send your CV! 🔥
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        These offers may soon disappear from the website – apply before positions are filled.
                      </p>
                      <div className="mt-4 space-y-3">
                        {lastChanceJobs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No recent jobs right now.</p>
                        ) : (
                          lastChanceJobs.map((job) => {
                            const companyName =
                              job.employer?.company_name ?? job.employer?.full_name ?? "Company";
                            return (
                              <Link
                                key={job.id}
                                href={`/jobs/${job.slug}`}
                                className="flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/50"
                              >
                                {job.employer?.company_logo_url ? (
                                  <Image
                                    src={job.employer.company_logo_url}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="max-w-[56px] max-h-[56px] rounded-lg object-cover shrink-0"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                                    {companyName.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-heading truncate">{job.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {companyName}
                                    {job.location && ` · ${job.location}`}
                                  </p>
                                </div>
                                <Send className="h-4 w-4 shrink-0 text-muted-foreground" />
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-border/50 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <h3 className="text-lg font-semibold text-heading">
                        Status of your applications
                      </h3>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {applications.length === 0
                          ? "Why can't you see anything here? The statuses will appear after you submit your first application."
                          : `You have ${applications.length} application${applications.length !== 1 ? "s" : ""} in progress.`}
                      </p>
                      <Button asChild className="mt-4">
                        <Link href={applications.length > 0 ? "/dashboard?panel=applications" : "/jobs"}>
                          {applications.length > 0 ? "View applications" : "Show offers for me"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </section>

                <Card className="rounded-2xl border border-border/50 bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-heading">Offers tailored to you</h3>
                      {tailoredJobs.length > 0 && (
                        <Link
                          href="/dashboard?panel=offers"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View all
                        </Link>
                      )}
                    </div>
                    {tailoredJobs.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Save one or more searches to see matching offers here.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {tailoredJobs.slice(0, 5).map((job) => {
                          const companyName =
                            job.employer?.company_name ?? job.employer?.full_name ?? "Company";
                          const salaryStr = formatSalary(job.salary_min, job.salary_max);
                          return (
                            <Link
                              key={job.id}
                              href={`/jobs/${job.slug}`}
                              className="flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/50"
                            >
                              {job.employer?.company_logo_url ? (
                                <Image
                                  src={job.employer.company_logo_url}
                                  alt=""
                                  width={56}
                                  height={56}
                                  className="max-w-[56px] max-h-[56px] rounded-lg object-cover shrink-0"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                                  {companyName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-heading truncate">{job.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {companyName}
                                  {salaryStr && ` · ${salaryStr}`}
                                </p>
                              </div>
                              <Send className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[2rem] font-semibold text-[#202557]">
                  {activePanel === "documents" ? "Documents" : panelTitle[activePanel]}
                </h2>
                {activePanel !== "edit-profile" && (
                  <span className="text-sm text-muted-foreground">
                    {activePanel === "offers" && tailoredJobs.length}
                    {activePanel === "applications" && applications.length}
                    {activePanel === "saved-jobs" && savedJobs.length}
                    {activePanel === "documents" && `${cvsWithUrls.length}/3 CVs · ${coverLettersWithUrls.length}/5 cover letters`}
                    {activePanel === "saved-searches" && savedSearches.length}
                    {activePanel === "notifications" && notifications.length}
                  </span>
                )}
              </div>
              {activePanel === "documents" && (
                <p className="text-sm text-muted-foreground">
                  Adding your CV and other documents to your account will speed up your application
                  process and make applying easier. You can add up to 3 CVs and 5 cover letters.
                </p>
              )}
            </div>

            <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
              <CardContent className="p-5">
                {activePanel === "offers" && (
                  tailoredJobs.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Save one or more searches to see matching offers here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tailoredJobs.map((job) => {
                        const companyName =
                          job.employer?.company_name ?? job.employer?.full_name ?? "Company";
                        const salaryStr = formatSalary(job.salary_min, job.salary_max);
                        return (
                          <Card key={job.id} className="rounded-xl border border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {job.employer?.company_logo_url ? (
                                  <Image
                                    src={job.employer.company_logo_url}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="max-w-[56px] max-h-[56px] rounded-lg object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                                    {companyName.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <Link href={`/jobs/${job.slug}`} className="font-semibold text-heading hover:underline">
                                    {job.title}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">{companyName}</p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    <Badge variant="outline" className="rounded-full text-xs">
                                      {job.work_type}
                                    </Badge>
                                    {salaryStr && (
                                      <span className="text-xs text-muted-foreground">{salaryStr}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )
                )}

                {activePanel === "applications" && (
                  applications.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      You have not applied to any jobs yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => {
                        const job = app.job;
                        const companyName =
                          job.employer?.company_name ?? job.employer?.full_name ?? "Company";
                        return (
                          <Card key={app.id} className="rounded-xl border border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <Link href={`/jobs/${job.slug}`} className="font-semibold text-heading hover:underline">
                                    {job.title}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {companyName} · Applied {formatRelativeTime(app.applied_at)}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    <Badge variant="secondary" className="rounded-full text-xs">
                                      {formatStatus(app.status)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )
                )}

                {activePanel === "saved-jobs" && (
                  savedJobs.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No saved jobs yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {savedJobs.map((job) => {
                        const companyName =
                          job.employer?.company_name ?? job.employer?.full_name ?? "Company";
                        const salaryStr = formatSalary(job.salary_min, job.salary_max);
                        return (
                          <Card key={job.id} className="rounded-xl border border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {job.employer?.company_logo_url ? (
                                  <Image
                                    src={job.employer.company_logo_url}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="max-w-[56px] max-h-[56px] rounded-lg object-cover shrink-0"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                                    {companyName.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <Link href={`/jobs/${job.slug}`} className="font-semibold text-heading hover:underline">
                                    {job.title}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">{companyName}</p>
                                  {salaryStr && <p className="text-xs text-muted-foreground">{salaryStr}</p>}
                                </div>
                                <FavoriteButton
                                  jobId={job.id}
                                  initialIsFavorited={true}
                                  isLoggedIn={true}
                                  variant="icon"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )
                )}

                {activePanel === "saved-searches" && (
                  savedSearches.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No saved searches yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {savedSearches.map((search) => {
                        const queryString = buildJobsQueryString(search.filters);
                        const summary = formatFiltersSummary(search.filters);
                        return (
                          <Card key={search.id} className="rounded-xl border border-border/60">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-heading">{search.name}</p>
                                  {summary && <p className="truncate text-sm text-muted-foreground">{summary}</p>}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <Button asChild size="sm">
                                    <Link href={`/jobs${queryString}`}>Run search</Link>
                                  </Button>
                                  <DeleteSearchButton searchId={search.id} searchName={search.name} />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )
                )}

                {activePanel === "documents" && (
                  <DocumentsPanel cvs={cvsWithUrls} coverLetters={coverLettersWithUrls} />
                )}

                {activePanel === "notifications" && (
                  notifications.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No notifications yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => {
                        const label = notification.payload?.saved_search_name
                          ? `New job for "${notification.payload.saved_search_name}"`
                          : "New job match";
                        const href = notification.payload?.job_slug
                          ? `/jobs/${notification.payload.job_slug}`
                          : "/jobs";
                        return (
                          <div key={notification.id} className="rounded-lg border border-border/60 p-3">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="truncate text-sm text-muted-foreground">
                              {notification.payload?.job_title ?? "New matching job"}
                            </p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(notification.created_at)}
                              </span>
                              <Link href={href} className="text-xs text-primary hover:underline">
                                Open
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {activePanel === "edit-profile" && (
                  <ProfileForm profile={profileData} />
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
