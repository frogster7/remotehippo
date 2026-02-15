"use client";

import Link from "next/link";
import { useDragScroll } from "@/lib/use-drag-scroll";
import Image from "next/image";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EmployerForHomepage = {
  id: string;
  company_name: string | null;
  full_name: string | null;
  company_website: string | null;
  company_logo_url: string | null;
};

const CARD_WIDTH = 288;
const GAP = 16;

function CompanyCard({ employer }: { employer: EmployerForHomepage }) {
  const name =
    employer.company_name?.trim() || employer.full_name?.trim() || "Company";

  return (
    <Link
      href={`/employer/${employer.id}`}
      className="flex w-72 shrink-0 flex-col items-center rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/30 hover:shadow-md scroll-snap-align-start"
    >
      {employer.company_logo_url ? (
        <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
          <Image
            src={employer.company_logo_url}
            alt=""
            fill
            className="object-contain p-1"
            sizes="56px"
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-xl font-semibold text-primary">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="mt-3 text-center font-medium line-clamp-2">{name}</p>
      <span className="mt-1 text-xs text-muted-foreground">View jobs →</span>
    </Link>
  );
}

interface CompaniesWorthKnowingProps {
  employers: EmployerForHomepage[];
}

export function CompaniesWorthKnowing({
  employers,
}: CompaniesWorthKnowingProps) {
  const { ref: scrollRef, handlers: dragHandlers } =
    useDragScroll<HTMLDivElement>();

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = CARD_WIDTH + GAP;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  if (employers.length === 0) return null;

  return (
    <section className="border-t bg-muted/30 py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold tracking-tight">
              Companies worth knowing
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div
          ref={scrollRef}
          {...dragHandlers}
          className="mt-6 flex cursor-grab gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide [scroll-snap-type:x_mandatory] active:cursor-grabbing"
        >
          {employers.map((employer) => (
            <CompanyCard key={employer.id} employer={employer} />
          ))}
        </div>
      </div>
    </section>
  );
}
