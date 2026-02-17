import type { JobFilters, WorkType, JobType } from "@/lib/types";

export function getParamArray(
  searchParams: Record<string, string | string[] | undefined>,
  k: string
): string[] {
  const v = searchParams[k];
  if (v == null) return [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
  return v.trim() ? [v] : [];
}

export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): JobFilters {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const salaryMin = get("salary_min");
  const salaryMax = get("salary_max");
  return {
    q: get("q") ?? undefined,
    location: get("location") ?? undefined,
    roles: getParamArray(searchParams, "role"),
    work_types: getParamArray(searchParams, "work_type") as WorkType[],
    job_type: (get("job_type") as JobType) ?? undefined,
    tech: getParamArray(searchParams, "tech"),
    salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
    salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
  };
}

export function buildJobsQueryString(filters: JobFilters): string {
  const p = new URLSearchParams();
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  if (filters.location?.trim()) p.set("location", filters.location.trim());
  filters.roles?.forEach((r) => p.append("role", r));
  filters.work_types?.forEach((w) => p.append("work_type", w));
  if (filters.job_type) p.set("job_type", filters.job_type);
  filters.tech?.forEach((t) => p.append("tech", t));
  if (filters.salary_min != null && filters.salary_min > 0) p.set("salary_min", String(filters.salary_min));
  if (filters.salary_max != null && filters.salary_max > 0) p.set("salary_max", String(filters.salary_max));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

/** Short summary of active filters for display (e.g. on saved search cards). */
export function formatFiltersSummary(filters: JobFilters): string {
  const parts: string[] = [];
  if (filters.q?.trim()) parts.push(`"${filters.q}"`);
  filters.roles?.forEach((r) => parts.push(r));
  if (filters.location?.trim()) parts.push(filters.location);
  filters.work_types?.forEach((w) => parts.push(w));
  if (filters.job_type) parts.push(filters.job_type);
  filters.tech?.forEach((t) => parts.push(t));
  if (filters.salary_min != null && filters.salary_min > 0)
    parts.push(`Min ${(filters.salary_min / 1000).toFixed(0)}k`);
  if (filters.salary_max != null && filters.salary_max > 0)
    parts.push(`Max ${(filters.salary_max / 1000).toFixed(0)}k`);
  return parts.length > 0 ? parts.join(" · ") : "All jobs";
}
