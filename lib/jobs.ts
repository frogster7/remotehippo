import { createClient } from "@/lib/supabase/server";
import type { Job, JobFilters } from "@/lib/types";

/** Fetch active jobs with optional filters. Used for /jobs list. */
export async function getJobs(filters: JobFilters = {}): Promise<Job[]> {
  const supabase = await createClient();
  let query = supabase
    .from("jobs")
    .select(
      "id, employer_id, title, slug, description, tech_stack, role, work_type, job_type, salary_min, salary_max, location, eu_timezone_friendly, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.work_type) {
    query = query.eq("work_type", filters.work_type);
  }
  if (filters.job_type) {
    query = query.eq("job_type", filters.job_type);
  }
  if (filters.role?.trim()) {
    query = query.ilike("role", `%${filters.role.trim()}%`);
  }
  if (filters.tech?.trim()) {
    query = query.contains("tech_stack", [filters.tech.trim()]);
  }
  if (filters.salary_min != null && filters.salary_min > 0) {
    query = query.gte("salary_max", filters.salary_min); // job's max must be >= filter min
  }
  if (filters.salary_max != null && filters.salary_max > 0) {
    query = query.lte("salary_min", filters.salary_max); // job's min must be <= filter max
  }
  if (filters.q?.trim()) {
    const q = `%${filters.q.trim()}%`;
    query = query.or(`title.ilike.${q},description.ilike.${q},role.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Job[];
}

/** Fetch a single job by slug with employer profile. Used for /jobs/[slug]. */
export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();
  const { data: row, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id, employer_id, title, slug, description, tech_stack, role, work_type, job_type,
      salary_min, salary_max, location, eu_timezone_friendly, is_active, created_at, updated_at,
      profiles(id, full_name, company_name, company_website, company_logo_url)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (jobError || !row) return null;

  const { profiles, ...rest } = row as typeof row & {
    profiles: Job["employer"] | null;
  };
  return { ...rest, employer: profiles ?? undefined } as Job;
}

/** All active job slugs (for sitemap). */
export async function getActiveJobSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("slug")
    .eq("is_active", true);
  if (error) throw error;
  return (data ?? []).map((row) => row.slug);
}

/** All distinct roles and tech_stack values for filter dropdowns (optional). */
export async function getFilterOptions(): Promise<{
  roles: string[];
  tech: string[];
}> {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("role, tech_stack")
    .eq("is_active", true);

  const roles = Array.from(
    new Set((jobs ?? []).map((j) => j.role).filter(Boolean)),
  ) as string[];
  const tech = Array.from(
    new Set((jobs ?? []).flatMap((j) => j.tech_stack ?? []).filter(Boolean)),
  ) as string[];
  return { roles: roles.sort(), tech: tech.sort() };
}

/** Slug base from title (lowercase, hyphens, alphanumeric). */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "job";
}

/** Generate a unique slug for a new job (slug base + short random suffix). */
export function generateJobSlug(title: string): string {
  const base = slugifyTitle(title);
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

/** All jobs for an employer (active + inactive). Used for dashboard. */
export async function getEmployerJobs(employerId: string): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, slug, description, tech_stack, role, work_type, job_type, salary_min, salary_max, location, eu_timezone_friendly, is_active, created_at, updated_at",
    )
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
}

/** Single job by id for edit; RLS ensures only owner can read. */
export async function getJobByIdForEdit(jobId: string): Promise<Job | null> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, slug, description, tech_stack, role, work_type, job_type, salary_min, salary_max, location, eu_timezone_friendly, is_active, created_at, updated_at",
    )
    .eq("id", jobId)
    .single();
  if (error || !row) return null;
  return row as Job;
}

/** Check if a job is favorited by a user. Returns true/false, or false if not logged in. */
export async function isJobFavorited(
  jobId: string,
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .single();
  return !!data && !error;
}

/** Get all favorited jobs for a user (with employer profile). */
export async function getFavoritedJobs(userId: string): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_favorites")
    .select(
      `
      job_id,
      jobs (
        id, employer_id, title, slug, description, tech_stack, role, work_type, job_type,
        salary_min, salary_max, location, eu_timezone_friendly, is_active, created_at, updated_at,
        profiles(id, full_name, company_name, company_website, company_logo_url)
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Flatten and attach employer profile
  return data
    .filter((row) => row.jobs) // filter out deleted jobs
    .map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job = row.jobs as any;
      const { profiles, ...rest } = job;
      return { ...rest, employer: profiles ?? undefined } as Job;
    });
}

/** Get all favorited job IDs for a user (fast lookup for list view). */
export async function getFavoritedJobIds(
  userId: string | undefined,
): Promise<Set<string>> {
  if (!userId) return new Set();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_favorites")
    .select("job_id")
    .eq("user_id", userId);

  if (error || !data) return new Set();
  return new Set(data.map((row) => row.job_id));
}
