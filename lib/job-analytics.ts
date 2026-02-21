import { createClient } from "@/lib/supabase/server";

/** Record a job detail page view. Call from job detail page (server component). */
export async function recordJobView(jobId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("job_views").insert({ job_id: jobId });
}

/** Record an apply click/landing. Call from apply page (server component). */
export async function recordApplyClick(jobId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("job_apply_clicks").insert({ job_id: jobId });
}

export type JobStat = {
  job_id: string;
  title: string;
  slug: string;
  views: number;
  apply_clicks: number;
  applications: number;
};

export type EmployerStats = {
  perJob: JobStat[];
  totals: { views: number; apply_clicks: number; applications: number; jobs: number };
};

/** Get analytics for all jobs belonging to an employer. */
export async function getJobStats(employerId: string): Promise<EmployerStats> {
  const supabase = await createClient();

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, slug")
    .eq("employer_id", employerId);

  if (jobsError || !jobs) return { perJob: [], totals: { views: 0, apply_clicks: 0, applications: 0, jobs: 0 } };

  const jobIds = jobs.map((j) => j.id);

  const [viewsResult, clicksResult, appsResult] = await Promise.all([
    supabase
      .from("job_views")
      .select("job_id")
      .in("job_id", jobIds),
    supabase
      .from("job_apply_clicks")
      .select("job_id")
      .in("job_id", jobIds),
    supabase
      .from("applications")
      .select("job_id")
      .in("job_id", jobIds),
  ]);

  const countByJob = (rows: { job_id: string }[] | null): Record<string, number> => {
    const out: Record<string, number> = {};
    (rows ?? []).forEach((r) => {
      out[r.job_id] = (out[r.job_id] ?? 0) + 1;
    });
    return out;
  };

  const viewsByJob = countByJob(viewsResult.data);
  const clicksByJob = countByJob(clicksResult.data);
  const appsByJob = countByJob(appsResult.data);

  const perJob: JobStat[] = jobs.map((job) => ({
    job_id: job.id,
    title: job.title,
    slug: job.slug,
    views: viewsByJob[job.id] ?? 0,
    apply_clicks: clicksByJob[job.id] ?? 0,
    applications: appsByJob[job.id] ?? 0,
  }));

  const totals = {
    views: perJob.reduce((s, j) => s + j.views, 0),
    apply_clicks: perJob.reduce((s, j) => s + j.apply_clicks, 0),
    applications: perJob.reduce((s, j) => s + j.applications, 0),
    jobs: perJob.length,
  };

  return { perJob, totals };
}
