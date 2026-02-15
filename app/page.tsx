import { getRecentJobs, getActiveJobCount, getFilterOptions } from "@/lib/jobs";
import { HomeHero } from "./_components/home-hero";
import { RecentJobs } from "./_components/recent-jobs";

export default async function HomePage() {
  const [jobCount, recentJobs, filterOptions] = await Promise.all([
    getActiveJobCount(),
    getRecentJobs(6),
    getFilterOptions(),
  ]);

  return (
    <main className="min-h-screen">
      <HomeHero
        jobCount={jobCount}
        roles={filterOptions.roles}
        tech={filterOptions.tech}
      />
      <RecentJobs jobs={recentJobs} />
    </main>
  );
}
