"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WorkType } from "@/lib/types";

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

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };
  const toggleTech = (t: string) => {
    setSelectedTech((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const toggleWorkType = (w: WorkType) => {
    setSelectedWorkTypes((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement)?.value?.trim();
    const location = (form.elements.namedItem("location") as HTMLInputElement)?.value?.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    selectedRoles.forEach((r) => params.append("role", r));
    selectedTech.forEach((t) => params.append("tech", t));
    selectedWorkTypes.forEach((w) => params.append("work_type", w));
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  const specializationRoles = roles.length > 0 ? roles : ["Backend", "Frontend", "Full-stack", "DevOps", "Data"];
  const popularTech = tech.length > 0 ? tech.slice(0, 12) : ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Go", "Rust"];

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr,minmax(280px,0.4fr)] lg:gap-12">
          {/* Left: content & search */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#4A4A4A] md:text-3xl lg:text-4xl">
              Hello World. Hello new job
            </h1>
            <p className="mt-4 text-lg text-[#4A4A4A] md:text-xl">
              <span className="text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
                {jobCount.toLocaleString()}
              </span>{" "}
              job {jobCount === 1 ? "offer" : "offers"} from top employers
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row">
                <Input
                  name="q"
                  placeholder="Position, company, keyword"
                  className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <Input
                  name="location"
                  placeholder="Location"
                  className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 sm:max-w-[180px]"
                />
                <Button type="submit" size="lg" className="gap-2 rounded-lg px-6">
                  <Search className="h-5 w-5" aria-hidden />
                  Search
                </Button>
              </div>
            </form>

            {/* Specializations & Popular technologies card */}
            <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#4A4A4A]">Specializations</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {specializationRoles.map((r) => {
                  const isSelected = selectedRoles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        isSelected
                          ? "border-primary/30 bg-[#E8E5FB] text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-primary/30 hover:bg-[#E8E5FB] hover:text-primary"
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              <h3 className="mt-6 text-sm font-semibold text-[#4A4A4A]">Popular technologies</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {popularTech.map((t) => {
                  const isSelected = selectedTech.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTech(t)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        isSelected
                          ? "border-primary/30 bg-[#E8E5FB] text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-primary/30 hover:bg-[#E8E5FB] hover:text-primary"
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <h3 className="mt-6 text-sm font-semibold text-[#4A4A4A]">Work mode</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["remote", "hybrid"] as const).map((w) => {
                  const isSelected = selectedWorkTypes.includes(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleWorkType(w)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition-colors capitalize",
                        isSelected
                          ? "border-primary/30 bg-[#E8E5FB] text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-primary/30 hover:bg-[#E8E5FB] hover:text-primary"
                      )}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional filter links */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link href="/jobs?job_type=full-time" className="hover:text-primary hover:underline">
                Full-time
              </Link>
              <Link href="/jobs?job_type=contract" className="hover:text-primary hover:underline">
                Contract
              </Link>
            </div>
          </div>

          {/* Right: decorative imagery area */}
          <div className="hidden lg:flex lg:items-center lg:justify-end">
            <div className="relative h-64 w-full max-w-sm lg:h-80">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
              <div className="absolute right-4 top-8 h-24 w-24 rounded-full bg-primary/15" />
              <div className="absolute bottom-12 left-8 h-20 w-20 rounded-full bg-primary/10" />
              <div className="absolute right-1/4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-2xl bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
