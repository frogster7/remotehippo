"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  Search,
  Trash2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Code2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { WORK_TYPES, JOB_TYPES } from "@/lib/types";
import type { JobFilters, WorkType, JobType } from "@/lib/types";
import { getTechIconUrl } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";
import { SaveSearchButton } from "./save-search-button";

function getFiltersFromSearchParams(sp: URLSearchParams): Partial<JobFilters> {
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
  return items;
}

const SPEC_COLLAPSED = 10;
const TECH_COLLAPSED = 10;

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
  const [specExpanded, setSpecExpanded] = useState(false);
  const [techExpanded, setTechExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Collapse filters on real downward scroll only (not right after manual toggle).
  const lastScrollYRef = useRef(0);
  const suppressAutoCollapseUntilRef = useRef(0);
  useEffect(() => {
    if (!filtersOpen) return;

    lastScrollYRef.current = window.scrollY;
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (Date.now() < suppressAutoCollapseUntilRef.current) {
        lastScrollYRef.current = scrollY;
        return;
      }

      const delta = scrollY - lastScrollYRef.current;
      const isScrollingDown = delta > 0;
      if (isScrollingDown && delta > 8 && scrollY > 80) {
        setFiltersOpen(false);
      }

      lastScrollYRef.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filtersOpen]);

  const visibleSpecs = specExpanded ? roles : roles.slice(0, SPEC_COLLAPSED);
  const visibleTech = techExpanded
    ? techOptions
    : techOptions.slice(0, TECH_COLLAPSED);

  // Pending filters: local state for filter panel, applied on "Apply" click
  const [pendingFilters, setPendingFilters] =
    useState<Partial<JobFilters>>(filters);
  const [searchQuery, setSearchQuery] = useState(filters.q ?? "");
  const [searchLocation, setSearchLocation] = useState(filters.location ?? "");
  const filtersKey = JSON.stringify({
    q: filters.q,
    location: filters.location,
    roles: filters.roles,
    tech: filters.tech,
    work_types: filters.work_types,
    job_types: filters.job_types,
    job_type: filters.job_type,
  });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  useEffect(() => {
    setPendingFilters(filtersRef.current);
    setSearchQuery(filtersRef.current.q ?? "");
    setSearchLocation(filtersRef.current.location ?? "");
  }, [filtersKey]); // Sync pending state when URL filters change; ref avoids infinite loop from new object ref each render

  const applyPendingFilters = useCallback(() => {
    const params = filtersToParams(pendingFilters);
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
    setFiltersOpen(false);
  }, [pendingFilters, router]);

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
    <div className="space-y-3">
      {/* Search bar + filters */}
      <div className="overflow-hidden rounded-2xl border border-primary/50 bg-card shadow-sm">
        <form
          className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchQuery.trim() || undefined;
            const loc = searchLocation.trim() || undefined;
            const merged = {
              ...pendingFilters,
              q,
              location: loc,
            };
            const params = filtersToParams(merged);
            const query = params.toString();
            router.push(query ? `/jobs?${query}` : "/jobs");
            setFiltersOpen(false);
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.form?.requestSubmit();
              }}
              className="h-11 w-full border-0 bg-transparent pl-10 pr-9 shadow-none focus-visible:ring-0"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:rounded-full absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative flex min-h-11 min-w-0 flex-1 items-center sm:flex-[4] sm:border-l-2 sm:border-border sm:pl-4">
            <MapPin
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 shrink-0 text-muted-foreground sm:left-4"
              aria-hidden
            />
            <Input
              name="location"
              type="text"
              placeholder="Location / Remote"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.form?.requestSubmit();
              }}
              className="h-11 w-full border-0 bg-transparent pl-9 pr-9 shadow-none focus-visible:ring-0"
            />
            {searchLocation.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchLocation("")}
                className="hover:rounded-full absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear location"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "h-11 w-11 shrink-0 rounded-xl border-border/80 bg-background transition-colors duration-200 sm:ml-2",
              filtersOpen && "bg-primary/10 border-primary/30",
            )}
            onClick={() => {
              suppressAutoCollapseUntilRef.current = Date.now() + 500;
              setFiltersOpen((o) => !o);
            }}
            aria-expanded={filtersOpen}
            aria-label={filtersOpen ? "Hide filters" : "Show filters"}
          >
            <SlidersHorizontal
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                filtersOpen && "rotate-90",
              )}
              aria-hidden
            />
          </Button>
          <Button
            type="submit"
            size="lg"
            className="h-11 gap-2 rounded-xl px-6 font-semibold shadow-sm sm:ml-2"
          >
            <Search className="h-5 w-5" aria-hidden />
            Search jobs
          </Button>
        </form>

        {/* Filters panel: collapsible with animation, no top border, connected to search */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-border/50 bg-muted/20 p-5 sm:p-6">
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Specializations
                    {pendingFilters.roles &&
                      pendingFilters.roles.length > 0 && (
                        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                          {pendingFilters.roles.length}
                        </span>
                      )}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {visibleSpecs.map((r) => {
                      const isSelected =
                        pendingFilters.roles?.includes(r) ?? false;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? (pendingFilters.roles ?? []).filter(
                                  (x) => x !== r,
                                )
                              : [...(pendingFilters.roles ?? []), r];
                            setPendingFilters((pf) => ({
                              ...pf,
                              roles: next.length ? next : undefined,
                            }));
                          }}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {r}
                        </button>
                      );
                    })}
                    {roles.length > SPEC_COLLAPSED && (
                      <button
                        type="button"
                        onClick={() => setSpecExpanded((e) => !e)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
                      >
                        {specExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show more ({roles.length - SPEC_COLLAPSED})
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Technologies
                    {pendingFilters.tech && pendingFilters.tech.length > 0 && (
                      <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {pendingFilters.tech.length}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {visibleTech.map((t) => {
                      const isSelected =
                        pendingFilters.tech?.includes(t) ?? false;
                      const iconUrl = getTechIconUrl(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? (pendingFilters.tech ?? []).filter(
                                  (x) => x !== t,
                                )
                              : [...(pendingFilters.tech ?? []), t];
                            setPendingFilters((pf) => ({
                              ...pf,
                              tech: next.length ? next : undefined,
                            }));
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {iconUrl ? (
                            <Image
                              src={iconUrl}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 shrink-0"
                            />
                          ) : (
                            <Code2 className="h-4 w-4 shrink-0" />
                          )}
                          {t}
                        </button>
                      );
                    })}
                    {techOptions.length > TECH_COLLAPSED && (
                      <button
                        type="button"
                        onClick={() => setTechExpanded((e) => !e)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
                      >
                        {techExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show more ({techOptions.length - TECH_COLLAPSED})
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Work time + Work mode (left third), Apply (center third), spacer (right third) */}
              <div className="mt-4 flex flex-nowrap items-center border-t border-border/50 pt-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus:underline"
                      >
                        Work time
                        {((pendingFilters.job_types?.length ?? 0) > 0 ||
                          pendingFilters.job_type) && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                            {pendingFilters.job_types?.length ??
                              (pendingFilters.job_type ? 1 : 0)}
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="min-w-[180px] rounded-xl"
                    >
                      {JOB_TYPES.map(({ value, label }) => {
                        const currentJobTypes = pendingFilters.job_types?.length
                          ? pendingFilters.job_types
                          : pendingFilters.job_type
                            ? [pendingFilters.job_type]
                            : [];
                        const checked = currentJobTypes.includes(value);
                        return (
                          <DropdownMenuCheckboxItem
                            key={value}
                            checked={checked}
                            onCheckedChange={(c) => {
                              const next = c
                                ? [...new Set([...currentJobTypes, value])]
                                : currentJobTypes.filter((x) => x !== value);
                              setPendingFilters((pf) => ({
                                ...pf,
                                job_types: next.length ? next : undefined,
                                job_type:
                                  next.length === 1 ? next[0] : undefined,
                              }));
                            }}
                            onSelect={(e) => e.preventDefault()}
                          >
                            {label}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus:underline"
                      >
                        Work mode
                        {(pendingFilters.work_types?.length ?? 0) > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                            {pendingFilters.work_types?.length}
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="min-w-[180px] rounded-xl"
                    >
                      {WORK_TYPES.map(({ value, label }) => (
                        <DropdownMenuCheckboxItem
                          key={value}
                          checked={
                            pendingFilters.work_types?.includes(value) ?? false
                          }
                          onCheckedChange={(c) => {
                            const next = c
                              ? [...(pendingFilters.work_types ?? []), value]
                              : (pendingFilters.work_types ?? []).filter(
                                  (x) => x !== value,
                                );
                            setPendingFilters((pf) => ({
                              ...pf,
                              work_types: next.length ? next : undefined,
                            }));
                          }}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1 flex justify-center min-w-0 px-2">
                  <Button
                    type="button"
                    size="lg"
                    className="rounded-xl px-8 font-semibold shadow-sm"
                    onClick={applyPendingFilters}
                  >
                    Apply filters
                  </Button>
                </div>
                <div className="flex-1 min-w-0" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        {/* Active filters pills + Save search – outside collapsible, hidden when empty */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/70 bg-background/70 px-4 pb-3 pt-3">
            {activeFilters.map(({ key, label, value }) => (
              <span
                key={value !== undefined ? `${key}:${value}` : key}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 shrink-0 gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
            {isLoggedIn && (
              <div className="ml-auto shrink-0">
                <SaveSearchButton filters={filters as JobFilters} />
              </div>
            )}
          </div>
        )}
      </div>
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
            <div className="relative">
              <Input
                id="search"
                placeholder="Title, role, keyword…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  const v = searchQuery.trim();
                  if (v !== (filters.q ?? ""))
                    updateFilters({ q: v || undefined });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="rounded-xl pr-9"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    updateFilters({ q: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Location
            </label>
            <div className="relative">
              <Input
                id="location"
                placeholder="e.g. Remote, city…"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onBlur={() => {
                  const v = searchLocation.trim();
                  if (v !== (filters.location ?? ""))
                    updateFilters({ location: v || undefined });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="rounded-xl pr-9"
              />
              {searchLocation.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation("");
                    updateFilters({ location: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear location"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Specializations
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
                <SelectItem value="add">Add specializations…</SelectItem>
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
                      onCheckedChange={(c: boolean | "indeterminate") => {
                        const next =
                          c === true
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
        </div>
      </div>
    </div>
  );
}
