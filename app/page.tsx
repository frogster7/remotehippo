import {
  getRecentJobs,
  getActiveJobCount,
  getFilterOptions,
  getEmployersForHomepage,
} from "@/lib/jobs";
import { HomeHero } from "./_components/home-hero";
import { RecentJobs } from "./_components/recent-jobs";
import { CompaniesWorthKnowing } from "./_components/companies-worth-knowing";

export default async function HomePage() {
  const [jobCount, recentJobs, filterOptions, employers] = await Promise.all([
    getActiveJobCount(),
    getRecentJobs(6),
    getFilterOptions(),
    getEmployersForHomepage(8),
  ]);

  return (
    <main className="min-h-screen" suppressHydrationWarning>
      <HomeHero
        jobCount={jobCount}
        roles={filterOptions.roles}
        tech={filterOptions.tech}
      />
      <RecentJobs jobs={recentJobs} />
      <CompaniesWorthKnowing employers={employers} />
    </main>
  );
}
