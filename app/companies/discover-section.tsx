"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { CompanyCard, CARD_WIDTH } from "./company-card";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { useSmoothScroll } from "@/lib/use-smooth-scroll";
import type { CompanyCardData } from "@/lib/jobs";

const GAP = 16;
const STEP = CARD_WIDTH + GAP;

type Props = {
  subheading: string;
  companies: CompanyCardData[];
};

export function DiscoverSection({ subheading, companies }: Props) {
  const { ref: scrollRef, handlers } = useDragScroll<HTMLDivElement>();
  const smoothScroll = useSmoothScroll(scrollRef);

  const scroll = (dir: "left" | "right") => smoothScroll(dir, STEP);

  if (companies.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-heading md:text-3xl">
          {subheading}
        </h2>
      </div>

      <div className="relative">
        {/* Full-bleed wrapper so slider extends to the right edge of the screen */}
        <div className="w-screen relative left-1/2 -translate-x-1/2">
          <div className="relative">
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent"
              aria-hidden
            />
            <div
              ref={scrollRef}
              {...handlers}
              className="flex gap-4 overflow-x-auto scrollbar-hide [scroll-snap-type:x_mandatory] cursor-grab pr-0 min-w-0 [scroll-behavior:smooth]"
              style={{
                paddingLeft: "max(1rem, calc((100vw - 1140px) / 2 + 1rem))",
              }}
            >
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent"
              aria-hidden
            />
          </div>
        </div>

        {companies.length > 2 && (
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
              aria-label="Previous companies"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
              aria-label="Next companies"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
