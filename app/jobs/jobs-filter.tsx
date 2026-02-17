"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { WORK_TYPES, JOB_TYPES } from "@/lib/types";
import type { JobFilters, WorkType } from "@/lib/types";
import { SaveSearchButton } from "./save-search-button";

function getFiltersFromSearchParams(sp: URLSearchParams): Partial<JobFilters> {
  const salaryMin = sp.get("salary_min");
  const salaryMax = sp.get("salary_max");
  const roles = sp.getAll("role").filter(Boolean);
  const tech = sp.getAll("tech").filter(Boolean);
  const workTypes = sp
    .getAll("work_type")
    .filter((w): w is WorkType => w === "remote" || w === "hybrid");
  return {
    q: sp.get("q") ?? undefined,
    location: sp.get("location") ?? undefined,
    roles: roles.length ? roles : undefined,
    work_types: workTypes.length ? workTypes : undefined,
    job_type: (sp.get("job_type") as JobFilters["job_type"]) ?? undefined,
    tech: tech.length ? tech : undefined,
    salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
    salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
  };
}

function filtersToParams(f: Partial<JobFilters>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q?.trim()) p.set("q", f.q.trim());
  if (f.location?.trim()) p.set("location", f.location.trim());
  f.roles?.forEach((r) => p.append("role", r));
  f.work_types?.forEach((w) => p.append("work_type", w));
  if (f.job_type) p.set("job_type", f.job_type);
  f.tech?.forEach((t) => p.append("tech", t));
  if (f.salary_min != null && f.salary_min > 0)
    p.set("salary_min", String(f.salary_min));
  if (f.salary_max != null && f.salary_max > 0)
    p.set("salary_max", String(f.salary_max));
  return p;
}

type ActiveFilterItem = {
  key: keyof JobFilters;
  label: string;
  value?: string;
};

function getActiveFilterLabels(
  filters: Partial<JobFilters>,
): ActiveFilterItem[] {
  const items: ActiveFilterItem[] = [];
  if (filters.q?.trim())
    items.push({ key: "q", label: `Search: "${filters.q}"` });
  filters.roles?.forEach((r) =>
    items.push({ key: "roles", label: `Role: ${r}`, value: r }),
  );
  if (filters.location?.trim())
    items.push({ key: "location", label: `Location: ${filters.location}` });
  filters.work_types?.forEach((w) =>
    items.push({ key: "work_types", label: `Work: ${w}`, value: w }),
  );
  if (filters.job_type)
    items.push({ key: "job_type", label: `Work time: ${filters.job_type}` });
  filters.tech?.forEach((t) =>
    items.push({ key: "tech", label: `Tech: ${t}`, value: t }),
  );
  if (filters.salary_min != null && filters.salary_min > 0)
    items.push({
      key: "salary_min",
      label: `Min salary: ${(filters.salary_min / 1000).toFixed(0)}k`,
    });
  if (filters.salary_max != null && filters.salary_max > 0)
    items.push({
      key: "salary_max",
      label: `Max salary: ${(filters.salary_max / 1000).toFixed(0)}k`,
    });
  return items;
}

export function JobsFilter({
  roles,
  techOptions,
  isLoggedIn = false,
}: {
  roles: string[];
  techOptions: string[];
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = getFiltersFromSearchParams(searchParams);
  const activeFilters = getActiveFilterLabels(filters);

  const updateFilters = useCallback(
    (next: Partial<JobFilters>) => {
      const merged = { ...filters, ...next };
      const params = filtersToParams(merged);
      const query = params.toString();
      router.push(query ? `/jobs?${query}` : "/jobs");
    },
    [filters, router],
  );

  const clearFilters = useCallback(() => {
    router.push("/jobs");
  }, [router]);

  const removeFilter = useCallback(
    (key: keyof JobFilters, value?: string) => {
      const next = { ...filters };
      if (
        value !== undefined &&
        (key === "roles" || key === "tech" || key === "work_types")
      ) {
        const prev = next[key] as string[] | undefined;
        const arr = prev?.filter((v) => v !== value);
        if (key === "work_types") {
          next.work_types = arr?.length ? (arr as WorkType[]) : undefined;
        } else if (key === "roles") {
          next.roles = arr?.length ? arr : undefined;
        } else {
          next.tech = arr?.length ? arr : undefined;
        }
      } else {
        (next as Record<string, unknown>)[key] = undefined;
      }
      const params = filtersToParams(next);
      const query = params.toString();
      router.push(query ? `/jobs?${query}` : "/jobs");
    },
    [filters, router],
  );

  return (
    <div className="space-y-4">
      {/* Active filters card */}
      {activeFilters.length > 0 && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium">
                Active filters ({activeFilters.length})
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map(({ key, label, value }) => (
              <span
                key={value !== undefined ? `${key}:${value}` : key}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeFilter(key, value)}
                  className="rounded p-0.5 hover:bg-primary/20"
                  aria-label={`Remove filter: ${label}`}
                >
                  <span aria-hidden>×</span>
                </button>
              </span>
            ))}
          </div>
          {isLoggedIn && (
            <div className="mt-4 pt-3 border-t">
              <SaveSearchButton filters={filters as JobFilters} />
            </div>
          )}
        </div>
      )}

      {/* Search & filters card */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Filters</h2>
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Search
            </label>
            <Input
              id="search"
              placeholder="Title, role, keyword…"
              defaultValue={filters.q}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (filters.q ?? ""))
                  updateFilters({ q: v || undefined });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Location
            </label>
            <Input
              id="location"
              placeholder="City, country…"
              defaultValue={filters.location}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (filters.location ?? ""))
                  updateFilters({ location: v || undefined });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Role
            </label>
            <Select
              value="add"
              onValueChange={(v) => {
                if (v === "add") return;
                const next = [...(filters.roles ?? []), v];
                updateFilters({ roles: next });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add role…</SelectItem>
                {roles
                  .filter((r) => !filters.roles?.includes(r))
                  .map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Work type
            </label>
            <div className="flex flex-wrap gap-3">
              {WORK_TYPES.map(({ value: w, label }) => {
                const checked = filters.work_types?.includes(w) ?? false;
                return (
                  <div key={w} className="flex items-center space-x-2">
                    <Checkbox
                      id={`work_${w}`}
                      checked={checked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...(filters.work_types ?? []), w]
                          : (filters.work_types ?? []).filter((x) => x !== w);
                        updateFilters({
                          work_types: next.length ? next : undefined,
                        });
                      }}
                    />
                    <label
                      htmlFor={`work_${w}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work time */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Work time
            </label>
            <Select
              value={filters.job_type ?? "all"}
              onValueChange={(v) =>
                updateFilters({
                  job_type:
                    v === "all" ? undefined : (v as JobFilters["job_type"]),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {JOB_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tech */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Tech
            </label>
            <Select
              value="add"
              onValueChange={(v) => {
                if (v === "add") return;
                const next = [...(filters.tech ?? []), v];
                updateFilters({ tech: next });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add tech" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add tech…</SelectItem>
                {techOptions
                  .filter((t) => !filters.tech?.includes(t))
                  .map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salary */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Salary (k)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={
                  filters.salary_min
                    ? (filters.salary_min / 1000).toString()
                    : ""
                }
                onBlur={(e) => {
                  const n = parseInt(e.target.value, 10);
                  updateFilters({
                    salary_min:
                      Number.isFinite(n) && n > 0 ? n * 1000 : undefined,
                  });
                }}
              />
              <Input
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={
                  filters.salary_max
                    ? (filters.salary_max / 1000).toString()
                    : ""
                }
                onBlur={(e) => {
                  const n = parseInt(e.target.value, 10);
                  updateFilters({
                    salary_max:
                      Number.isFinite(n) && n > 0 ? n * 1000 : undefined,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
