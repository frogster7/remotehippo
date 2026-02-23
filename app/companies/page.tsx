import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getEmployersForCompaniesPage,
  getCompaniesForDiscoverSection,
} from "@/lib/jobs";
import { CompaniesSearchBar } from "./companies-search-bar";
import { CompaniesSearchSlider } from "./companies-search-slider";
import { DiscoverSection } from "./discover-section";
import { MOCK_COMPANIES } from "./mock-companies";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Companies | Niche Tech Job Board",
  description: "Browse tech companies with open positions.",
  openGraph: {
    title: "Companies | Niche Tech Job Board",
    description: "Browse tech companies with open positions.",
    url: `${getSiteUrl()}/companies`,
    type: "website",
  },
};

const DISCOVER_LIMIT = 12;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q ?? "";
  const [
    searchResults,
    theyRecruitTheMostRaw,
    mostRecommendedRaw,
  ] = await Promise.all([
    getEmployersForCompaniesPage(q || undefined),
    getCompaniesForDiscoverSection("most_jobs", DISCOVER_LIMIT),
    getCompaniesForDiscoverSection("most_recommended", DISCOVER_LIMIT),
  ]);

  // Pad with mock companies so sliders are visible when there are few real ones
  const minForSlider = 5;
  const theyRecruitTheMost =
    theyRecruitTheMostRaw.length >= minForSlider
      ? theyRecruitTheMostRaw
      : [...theyRecruitTheMostRaw, ...MOCK_COMPANIES].slice(0, DISCOVER_LIMIT);
  const mostRecommended =
    mostRecommendedRaw.length >= minForSlider
      ? mostRecommendedRaw
      : [...mostRecommendedRaw, ...MOCK_COMPANIES].slice(0, DISCOVER_LIMIT);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-[1140px] px-4 pb-14 pt-6 sm:pt-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-7 shadow-sm sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]"
            aria-hidden
          />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Curated companies
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-heading sm:text-3xl md:text-4xl">
              Discover the best jobs.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              They recruit the most. Browse companies with open positions and
              find your next role.
            </p>
          </div>
        </section>

        {/* Search bar – jobs page style */}
        <div className="sticky top-0 z-20 mt-4 bg-background/90 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <Suspense
            fallback={
              <div className="h-16 animate-pulse rounded-2xl border border-border/80 bg-card" />
            }
          >
            <CompaniesSearchBar />
          </Suspense>
        </div>

        {/* Search results first when user has searched */}
        {q && (
          <section className="pt-6 pb-4">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold tracking-tight text-heading md:text-2xl">
                Search results
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Companies matching &quot;{q}&quot;
              </p>
            </div>
            <CompaniesSearchSlider companies={searchResults} query={q} />
          </section>
        )}

        {/* They recruit the most */}
        <DiscoverSection
          subheading="They recruit the most"
          companies={theyRecruitTheMost}
        />

        {/* Most recommended */}
        <DiscoverSection
          subheading="Most recommended"
          companies={mostRecommended}
        />

        {/* All companies when no search – show full list as a section */}
        {!q && searchResults.length > 0 && (
          <section className="pt-4 pb-8">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold tracking-tight text-heading md:text-2xl">
                All companies
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchResults.length} companies with open positions
              </p>
            </div>
            <CompaniesSearchSlider
              companies={searchResults}
              query=""
            />
          </section>
        )}
      </div>
    </main>
  );
}
