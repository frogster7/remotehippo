import {
  getRecentJobs,
  getActiveJobCount,
  getFilterOptions,
  getJobsForLatestRecommendations,
  getJobsWithSalaries,
  getFavoritedJobIds,
} from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { ThumbsUp, Clock, Banknote, Eye } from "lucide-react";
import { HomeHero } from "./_components/home-hero";
import { JobsDiscoverSection } from "./_components/jobs-discover-section";
import { HomeBlogSection } from "./_components/home-blog-section";

const SLIDER_LIMIT = 12;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then((r) => r.data)
    : null;
  const isEmployer = profile?.role === "employer";

  const [
    jobCount,
    latestRecommendations,
    recentJobs,
    jobsWithSalaries,
    filterOptions,
    favoritedJobIds,
  ] = await Promise.all([
    getActiveJobCount(),
    getJobsForLatestRecommendations(SLIDER_LIMIT),
    getRecentJobs(SLIDER_LIMIT),
    getJobsWithSalaries(SLIDER_LIMIT),
    getFilterOptions(),
    getFavoritedJobIds(user?.id),
  ]);

  // Recently viewed: mock for now – empty or reuse recent jobs
  const recentlyViewedJobs = recentJobs.slice(0, 6);
  const showOffersWithSalaries = jobsWithSalaries.length >= 4;

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-background"
      suppressHydrationWarning
    >
      <HomeHero
        jobCount={jobCount}
        roles={filterOptions.roles}
        tech={filterOptions.tech}
      />
      <JobsDiscoverSection
        subheading="Latest recommendations"
        jobs={latestRecommendations}
        favoritedJobIds={favoritedJobIds}
        isLoggedIn={!!user}
        isEmployer={isEmployer}
        icon={<ThumbsUp className="h-6 w-6 md:h-7 md:w-7" />}
        sectionIndex={0}
      />
      <JobsDiscoverSection
        subheading="Recently posted"
        jobs={recentJobs}
        favoritedJobIds={favoritedJobIds}
        isLoggedIn={!!user}
        isEmployer={isEmployer}
        icon={<Clock className="h-6 w-6 md:h-7 md:w-7" />}
        sectionIndex={1}
      />
      {showOffersWithSalaries && (
        <JobsDiscoverSection
          subheading="Offers with salaries"
          jobs={jobsWithSalaries}
          favoritedJobIds={favoritedJobIds}
          isLoggedIn={!!user}
          isEmployer={isEmployer}
          icon={<Banknote className="h-6 w-6 md:h-7 md:w-7" />}
          sectionIndex={2}
        />
      )}
      <JobsDiscoverSection
        subheading="Recently viewed"
        jobs={recentlyViewedJobs}
        favoritedJobIds={favoritedJobIds}
        isLoggedIn={!!user}
        isEmployer={isEmployer}
        icon={<Eye className="h-6 w-6 md:h-7 md:w-7" />}
        sectionIndex={showOffersWithSalaries ? 3 : 2}
      />
      <HomeBlogSection sectionIndex={showOffersWithSalaries ? 4 : 3} />
    </main>
  );
}
