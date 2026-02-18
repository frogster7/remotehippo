import {
  getRecentJobs,
  getActiveJobCount,
  getFilterOptions,
  getEmployersForHomepage,
  getFavoritedJobIds,
} from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { HomeHero } from "./_components/home-hero";
import { RecentJobs } from "./_components/recent-jobs";
import { CompaniesWorthKnowing } from "./_components/companies-worth-knowing";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [jobCount, recentJobs, filterOptions, employers, favoritedJobIds] =
    await Promise.all([
      getActiveJobCount(),
      getRecentJobs(6),
      getFilterOptions(),
      getEmployersForHomepage(8),
      getFavoritedJobIds(user?.id),
    ]);

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <HomeHero
        jobCount={jobCount}
        roles={filterOptions.roles}
        tech={filterOptions.tech}
      />
      <RecentJobs
        jobs={recentJobs}
        favoritedJobIds={favoritedJobIds}
        isLoggedIn={!!user}
      />
      <CompaniesWorthKnowing employers={employers} />
    </main>
  );
}
