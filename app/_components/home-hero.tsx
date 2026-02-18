"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, ChevronUp, Code2 } from "lucide-react";
import Image from "next/image";
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
const DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const DEVICON_ICONS: Record<string, string> = {
  JavaScript: "javascript",
  HTML: "html5",
  Python: "python",
  Java: "java",
  SQL: "mysql",
  "Node.js": "nodejs",
  TypeScript: "typescript",
  PHP: "php",
  "C++": "cplusplus",
  "React.js": "react",
  "C#": "csharp",
  Go: "go",
  C: "c",
  Rust: "rust",
  ".NET": "dot-net",
  Angular: "angular",
  Android: "android",
  AWS: "amazonwebservices",
  iOS: "apple",
  Ruby: "ruby",
};

const C_ICON_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#283593" d="M64 12c-28.7 0-52 23.3-52 52s23.3 52 52 52 52-23.3 52-52S92.7 12 64 12zm0 92c-22.1 0-40-17.9-40-40S41.9 24 64 24s40 17.9 40 40-17.9 40-40 40z"/><path fill="#283593" d="M64 38c-14.4 0-26 11.6-26 26s11.6 26 26 26c5.6 0 10.9-1.8 15.3-5.2l-4.6-5.8c-3 2.2-6.7 3.5-10.7 3.5-8.3 0-15-6.7-15-15s6.7-15 15-15c4 0 7.7 1.3 10.7 3.5l4.6-5.8C74.9 39.8 69.6 38 64 38z"/></svg>',
  );

const AWS_ICON_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 154"><path fill="#FF9900" d="M72.4 153.2c-2.8 0-4.8-.6-6-1.9-1.2-1.3-1.8-3.2-1.8-5.8v-61.3H45.8c-2.8 0-4.8-.6-6-1.9-1.2-1.3-1.8-3.2-1.8-5.8v-9.3c0-2.4.6-4.3 1.8-5.8 1.2-1.4 3.2-2.1 6-2.1h18.8V58.5c0-8.4 2.4-14.8 7.1-19.3 4.8-4.5 11.5-6.7 20.2-6.7 2.8 0 5.2.2 7.1.6 1.9.4 3.8 1.1 5.6 1.9v19.2c-1.6-.8-3.3-1.5-5.1-2-1.8-.5-3.7-.7-5.8-.7-3.4 0-6 .9-7.8 2.6-1.8 1.7-2.6 4.2-2.6 7.5v11.8h26.5c2.9 0 4.9.6 6.2 1.9 1.3 1.3 1.9 3.2 1.9 5.8v9.1c0 2.6-.6 4.6-1.9 5.8-1.3 1.3-3.4 1.9-6.2 1.9H72.4v27.6c0 2.6-.6 4.5-1.8 5.8-1.2 1.3-3.2 1.9-6 1.9zm103.5-35c0 4.7-.9 8.6-2.8 11.8-1.9 3.2-4.4 5.7-7.6 7.4-3.2 1.7-6.9 2.6-11 2.6-5.6 0-10-1.3-13.1-4-3.1-2.7-5.3-6.2-6.6-10.7l21.1-8.5c.5 1.8 1.3 3.3 2.3 4.3 1 1 2.4 1.5 4.1 1.5 2.1 0 3.7-.7 4.8-2 1.1-1.3 1.7-3 1.7-5 0-2.4-.9-4.4-2.6-5.9-1.8-1.5-4.6-3.2-8.4-5-4.9-2.2-8.5-4.8-10.9-7.6-2.3-2.9-3.5-6.1-3.5-9.8 0-4.5 1-8.2 3.1-11.1 2-2.9 4.9-5.1 8.5-6.5 3.6-1.4 7.6-2.2 11.9-2.2 5.1 0 9.4 1.2 12.6 3.7 3.2 2.5 5.6 5.8 7 10.2l-20.3 8.9c-1.3-3.4-3.6-5.2-7.1-5.2-1.7 0-3.1.5-4.1 1.4-1 .9-1.5 2.2-1.5 3.7 0 2.2 1.1 4 3.2 5.4 2.1 1.4 5.5 3 10.1 5z"/></svg>',
  );

const LOCATION_OPTIONS = ["Remote"];

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

function getTechIconUrl(name: string): string | null {
  if (name === "C") return C_ICON_FALLBACK;
  if (name === "AWS") return AWS_ICON_FALLBACK;
  const icon = DEVICON_ICONS[name];
  if (!icon) return null;
  return `${DEVICON_CDN}/${icon}/${icon}-original.svg`;
}

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
  const [locationInput, setLocationInput] = useState<string>("");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [specializationsExpanded, setSpecializationsExpanded] = useState(true);
  const [techExpanded, setTechExpanded] = useState(false);
  const locationWrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        locationDropdownOpen &&
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(e.target as Node)
      ) {
        setLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [locationDropdownOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement)?.value?.trim();
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-primary/[0.02] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] from-0% via-transparent via-50% to-primary/[0.04] to-100%" />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-muted/60 to-transparent" />
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
            <HydrationSafeDiv className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-lg shadow-primary/5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0 sm:p-4">
              <div className="relative flex min-h-11 min-w-0 flex-1 sm:flex-[6]">
                <Search
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  name="q"
                  placeholder="Role, company, or keyword"
                  className="h-11 w-full border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                />
              </div>
              {/* Location: single input + dropdown (same look as keyword input), centered in row */}
              <div
                ref={locationWrapperRef}
                className="relative flex min-h-11 min-w-0 flex-1 items-center sm:flex-[4] sm:border-l-2 sm:border-border sm:pl-4"
              >
                <div className="relative flex w-full items-center">
                  <MapPin
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onFocus={() => setLocationDropdownOpen(true)}
                    className="h-11 w-full border-0 bg-transparent pl-9 pr-3 shadow-none focus-visible:ring-0"
                  />
                </div>
                {locationDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-border/80 bg-popover py-1 shadow-lg"
                    role="listbox"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        role="option"
                        className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setLocationInput(loc);
                          setLocationDropdownOpen(false);
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
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

          <HydrationSafeDiv className="mt-6 rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Specialization
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
