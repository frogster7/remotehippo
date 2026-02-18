"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, Trash2, MapPin } from "lucide-react";
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
import type { JobFilters, WorkType, JobType } from "@/lib/types";
import { SaveSearchButton } from "./save-search-button";

function getFiltersFromSearchParams(sp: URLSearchParams): Partial<JobFilters> {
  const salaryMin = sp.get("salary_min");
  const salaryMax = sp.get("salary_max");
  const roles = sp.getAll("role").filter(Boolean);
  const tech = sp.getAll("tech").filter(Boolean);
  const workTypes = sp
    .getAll("work_type")
    .filter((w): w is WorkType => w === "remote" || w === "hybrid");
  const jobTypes = sp
    .getAll("job_type")
    .filter((t): t is JobType => t === "full-time" || t === "contract");
  return {
    q: sp.get("q") ?? undefined,
    location: sp.get("location") ?? undefined,
    roles: roles.length ? roles : undefined,
    work_types: workTypes.length ? workTypes : undefined,
    job_type:
      jobTypes[0] ??
      (sp.get("job_type") as JobFilters["job_type"]) ??
      undefined,
    job_types: jobTypes.length ? jobTypes : undefined,
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
  if (f.job_types?.length) {
    f.job_types.forEach((t) => p.append("job_type", t));
  } else if (f.job_type) {
    p.set("job_type", f.job_type);
  }
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
    items.push({ key: "roles", label: `Specialization: ${r}`, value: r }),
  );
  if (filters.location?.trim())
    items.push({ key: "location", label: `Location: ${filters.location}` });
  filters.work_types?.forEach((w) =>
    items.push({ key: "work_types", label: `Work mode: ${w}`, value: w }),
  );
  if (filters.job_types?.length) {
    filters.job_types.forEach((t) =>
      items.push({ key: "job_types", label: `Work time: ${t}`, value: t }),
    );
  } else if (filters.job_type) {
    items.push({ key: "job_type", label: `Work time: ${filters.job_type}` });
  }
  filters.tech?.forEach((t) =>
    items.push({ key: "tech", label: `Tech: ${t}`, value: t }),
  );
  if (filters.salary_min != null && filters.salary_min > 0)
    items.push({
      key: "salary_min",
      label: `Min: ${(filters.salary_min / 1000).toFixed(0)}k`,
    });
  if (filters.salary_max != null && filters.salary_max > 0)
    items.push({
      key: "salary_max",
      label: `Max: ${(filters.salary_max / 1000).toFixed(0)}k`,
    });
  return items;
}

const LOCATION_OPTIONS = [{ value: "Remote", label: "Remote" }];

export function JobsFilter({
  roles,
  techOptions,
  isLoggedIn = false,
  layout = "sidebar",
}: {
  roles: string[];
  techOptions: string[];
  isLoggedIn?: boolean;
  layout?: "sidebar" | "horizontal";
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
        (key === "roles" ||
          key === "tech" ||
          key === "work_types" ||
          key === "job_types")
      ) {
        const prev = next[key === "job_types" ? "job_types" : key] as
          | string[]
          | undefined;
        const arr = prev?.filter((v) => v !== value);
        if (key === "work_types") {
          next.work_types = arr?.length ? (arr as WorkType[]) : undefined;
        } else if (key === "job_types") {
          next.job_types = arr?.length ? (arr as JobType[]) : undefined;
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

  const horizontalBar = (
    <div className="space-y-4">
      {/* Search bar: same as homepage – search + location + button */}
      <form
        className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-lg shadow-primary/5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const q = (
            e.currentTarget.elements.namedItem("q") as HTMLInputElement
          )?.value?.trim();
          updateFilters({ q: q || undefined });
        }}
      >
        <div className="relative flex min-h-11 min-w-0 flex-1 sm:flex-[6]">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            id="search-h"
            placeholder="Role, company, or keyword"
            defaultValue={filters.q}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.form?.requestSubmit();
            }}
            className="h-11 w-full border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="relative flex min-h-11 min-w-0 flex-1 items-center sm:flex-[4] sm:border-l-2 sm:border-border sm:pl-4">
          <MapPin
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 shrink-0 text-muted-foreground sm:left-4"
            aria-hidden
          />
          <Select
            value={filters.location ?? "__any__"}
            onValueChange={(v) =>
              updateFilters({ location: v === "__any__" ? undefined : v })
            }
          >
            <SelectTrigger className="h-11 w-full border-0 bg-transparent pl-9 shadow-none focus:ring-0 focus:ring-offset-0 sm:pl-10 sm:w-[140px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="__any__">Any location</SelectItem>
              {LOCATION_OPTIONS.filter((o) => o.value).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-11 gap-2 rounded-xl px-6 font-semibold sm:ml-2"
        >
          <Search className="h-5 w-5" aria-hidden />
          Search jobs
        </Button>
      </form>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value="add"
          onValueChange={(v) => {
            if (v === "add") return;
            const next = [...(filters.roles ?? []), v];
            updateFilters({ roles: next });
          }}
        >
          <SelectTrigger className="h-10 w-[130px] rounded-xl border-border/80 bg-card">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="add">Specialization…</SelectItem>
            {roles
              .filter((r) => !filters.roles?.includes(r))
              .map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2">
          {WORK_TYPES.map(({ value: w, label }) => {
            const checked = filters.work_types?.includes(w) ?? false;
            return (
              <div key={w} className="flex items-center space-x-1.5">
                <Checkbox
                  id={`work_h_${w}`}
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c
                      ? [...(filters.work_types ?? []), w]
                      : (filters.work_types ?? []).filter((x) => x !== w);
                    updateFilters({
                      work_types: next.length ? next : undefined,
                    });
                  }}
                />
                <label
                  htmlFor={`work_h_${w}`}
                  className="cursor-pointer text-sm font-medium capitalize"
                >
                  {label}
                </label>
              </div>
            );
          })}
        </div>
        <Select
          value={filters.job_type ?? "all"}
          onValueChange={(v) =>
            updateFilters({
              job_type: v === "all" ? undefined : (v as JobFilters["job_type"]),
            })
          }
        >
          <SelectTrigger className="h-10 w-[120px] rounded-xl border-border/80 bg-card">
            <SelectValue placeholder="Work time" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Any</SelectItem>
            {JOB_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value="add"
          onValueChange={(v) => {
            if (v === "add") return;
            const next = [...(filters.tech ?? []), v];
            updateFilters({ tech: next });
          }}
        >
          <SelectTrigger className="h-10 w-[120px] rounded-xl border-border/80 bg-card">
            <SelectValue placeholder="Tech" />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-[280px]">
            <SelectItem value="add">Tech…</SelectItem>
            {techOptions
              .filter((t) => !filters.tech?.includes(t))
              .map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            placeholder="Min k"
            defaultValue={
              filters.salary_min ? (filters.salary_min / 1000).toString() : ""
            }
            onBlur={(e) => {
              const n = parseInt(e.target.value, 10);
              updateFilters({
                salary_min: Number.isFinite(n) && n > 0 ? n * 1000 : undefined,
              });
            }}
            className="h-10 w-16 rounded-xl border-border/80 bg-card text-center text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max k"
            defaultValue={
              filters.salary_max ? (filters.salary_max / 1000).toString() : ""
            }
            onBlur={(e) => {
              const n = parseInt(e.target.value, 10);
              updateFilters({
                salary_max: Number.isFinite(n) && n > 0 ? n * 1000 : undefined,
              });
            }}
            className="h-10 w-16 rounded-xl border-border/80 bg-card text-center text-sm"
          />
        </div>
        {activeFilters.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters pills + Save search */}
      {(activeFilters.length > 0 || isLoggedIn) && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(({ key, label, value }) => (
            <span
              key={value !== undefined ? `${key}:${value}` : key}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
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
          {isLoggedIn && activeFilters.length > 0 && (
            <SaveSearchButton filters={filters as JobFilters} />
          )}
        </div>
      )}
    </div>
  );

  if (layout === "horizontal") {
    return horizontalBar;
  }

  return (
    <div className="space-y-4">
      {activeFilters.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-heading">
              Active filters ({activeFilters.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map(({ key, label, value }) => (
              <span
                key={value !== undefined ? `${key}:${value}` : key}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
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
            <div className="mt-4 border-t border-border/80 pt-3">
              <SaveSearchButton filters={filters as JobFilters} />
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-heading mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </h2>
        <div className="space-y-4">
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
              className="rounded-xl"
            />
          </div>
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
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Specialization
            </label>
            <Select
              value="add"
              onValueChange={(v) => {
                if (v === "add") return;
                const next = [...(filters.roles ?? []), v];
                updateFilters({ roles: next });
              }}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Add specialization" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="add">Add specialization…</SelectItem>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Work mode
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
                      className="cursor-pointer text-sm font-medium leading-none"
                    >
                      {label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
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
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Any</SelectItem>
                {JOB_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Add tech" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
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
                className="rounded-xl"
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
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
