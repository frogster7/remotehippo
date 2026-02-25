"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiscoverJobCard, CARD_WIDTH } from "./discover-job-card";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { useSmoothScroll } from "@/lib/use-smooth-scroll";
import type { Job } from "@/lib/types";

const GAP = 16;
const STEP = CARD_WIDTH + GAP;
/** Match hero: container 1280px (xl), px-4, 1200px content centered → left inset 40px. */
const CONTAINER_XL = 1280;
const HERO_CONTENT_INSET_PX = 40;

type Props = {
  subheading: string;
  jobs: Job[];
  favoritedJobIds: Set<string>;
  isLoggedIn: boolean;
  isEmployer?: boolean;
  /** Icon shown before the section title. */
  icon?: React.ReactNode;
  /** Zero-based position in the list of sections. Even = white bg, odd = muted. Keeps alternating pattern correct if sections are missing. */
  sectionIndex: number;
  /** When true, show section with empty state instead of hiding when jobs.length === 0. */
  showWhenEmpty?: boolean;
};

export function JobsDiscoverSection({
  subheading,
  jobs,
  favoritedJobIds,
  isLoggedIn,
  isEmployer = false,
  icon,
  sectionIndex,
  showWhenEmpty = false,
}: Props) {
  const { ref: scrollRef, handlers } = useDragScroll<HTMLDivElement>();
  const smoothScroll = useSmoothScroll(scrollRef);

  const scroll = (dir: "left" | "right") => smoothScroll(dir, STEP);

  /** Every other section uses card-ish background for subtle alternation in both themes. */
  const isWhite = sectionIndex % 2 === 0;
  const sectionClassName = isWhite ? "bg-background" : "bg-muted/50";
  const fadeFromClassName = isWhite ? "from-background" : "from-muted/50";

  /** Same horizontal start as hero content so first card lines up. */
  const sliderPaddingLeft = `max(1rem, calc((100vw - ${CONTAINER_XL}px) / 2 + ${HERO_CONTENT_INSET_PX}px))`;

  if (jobs.length === 0 && !showWhenEmpty) return null;

  return (
    <section className={`py-8 md:py-10 ${sectionClassName}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[1200px] mb-6">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-heading md:text-3xl text-left flex items-center gap-3">
            {icon && (
              <span className="flex shrink-0 text-primary" aria-hidden>
                {icon}
              </span>
            )}
            {subheading}
          </h2>
        </div>
      </div>

      <div className="relative">
        {jobs.length > 0 ? (
          <>
            <div className="w-screen relative left-1/2 -translate-x-1/2">
              <div className="relative">
                <div
                  className={`pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r ${fadeFromClassName} to-transparent`}
                  aria-hidden
                />
                <div
                  ref={scrollRef}
                  {...handlers}
                  className="flex gap-4 overflow-x-auto scrollbar-hide [scroll-snap-type:x_mandatory] cursor-grab pr-0 min-w-0 [scroll-behavior:smooth]"
                  style={{ paddingLeft: sliderPaddingLeft }}
                >
                  {jobs.map((job) => (
                    <DiscoverJobCard
                      key={job.id}
                      job={job}
                      isFavorited={favoritedJobIds.has(job.id)}
                      isLoggedIn={isLoggedIn}
                      isEmployer={isEmployer}
                    />
                  ))}
                </div>
                <div
                  className={`pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l ${fadeFromClassName} to-transparent`}
                  aria-hidden
                />
              </div>
            </div>
            {jobs.length > 2 && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  aria-label="Previous jobs"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  aria-label="Next jobs"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-[1200px]">
              <p className="text-sm text-muted-foreground">
                No jobs in this section right now. Check back later.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
