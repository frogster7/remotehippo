import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getEmployerPublicProfile,
  getActiveJobsByEmployer,
  getFavoritedJobIds,
} from "@/lib/jobs";
import {
  getCompanyBanners,
  getCompanyBenefits,
  getCompanyHiringSteps,
  getCompanyGallery,
} from "@/lib/company-profile";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { JobCard } from "@/app/jobs/job-card";
import { BannerSlider } from "@/app/jobs/[slug]/banner-slider";
import { getSiteUrl } from "@/lib/site";
import { CompanyPageNav } from "./company-page-nav";
import { GalleryLightbox } from "./gallery-lightbox";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getEmployerPublicProfile(id);
  if (!profile) return { title: "Company not found" };
  const name =
    profile.company_name?.trim() || profile.full_name?.trim() || "Company";
  const title = `${name} | Jobs`;
  const description =
    profile.company_about?.trim().slice(0, 155) ||
    (profile.company_website
      ? `Remote-friendly tech jobs at ${name}. View open positions.`
      : `Tech jobs at ${name}. View open positions.`);
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
  const [profile, jobs, banners, benefits, hiringSteps, gallery] =
    await Promise.all([
      getEmployerPublicProfile(id),
      getActiveJobsByEmployer(id),
      getCompanyBanners(id),
      getCompanyBenefits(id),
      getCompanyHiringSteps(id),
      getCompanyGallery(id),
    ]);
  if (!profile) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const favoritedJobIds = await getFavoritedJobIds(user?.id);

  const companyName =
    profile.company_name?.trim() || profile.full_name?.trim() || "Company";

  const hasRemoteWork = jobs.some(
    (j) => j.work_type === "remote" || j.work_type === "hybrid",
  );

  const hasAbout = !!profile.company_about?.trim();
  const hasJobs = jobs.length > 0;
  const hasBenefits = benefits.length > 0;
  const hasHiringProcess = hiringSteps.length > 0;
  const hasGallery = gallery.length > 0;

  const visibleSectionIds = [
    hasAbout && "about",
    hasJobs && "open-positions",
    hasBenefits && "benefits",
    hasHiringProcess && "hiring-process",
    hasGallery && "gallery",
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-8 pb-[13vh]">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to jobs
        </Link>

        {/* Banner */}
        <section className="mb-2">
          {banners.length > 0 ? (
            <BannerSlider banners={banners} />
          ) : (
            <div
              className="mx-auto h-[200px] min-h-[200px] w-full max-w-[1200px] rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-muted/20 to-primary/10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          )}
        </section>

        {/* Sticky section nav (only when there are sections to show) */}
        {visibleSectionIds.length > 0 && (
          <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-border/50 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CompanyPageNav visibleSectionIds={visibleSectionIds} />
          </div>
        )}

        {/* Company logo, name, and stats badges */}
        <header className="mb-8 flex flex-wrap items-start gap-4">
          {profile.company_logo_url ? (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background p-2 dark:bg-white">
              <Image
                src={profile.company_logo_url}
                alt=""
                width={72}
                height={72}
                className="rounded-lg object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted text-2xl font-semibold text-muted-foreground">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              {companyName}
            </h1>
            {profile.company_location?.trim() && (
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span aria-hidden>📍</span>
                {profile.company_location}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                {jobs.length} job {jobs.length === 1 ? "offer" : "offers"}
              </span>
              {hasRemoteWork && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />
                  Possibility of remote work
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-12">
          {/* About – only if company filled it */}
          {hasAbout && (
            <section id="about" className="scroll-mt-24">
              <h2 className="mb-4 text-lg font-semibold text-heading">About</h2>
              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="space-y-3 text-muted-foreground">
                  {profile.company_about?.trim() && (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {profile.company_about}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Open positions – only if there are jobs */}
          {hasJobs && (
            <section id="open-positions" className="scroll-mt-24">
              <h2 className="mb-4 text-lg font-semibold text-heading">
                Open positions ({jobs.length})
              </h2>
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
            </section>
          )}

          {/* Benefits – only if company added any */}
          {hasBenefits && (
            <section id="benefits" className="scroll-mt-24">
              <h2 className="mb-4 text-lg font-semibold text-heading">
                Benefits
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {benefits.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="border-l-4 border-primary/80 pl-4">
                      <p className="font-semibold text-heading">{b.title}</p>
                      {b.description?.trim() && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {b.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Hiring process – only if company added steps */}
          {hasHiringProcess && (
            <section id="hiring-process" className="scroll-mt-24">
              <h2 className="mb-4 text-lg font-semibold text-heading">
                Hiring process
              </h2>
              <ol className="relative space-y-0">
                {/* Vertical timeline line */}
                <span
                  className="absolute left-4 top-6 bottom-6 w-px bg-gradient-to-b from-primary/40 via-primary/30 to-primary/20"
                  aria-hidden
                />
                {hiringSteps.map((step, i) => (
                  <li
                    key={step.id}
                    className="relative flex gap-5 pb-8 last:pb-0"
                  >
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary shadow-sm">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                      <p className="font-semibold text-heading">{step.title}</p>
                      {step.description?.trim() && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Gallery – only if company added images */}
          {hasGallery && (
            <section id="gallery" className="scroll-mt-24 pb-16">
              <h2 className="mb-4 text-lg font-semibold text-heading">
                Gallery
              </h2>
              <GalleryLightbox
                items={gallery.map((item) => ({
                  id: item.id,
                  url: item.url,
                  caption: item.caption ?? null,
                }))}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
