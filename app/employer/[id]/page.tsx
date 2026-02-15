import Link from "next/link";
import Image from "next/image";
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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          ← Back to jobs
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              {profile.company_logo_url ? (
                <Image
                  src={profile.company_logo_url}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
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
          <h2 className="text-lg font-semibold mb-4">
            Open positions ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <Card>
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
