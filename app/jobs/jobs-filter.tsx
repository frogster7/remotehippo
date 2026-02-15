"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WORK_TYPES, JOB_TYPES } from "@/lib/types";
import type { JobFilters } from "@/lib/types";

function getFiltersFromSearchParams(sp: URLSearchParams): Partial<JobFilters> {
  const salaryMin = sp.get("salary_min");
  const salaryMax = sp.get("salary_max");
  return {
    q: sp.get("q") ?? undefined,
    role: sp.get("role") ?? undefined,
    work_type: (sp.get("work_type") as JobFilters["work_type"]) ?? undefined,
    job_type: (sp.get("job_type") as JobFilters["job_type"]) ?? undefined,
    tech: sp.get("tech") ?? undefined,
    salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
    salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
  };
}

function filtersToParams(f: Partial<JobFilters>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q?.trim()) p.set("q", f.q.trim());
  if (f.role?.trim()) p.set("role", f.role.trim());
  if (f.work_type) p.set("work_type", f.work_type);
  if (f.job_type) p.set("job_type", f.job_type);
  if (f.tech?.trim()) p.set("tech", f.tech.trim());
  if (f.salary_min != null && f.salary_min > 0) p.set("salary_min", String(f.salary_min));
  if (f.salary_max != null && f.salary_max > 0) p.set("salary_max", String(f.salary_max));
  return p;
}

export function JobsFilter({
  roles,
  techOptions,
}: {
  roles: string[];
  techOptions: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = getFiltersFromSearchParams(searchParams);

  const updateFilters = useCallback(
    (next: Partial<JobFilters>) => {
      const merged = { ...filters, ...next };
      const params = filtersToParams(merged);
      const query = params.toString();
      router.push(query ? `/jobs?${query}` : "/jobs");
    },
    [filters, router]
  );

  const clearFilters = useCallback(() => {
    router.push("/jobs");
  }, [router]);

  const hasFilters =
    filters.q ||
    filters.role ||
    filters.work_type ||
    filters.job_type ||
    filters.tech ||
    (filters.salary_min != null && filters.salary_min > 0) ||
    (filters.salary_max != null && filters.salary_max > 0);

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <Input
            placeholder="Title, role, description…"
            defaultValue={filters.q}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (filters.q ?? "")) updateFilters({ q: v || undefined });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
          <Select
            value={filters.role ?? "all"}
            onValueChange={(v) => updateFilters({ role: v === "all" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any role</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[120px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Work type</label>
          <Select
            value={filters.work_type ?? "all"}
            onValueChange={(v) =>
              updateFilters({ work_type: v === "all" ? undefined : (v as JobFilters["work_type"]) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {WORK_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[120px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Job type</label>
          <Select
            value={filters.job_type ?? "all"}
            onValueChange={(v) =>
              updateFilters({ job_type: v === "all" ? undefined : (v as JobFilters["job_type"]) })
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
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Tech</label>
          <Select
            value={filters.tech ?? "all"}
            onValueChange={(v) => updateFilters({ tech: v === "all" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {techOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="w-24">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Min salary</label>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={filters.salary_min ?? ""}
              onBlur={(e) => {
                const n = parseInt(e.target.value, 10);
                updateFilters({ salary_min: Number.isFinite(n) && n > 0 ? n : undefined });
              }}
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Max salary</label>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={filters.salary_max ?? ""}
              onBlur={(e) => {
                const n = parseInt(e.target.value, 10);
                updateFilters({ salary_max: Number.isFinite(n) && n > 0 ? n : undefined });
              }}
            />
          </div>
        </div>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
