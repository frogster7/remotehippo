import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getEmployerPublicProfile,
  getActiveJobsByEmployer,
  getFavoritedJobIds,
} from "@/lib/jobs";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobCard } from "@/app/jobs/job-card";
import { getSiteUrl } from "@/lib/site";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getEmployerPublicProfile(id);
  if (!profile) return { title: "Company not found" };
  const name =
    profile.company_name?.trim() || profile.full_name?.trim() || "Company";
  const title = `${name} | Jobs`;
  const description = profile.company_website
    ? `Remote-friendly tech jobs at ${name}. View open positions.`
    : `Tech jobs at ${name}. View open positions.`;
  const canonical = `${getSiteUrl()}/employer/${id}`;
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
  };
}

export default async function EmployerPublicPage({ params }: Props) {
  const { id } = await params;
  const [profile, jobs] = await Promise.all([
    getEmployerPublicProfile(id),
    getActiveJobsByEmployer(id),
  ]);
  if (!profile) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const favoritedJobIds = await getFavoritedJobIds(user?.id);

  const companyName =
    profile.company_name?.trim() || profile.full_name?.trim() || "Company";

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to jobs
        </Link>

        <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              {profile.company_logo_url ? (
                <div className="rounded-2xl border border-border/70 bg-background p-2">
                  <Image
                    src={profile.company_logo_url}
                    alt=""
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-muted text-xl font-semibold text-muted-foreground">
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {companyName}
                </h1>
                {profile.company_website && (
                  <a
                    href={profile.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:underline mt-1 inline-block"
                  >
                    {profile.company_website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-heading">
            Open positions ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-border/80 bg-card shadow-sm">
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No open positions right now.</p>
                <Link href="/jobs" className="text-primary hover:underline mt-2 inline-block">
                  Browse all jobs
                </Link>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobCard
                    job={job}
                    postedAt={formatRelativeTime(job.created_at)}
                    isFavorited={favoritedJobIds.has(job.id)}
                    isLoggedIn={!!user}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
