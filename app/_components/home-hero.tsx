"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, ChevronUp, Code2, X } from "lucide-react";
import Image from "next/image";
import { getTechIconUrl } from "@/lib/tech-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { HydrationSafeDiv } from "@/components/hydration-safe-div";
import { cn } from "@/lib/utils";
import type { WorkType, JobType } from "@/lib/types";
import { JOB_TYPES, WORK_TYPES } from "@/lib/types";

const HOME_TECH_ORDER = [
  "JavaScript",
  "HTML",
  "Python",
  "Java",
  "SQL",
  "Node.js",
  "TypeScript",
  "PHP",
  "C++",
  "React.js",
];

interface HomeHeroProps {
  jobCount: number;
  roles: string[];
  tech: string[];
}

export function HomeHero({ jobCount, roles, tech }: HomeHeroProps) {
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationInput, setLocationInput] = useState<string>("");
  const [specializationsExpanded, setSpecializationsExpanded] = useState(true);
  const [techExpanded, setTechExpanded] = useState(false);

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };
  const toggleTech = (t: string) => {
    setSelectedTech((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };
  const toggleWorkType = (w: WorkType) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w],
    );
  };
  const toggleJobType = (j: JobType) => {
    setSelectedJobTypes((prev) =>
      prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j],
    );
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (locationInput.trim()) params.set("location", locationInput.trim());
    selectedRoles.forEach((r) => params.append("role", r));
    selectedTech.forEach((t) => params.append("tech", t));
    selectedWorkTypes.forEach((w) => params.append("work_type", w));
    selectedJobTypes.forEach((t) => params.append("job_type", t));
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  const specializationRoles =
    roles.length > 0
      ? roles
      : ["Backend", "Frontend", "Full-stack", "DevOps", "Data"];
  const allTech =
    tech.length > 0
      ? [
          ...HOME_TECH_ORDER,
          ...tech.filter((t) => !HOME_TECH_ORDER.includes(t)),
        ]
      : [
          ...HOME_TECH_ORDER,
          "C#",
          "Go",
          "C",
          "Rust",
          ".NET",
          "Angular",
          "Android",
          "AWS",
          "iOS",
          "Ruby",
        ];
  const SPEC_COLLAPSED = 10;
  const TECH_COLLAPSED = 10;
  const visibleSpecializations = specializationsExpanded
    ? specializationRoles
    : specializationRoles.slice(0, SPEC_COLLAPSED);
  const visibleTech = techExpanded ? allTech : allTech.slice(0, TECH_COLLAPSED);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-muted via-primary/[0.08] to-background">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-muted/80 to-transparent" />
      </div>

      <HydrationSafeDiv className="container mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
        <HydrationSafeDiv className="mx-auto max-w-[1200px]">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Niche Tech Jobs
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl md:text-5xl lg:text-[2.75rem]">
            Find your next role.
            <br />
            <span className="text-primary">Build what matters.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
            <span className="font-semibold text-foreground">
              {jobCount.toLocaleString()}
            </span>{" "}
            {jobCount === 1 ? "job" : "jobs"} from companies that value remote
            and hybrid work.
          </p>

          <form onSubmit={handleSearch} className="mt-8">
            <HydrationSafeDiv className="flex flex-col gap-3 rounded-2xl border border-primary/100 bg-card p-3 shadow-lg shadow-primary/5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0 sm:p-4">
              <div className="relative flex min-h-11 min-w-0 flex-1 sm:flex-[6]">
                <Search
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  name="q"
                  placeholder="Role, company, or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {/* Location input */}
              <div className="relative flex min-h-11 min-w-0 flex-1 items-center sm:flex-[4] sm:border-l-2 sm:border-border sm:pl-4">
                <MapPin
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 shrink-0 text-muted-foreground sm:left-4"
                  aria-hidden
                />
                <Input
                  type="text"
                  placeholder="Location / Remote"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="h-11 w-full border-0 bg-transparent pl-9 pr-9 shadow-none focus-visible:ring-0"
                />
                {locationInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLocationInput("")}
                    className="hover:rounded-full absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear location"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 gap-2 rounded-xl px-6 font-semibold"
              >
                <Search className="h-5 w-5" aria-hidden />
                Search jobs
              </Button>
            </HydrationSafeDiv>
          </form>

          <HydrationSafeDiv className="mt-6 rounded-2xl border border-primary/40 bg-card/95 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Specializations
                  {selectedRoles.length > 0 && (
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/100 px-1.5 text-xs font-medium text-white">
                      {selectedRoles.length}
                    </span>
                  )}
                </p>
                <HydrationSafeDiv className="mt-2 flex flex-wrap items-center gap-2">
                  {visibleSpecializations.map((r) => {
                    const isSelected = selectedRoles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/70 text-muted-foreground hover:bg-primary/15 hover:text-primary",
                        )}
                      >
                        {r}
                      </button>
                    );
                  })}
                  {specializationRoles.length > SPEC_COLLAPSED && (
                    <button
                      type="button"
                      onClick={() => setSpecializationsExpanded((e) => !e)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
                    >
                      {specializationsExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show more (
                          {specializationRoles.length - SPEC_COLLAPSED})
                        </>
                      )}
                    </button>
                  )}
                </HydrationSafeDiv>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Technologies
                  {selectedTech.length > 0 && (
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/100 px-1.5 text-xs font-medium text-white">
                      {selectedTech.length}
                    </span>
                  )}
                </p>
                <HydrationSafeDiv className="mt-2 flex flex-wrap items-center gap-2">
                  {visibleTech.map((t) => {
                    const isSelected = selectedTech.includes(t);
                    const iconUrl = getTechIconUrl(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTech(t)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/70 text-muted-foreground hover:bg-primary/15 hover:text-primary",
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
                  {allTech.length > TECH_COLLAPSED && (
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
                          Show more ({allTech.length - TECH_COLLAPSED})
                        </>
                      )}
                    </button>
                  )}
                </HydrationSafeDiv>
              </div>
            </div>
          </HydrationSafeDiv>

          {/* Work time + Work mode – link-style dropdowns with checkboxes and count */}
          <HydrationSafeDiv className="mt-4 flex flex-wrap items-center gap-4 pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus:underline"
                >
                  Work time
                  {selectedJobTypes.length > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/100 px-1.5 text-xs font-medium text-white">
                      {selectedJobTypes.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[180px] rounded-xl"
              >
                {JOB_TYPES.map(({ value, label }) => (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={selectedJobTypes.includes(value)}
                    onCheckedChange={() => toggleJobType(value)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus:underline"
                >
                  Work mode
                  {selectedWorkTypes.length > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/100 px-1.5 text-xs font-medium text-white">
                      {selectedWorkTypes.length}
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
                    checked={selectedWorkTypes.includes(value)}
                    onCheckedChange={() => toggleWorkType(value)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </HydrationSafeDiv>
        </HydrationSafeDiv>
      </HydrationSafeDiv>
    </section>
  );
}
