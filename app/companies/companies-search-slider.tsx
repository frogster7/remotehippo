"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CompanyCard, CARD_WIDTH } from "./company-card";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { useSmoothScroll } from "@/lib/use-smooth-scroll";
import type { CompanyCardData } from "@/lib/jobs";

const GAP = 16;
const STEP = CARD_WIDTH + GAP;
const FADE_THRESHOLD = 8;

/** Slider of company cards for search results. */
export function CompaniesSearchSlider({
  companies,
  query,
}: {
  companies: CompanyCardData[];
  query: string;
}) {
  const { ref: scrollRef, handlers } = useDragScroll<HTMLDivElement>();
  const smoothScroll = useSmoothScroll(scrollRef);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > FADE_THRESHOLD);
    setShowRightFade(
      el.scrollLeft < el.scrollWidth - el.clientWidth - FADE_THRESHOLD
    );
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateFades();
    el.addEventListener("scroll", updateFades);
    const ro = new ResizeObserver(updateFades);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFades);
      ro.disconnect();
    };
  }, [companies.length, updateFades, scrollRef]);

  const scroll = (dir: "left" | "right") => smoothScroll(dir, STEP);

  if (companies.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {query
          ? `No companies match "${query}".`
          : "No companies with active jobs yet."}
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        {showLeftFade && (
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent"
            aria-hidden
          />
        )}
        <div
          ref={scrollRef}
          {...handlers}
          className="flex gap-4 overflow-x-auto scrollbar-hide [scroll-snap-type:x_mandatory] [scroll-behavior:smooth] pb-2 cursor-grab"
        >
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
        {showRightFade && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent"
            aria-hidden
          />
        )}
      </div>
      {companies.length > 2 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card shadow-sm transition hover:bg-muted/50 hover:border-primary/30"
            aria-label="Previous companies"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card shadow-sm transition hover:bg-muted/50 hover:border-primary/30"
            aria-label="Next companies"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
