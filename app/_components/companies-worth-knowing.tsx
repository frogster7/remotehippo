"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, ChevronRight, Bookmark, X } from "lucide-react";
import { HydrationSafeDiv } from "@/components/hydration-safe-div";

export type EmployerForHomepage = {
  id: string;
  company_name: string | null;
  full_name: string | null;
  company_website: string | null;
  company_logo_url: string | null;
};

const CARD_WIDTH = 288;
const GAP = 16;

function CompanyCard({
  employer,
  isSaved,
  onToggleSave,
}: {
  employer: EmployerForHomepage;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}) {
  const name =
    employer.company_name?.trim() || employer.full_name?.trim() || "Company";
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <HydrationSafeDiv
      className="relative flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md transition-all hover:shadow-lg scroll-snap-align-start"
      style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}
    >
      {/* Top patterned area – same as Recently posted cards */}
      <div
        className="relative h-20 shrink-0"
        aria-hidden
        style={{
          background: `linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.6) 100%)`,
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--muted)) 0%, transparent 50%),
            linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              hsl(var(--foreground) / 0.08) 8px,
              hsl(var(--foreground) / 0.08) 9px
            )`,
          }}
        />
        {/* Logo – top left */}
        <Link
          href={`/employer/${employer.id}`}
          className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
        >
          {employer.company_logo_url ? (
            <Image
              src={employer.company_logo_url}
              alt=""
              width={48}
              height={48}
              className="object-contain p-1"
            />
          ) : (
            <span className="text-sm font-semibold text-primary">
              {name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </Link>
        {/* Top right: X + Bookmark */}
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setDismissed(true);
            }}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isSaved ? "Unsave company" : "Save company"}
          >
            <Bookmark
              className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>
      {/* Content – same structure as job card */}
      <Link
        href={`/employer/${employer.id}`}
        className="flex flex-1 flex-col p-5 pt-4"
      >
        <h3 className="font-heading text-base font-bold leading-tight text-heading line-clamp-2">
          {name}
        </h3>
        <p className="mt-1.5 text-sm font-medium uppercase tracking-wide text-muted-foreground line-clamp-1">
          COMPANY
        </p>
        <span className="mt-2 inline-block text-sm font-medium text-primary">
          View jobs →
        </span>
      </Link>
    </HydrationSafeDiv>
  );
}

interface CompaniesWorthKnowingProps {
  employers: EmployerForHomepage[];
}

export function CompaniesWorthKnowing({
  employers,
}: CompaniesWorthKnowingProps) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = CARD_WIDTH + GAP;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const toggleSave = (employerId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employerId)) next.delete(employerId);
      else next.add(employerId);
      return next;
    });
  };

  if (employers.length === 0) return null;

  return (
    <section className="rounded-t-3xl border-t border-border/80 bg-card py-12 md:py-16">
      <HydrationSafeDiv className="container mx-auto px-4">
        <HydrationSafeDiv className="flex items-center gap-3">
          <HydrationSafeDiv
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "hsl(var(--chart-5) / 0.15)" }}
          >
            <Users
              className="h-5 w-5"
              style={{ color: "hsl(var(--chart-5))" }}
              aria-hidden
            />
          </HydrationSafeDiv>
          <h2 className="font-heading text-xl font-bold tracking-tight text-heading md:text-2xl">
            People with your skills applied for
          </h2>
        </HydrationSafeDiv>
        <HydrationSafeDiv className="relative mt-6">
          <HydrationSafeDiv
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide [scroll-snap-type:x_mandatory] pb-2"
            style={{ cursor: "default" }}
          >
            {employers.map((employer) => (
              <CompanyCard
                key={employer.id}
                employer={employer}
                isSaved={savedIds.has(employer.id)}
                onToggleSave={toggleSave(employer.id)}
              />
            ))}
          </HydrationSafeDiv>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
            aria-label="Scroll to next companies"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </HydrationSafeDiv>
      </HydrationSafeDiv>
    </section>
  );
}
