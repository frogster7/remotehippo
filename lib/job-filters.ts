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
  const jobTypes = getParamArray(searchParams, "job_type") as JobType[];
  return {
    q: get("q") ?? undefined,
    location: get("location") ?? undefined,
    roles: getParamArray(searchParams, "role"),
    work_types: getParamArray(searchParams, "work_type") as WorkType[],
    job_type: jobTypes[0] ?? (get("job_type") as JobType) ?? undefined,
    job_types: jobTypes.length ? jobTypes : undefined,
    tech: getParamArray(searchParams, "tech"),
  };
}

export function buildJobsQueryString(filters: JobFilters): string {
  const p = new URLSearchParams();
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  if (filters.location?.trim()) p.set("location", filters.location.trim());
  filters.roles?.forEach((r) => p.append("role", r));
  filters.work_types?.forEach((w) => p.append("work_type", w));
  if (filters.job_types?.length) {
    filters.job_types.forEach((t) => p.append("job_type", t));
  } else if (filters.job_type) {
    p.set("job_type", filters.job_type);
  }
  filters.tech?.forEach((t) => p.append("tech", t));
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
  if (filters.job_types?.length) {
    filters.job_types.forEach((t) => parts.push(t));
  } else if (filters.job_type) parts.push(filters.job_type);
  filters.tech?.forEach((t) => parts.push(t));
  return parts.length > 0 ? parts.join(" · ") : "All jobs";
}
